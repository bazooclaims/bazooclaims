import { NextResponse } from "next/server";

import { canRegisterAdmin, registerAdminWithSupabase } from "@/lib/admin/supabase-register";

export async function GET() {
  const gate = await canRegisterAdmin();
  return NextResponse.json({
    ok: true,
    canRegister: gate.allowed,
    reason: gate.reason,
    supabaseRequired: true,
  });
}

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const result = await registerAdminWithSupabase({
    name: body.name ?? "",
    email: body.email ?? "",
    password: body.password ?? "",
    role: body.role === "handler" ? "handler" : "admin",
  });

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
