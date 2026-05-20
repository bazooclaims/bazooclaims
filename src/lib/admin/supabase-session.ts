import { NextResponse } from "next/server";

import { createSessionCookie, setSessionCookieHeader } from "@/lib/admin/auth";
import { logActivity, readDb } from "@/lib/admin/store";
import { getSupabaseServerAnon, getSupabaseServiceRole } from "@/lib/supabase/server";

type IssueResult =
  | { ok: true; response: NextResponse }
  | { ok: false; status: number; body: { ok: false; error: string } };

/** Supabase email/password from the server (anon key). */
export async function signInWithSupabasePassword(
  email: string,
  password: string,
): Promise<{ accessToken: string } | { error: string; status: number }> {
  const anon = getSupabaseServerAnon();
  if (!anon) {
    return { error: "Supabase URL/anon key not configured", status: 503 };
  }
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    return { error: error?.message ?? "Invalid email or password", status: 401 };
  }
  return { accessToken: data.session.access_token };
}

/** Validate JWT with service role and set BAZOO admin session cookie. */
export async function issueSessionFromSupabaseAccessToken(accessToken: string): Promise<IssueResult> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) {
    return {
      ok: false,
      status: 503,
      body: { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
    };
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user?.email) {
    return {
      ok: false,
      status: 401,
      body: { ok: false, error: "Invalid or expired Supabase session" },
    };
  }

  const email = data.user.email.trim().toLowerCase();
  const db = await readDb();
  const staff = db.staff.find((s) => s.email === email && s.active);
  if (!staff) {
    return {
      ok: false,
      status: 403,
      body: {
        ok: false,
        error:
          "No staff profile for this email. Add this user in Admin → Staff with the same email as their Supabase account.",
      },
    };
  }

  const sessionToken = await createSessionCookie(staff.id);
  await logActivity({
    actorId: staff.id,
    actorName: staff.name,
    action: "Logged in (Supabase)",
    entityType: "system",
  });

  const res = NextResponse.json({
    ok: true,
    staff: { id: staff.id, name: staff.name, email: staff.email, role: staff.role },
  });
  res.headers.set("Set-Cookie", setSessionCookieHeader(sessionToken));
  return { ok: true, response: res };
}
