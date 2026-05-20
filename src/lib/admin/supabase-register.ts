import { newId } from "@/lib/admin/crypto";
import { isSupabasePrimaryStore } from "@/lib/admin/store-supabase";
import {
  issueSessionFromSupabaseAccessToken,
  signInWithSupabasePassword,
} from "@/lib/admin/supabase-session";
import { logActivity, readDb, writeDb } from "@/lib/admin/store";
import { getSupabaseServerAnon, getSupabaseServiceRole } from "@/lib/supabase/server";
import { normalizeStaffRole } from "@/lib/admin/staff-role";
import type { StaffMember } from "@/types/admin";

export function isSupabaseAuthConfigured(): boolean {
  return isSupabasePrimaryStore() && Boolean(getSupabaseServerAnon());
}

/** Open registration when Supabase is configured. Set ADMIN_ALLOW_PUBLIC_REGISTER=false to lock down. */
export async function canRegisterAdmin(): Promise<{ allowed: boolean; reason?: string }> {
  if (!isSupabaseAuthConfigured()) {
    return {
      allowed: false,
      reason:
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL (project base only, no /rest/v1), SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }
  if (process.env.ADMIN_ALLOW_PUBLIC_REGISTER === "false") {
    const db = await readDb();
    if (db.staff.length > 0) {
      return {
        allowed: false,
        reason:
          "Public registration is disabled. Ask an existing admin to add you in Admin → Staff, or remove ADMIN_ALLOW_PUBLIC_REGISTER=false.",
      };
    }
  }
  return { allowed: true };
}

export type RegisterAdminInput = {
  name: string;
  email: string;
  password: string;
  role?: string;
};

export type RegisterAdminResult =
  | { ok: true; staff: Omit<StaffMember, "passwordHash">; sessionResponse?: Response; needsSignIn?: boolean }
  | { ok: false; status: number; error: string };

export async function registerAdminWithSupabase(input: RegisterAdminInput): Promise<RegisterAdminResult> {
  const gate = await canRegisterAdmin();
  if (!gate.allowed) {
    return { ok: false, status: 403, error: gate.reason ?? "Registration is not allowed" };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name || !email || password.length < 8) {
    return { ok: false, status: 422, error: "Name, email, and password (8+ characters) are required" };
  }

  const db = await readDb();
  if (db.staff.some((s) => s.email === email)) {
    return { ok: false, status: 409, error: "A staff account with this email already exists" };
  }

  const supa = getSupabaseServiceRole();
  if (!supa) {
    return { ok: false, status: 503, error: "Supabase service role is not configured" };
  }

  const role = db.staff.length === 0 ? "admin" : normalizeStaffRole(input.role, "handler");

  const { data: authData, error: authError } = await supa.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user?.id) {
    const msg = authError?.message ?? "Could not create Supabase user";
    if (/already registered|already exists|duplicate/i.test(msg)) {
      return { ok: false, status: 409, error: "This email is already registered in Supabase Auth" };
    }
    return { ok: false, status: 400, error: msg };
  }

  const authUserId = authData.user.id;
  const staffId = newId("staff");
  const now = new Date().toISOString();

  const staff: StaffMember = {
    id: staffId,
    name,
    email,
    passwordHash: "",
    role,
    active: true,
    createdAt: now,
    authUserId,
  };

  try {
    await writeDb((d) => {
      d.staff.push(staff);
      d.activity.unshift({
        id: newId("act"),
        at: now,
        actorId: staff.id,
        actorName: staff.name,
        action: db.staff.length === 0 ? "First admin registered (Supabase)" : "Staff registered (Supabase)",
        entityType: "staff",
        entityId: staff.id,
        detail: email,
      });
    });
  } catch (e) {
    await supa.auth.admin.deleteUser(authUserId);
    const msg = e instanceof Error ? e.message : "Failed to save staff profile";
    return { ok: false, status: 500, error: msg };
  }

  const signIn = await signInWithSupabasePassword(email, password);
  const { passwordHash: _, ...safe } = staff;

  if ("error" in signIn) {
    return { ok: true, staff: safe, needsSignIn: true };
  }

  const issued = await issueSessionFromSupabaseAccessToken(signIn.accessToken);
  if (!issued.ok) {
    return { ok: true, staff: safe, needsSignIn: true };
  }

  await logActivity({
    actorId: staff.id,
    actorName: staff.name,
    action: "Registered and signed in",
    entityType: "system",
  });

  return { ok: true, staff: safe, sessionResponse: issued.response };
}
