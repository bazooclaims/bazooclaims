import { NextResponse } from "next/server";

import {
  assertSessionSigningReady,
  getAdminAuthConfigStatus,
  getSupabaseAdminAuthBlocker,
} from "@/lib/admin/auth-config";
import { canRegisterAdmin, registerAdminWithSupabase } from "@/lib/admin/supabase-register";

export async function GET() {
  const config = getAdminAuthConfigStatus();
  const gate = await canRegisterAdmin();
  return NextResponse.json({
    ok: config.ready && gate.allowed,
    canRegister: gate.allowed,
    reason: gate.reason ?? (config.issues[0] ?? undefined),
    config,
    supabaseRequired: true,
  });
}

export async function POST(request: Request) {
  const configBlocker = getSupabaseAdminAuthBlocker();
  if (configBlocker) {
    return NextResponse.json({ ok: false, error: configBlocker }, { status: 503 });
  }

  try {
    assertSessionSigningReady();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server configuration error";
    return NextResponse.json({ ok: false, error: msg }, { status: 503 });
  }

  let body: { name?: string; email?: string; password?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  let result;
  try {
    result = await registerAdminWithSupabase({
      name: body.name ?? "",
      email: body.email ?? "",
      password: body.password ?? "",
      role: body.role === "handler" ? "handler" : "admin",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("ADMIN_SESSION_SECRET") || /Supabase/i.test(msg)) {
      return NextResponse.json({ ok: false, error: msg }, { status: 503 });
    }
    console.error("[admin/auth/register]", e);
    return NextResponse.json(
      { ok: false, error: "Registration failed due to a server error" },
      { status: 500 },
    );
  }

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  if (result.needsSignIn || !result.sessionResponse) {
    return NextResponse.json(
      {
        ok: true,
        staff: result.staff,
        needsSignIn: true,
        message: "Account created. Sign in with your email and password.",
      },
      { status: 201 },
    );
  }

  const res = NextResponse.json({ ok: true, staff: result.staff }, { status: 201 });
  const setCookie = result.sessionResponse.headers.get("Set-Cookie");
  if (setCookie) res.headers.set("Set-Cookie", setCookie);
  return res;
}
