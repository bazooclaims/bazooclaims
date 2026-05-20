import { NextResponse } from "next/server";

import { issueSessionFromSupabaseAccessToken } from "@/lib/admin/supabase-session";
import { bootstrapAdminIfNeeded } from "@/lib/admin/store";
import { getSupabaseServiceRole } from "@/lib/supabase/server";

/**
 * Exchange a Supabase access JWT (e.g. from a native client) for the BAZOO admin session cookie.
 * Prefer POST /api/admin/auth/login with email/password — it signs in on the server without a browser SDK.
 */
export async function POST(request: Request) {
  await bootstrapAdminIfNeeded();
  if (!getSupabaseServiceRole()) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured on the server" },
      { status: 503 },
    );
  }

  let body: { access_token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const token = (body.access_token ?? "").trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "access_token required" }, { status: 422 });
  }

  const issued = await issueSessionFromSupabaseAccessToken(token);
  if (!issued.ok) return NextResponse.json(issued.body, { status: issued.status });
  return issued.response;
}
