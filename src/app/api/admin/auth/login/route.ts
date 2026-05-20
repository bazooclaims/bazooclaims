import { NextResponse } from "next/server";

import {
  clearSessionCookieHeader,
  createSessionCookie,
  setSessionCookieHeader,
} from "@/lib/admin/auth";
import {
  assertSessionSigningReady,
  getSupabaseAdminAuthBlocker,
  isSupabaseAdminAuthMode,
  requireSupabaseClientsForLogin,
} from "@/lib/admin/auth-config";
import {
  issueSessionFromSupabaseAccessToken,
  signInWithSupabasePassword,
} from "@/lib/admin/supabase-session";
import { verifyPassword } from "@/lib/admin/crypto";
import { bootstrapAdminIfNeeded, logActivity, readDb } from "@/lib/admin/store";
import { getSupabaseServerAnon } from "@/lib/supabase/server";

function configErrorResponse(message: string, status = 503): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function handleConfigError(e: unknown): NextResponse | null {
  const msg = e instanceof Error ? e.message : "";
  if (!msg) return null;
  if (
    msg.includes("ADMIN_SESSION_SECRET") ||
    /Supabase (read|not configured)/i.test(msg) ||
    msg.includes("Supabase read failed")
  ) {
    return configErrorResponse(msg);
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const configBlocker = getSupabaseAdminAuthBlocker();
    if (configBlocker && isSupabaseAdminAuthMode()) {
      return configErrorResponse(configBlocker);
    }

    try {
      assertSessionSigningReady();
    } catch (e) {
      const res = handleConfigError(e);
      if (res) return res;
      throw e;
    }

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

    const supabaseOnly = isSupabaseAdminAuthMode();

    if (supabaseOnly) {
      const clients = requireSupabaseClientsForLogin();
      if ("error" in clients) {
        return configErrorResponse(clients.error);
      }

      const signIn = await signInWithSupabasePassword(email, password);
      if ("error" in signIn) {
        return NextResponse.json({ ok: false, error: signIn.error }, { status: signIn.status });
      }

      const issued = await issueSessionFromSupabaseAccessToken(signIn.accessToken);
      if (!issued.ok) return NextResponse.json(issued.body, { status: issued.status });
      return issued.response;
    }

    const anon = getSupabaseServerAnon();
    if (anon) {
      const signIn = await signInWithSupabasePassword(email, password);
      if ("accessToken" in signIn) {
        const issued = await issueSessionFromSupabaseAccessToken(signIn.accessToken);
        if (issued.ok) return issued.response;
        return NextResponse.json(issued.body, { status: issued.status });
      }
      if (signIn.status !== 401) {
        return NextResponse.json({ ok: false, error: signIn.error }, { status: signIn.status });
      }
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
  } catch (e) {
    const config = handleConfigError(e);
    if (config) return config;
    console.error("[admin/auth/login]", e);
    return NextResponse.json(
      { ok: false, error: "Login failed due to a server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", clearSessionCookieHeader());
  return res;
}
