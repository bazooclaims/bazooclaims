import { NextResponse } from "next/server";

import {
  clearSessionCookieHeader,
  createSessionCookie,
  setSessionCookieHeader,
} from "@/lib/admin/auth";
import {
  issueSessionFromSupabaseAccessToken,
  signInWithSupabasePassword,
} from "@/lib/admin/supabase-session";
import { verifyPassword } from "@/lib/admin/crypto";
import { bootstrapAdminIfNeeded, logActivity, readDb } from "@/lib/admin/store";
import { isSupabasePrimaryStore } from "@/lib/admin/store-supabase";
import { getSupabaseServerAnon, getSupabaseServiceRole } from "@/lib/supabase/server";

export async function POST(request: Request) {
  await bootstrapAdminIfNeeded();
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password required" }, { status: 422 });
  }

  const supabaseOnly =
    process.env.ADMIN_SUPABASE_AUTH_ONLY === "true" || isSupabasePrimaryStore();
  const anon = getSupabaseServerAnon();
  const service = getSupabaseServiceRole();

  if (supabaseOnly && (!anon || !service)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ADMIN_SUPABASE_AUTH_ONLY requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 },
    );
  }

  if (supabaseOnly) {
    const signIn = await signInWithSupabasePassword(email, password);
    if ("error" in signIn) {
      return NextResponse.json({ ok: false, error: signIn.error }, { status: signIn.status });
    }
    const issued = await issueSessionFromSupabaseAccessToken(signIn.accessToken);
    if (!issued.ok) return NextResponse.json(issued.body, { status: issued.status });
    return issued.response;
  }

  if (!supabaseOnly && anon) {
    const signIn = await signInWithSupabasePassword(email, password);
    if ("accessToken" in signIn) {
      const issued = await issueSessionFromSupabaseAccessToken(signIn.accessToken);
      if (issued.ok) return issued.response;
      if (issued.status === 403) {
        return NextResponse.json(issued.body, { status: 403 });
      }
      return NextResponse.json(issued.body, { status: issued.status });
    }
    if (signIn.status !== 401) {
      return NextResponse.json({ ok: false, error: signIn.error }, { status: signIn.status });
    }
  }

  if (supabaseOnly) {
    return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
  }

  const db = await readDb();
  const staff = db.staff.find((s) => s.email === email && s.active);
  if (!staff || !verifyPassword(password, staff.passwordHash)) {
    return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSessionCookie(staff.id);
  await logActivity({
    actorId: staff.id,
    actorName: staff.name,
    action: "Logged in",
    entityType: "system",
  });

  const res = NextResponse.json({
    ok: true,
    staff: { id: staff.id, name: staff.name, email: staff.email, role: staff.role },
  });
  res.headers.set("Set-Cookie", setSessionCookieHeader(token));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", clearSessionCookieHeader());
  return res;
}
