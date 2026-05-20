import { getSessionSecret } from "@/lib/admin/crypto";
import { isSupabasePrimaryStore } from "@/lib/admin/store-supabase";
import { getSupabaseServerAnon, getSupabaseServiceRole } from "@/lib/supabase/server";
import { normalizeSupabaseUrl } from "@/lib/supabase/normalize-url";

export type AdminAuthConfigStatus = {
  ready: boolean;
  supabasePrimary: boolean;
  supabaseAuthOnly: boolean;
  supabaseUrl: boolean;
  supabaseAnonKey: boolean;
  supabaseServiceRole: boolean;
  sessionSecret: boolean;
  issues: string[];
};

/** Safe for GET /api/admin/auth/status — never exposes secret values. */
export function getAdminAuthConfigStatus(): AdminAuthConfigStatus {
  const supabaseUrl = Boolean(normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL));
  const supabaseAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
  const supabaseServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const secretLen = process.env.ADMIN_SESSION_SECRET?.trim().length ?? 0;
  const sessionSecret = secretLen >= 16;
  const supabasePrimary = isSupabasePrimaryStore();
  const supabaseAuthOnly =
    process.env.ADMIN_SUPABASE_AUTH_ONLY === "true" || supabasePrimary;

  const issues: string[] = [];
  if (!sessionSecret) {
    issues.push(
      secretLen > 0
        ? `ADMIN_SESSION_SECRET is only ${secretLen} characters — use at least 16, then redeploy.`
        : "Set ADMIN_SESSION_SECRET (min 16 characters) in Vercel/host env and redeploy.",
    );
  }
  if (supabaseAuthOnly || supabasePrimary) {
    if (!supabaseUrl) issues.push("Set NEXT_PUBLIC_SUPABASE_URL (base URL only, e.g. https://xxx.supabase.co).");
    if (!supabaseAnonKey) issues.push("Set NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    if (!supabaseServiceRole) issues.push("Set SUPABASE_SERVICE_ROLE_KEY (server-only).");
  }

  const ready = issues.length === 0;

  return {
    ready,
    supabasePrimary,
    supabaseAuthOnly,
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRole,
    sessionSecret,
    issues,
  };
}

/** Throws if session signing is not configured (production). */
export function assertSessionSigningReady(): void {
  getSessionSecret();
}

/** Returns a user-facing error when Supabase admin auth cannot run. */
export function getSupabaseAdminAuthBlocker(): string | null {
  const status = getAdminAuthConfigStatus();
  if (status.ready) return null;
  return status.issues.join(" ");
}

export function isSupabaseAdminAuthMode(): boolean {
  return (
    process.env.ADMIN_SUPABASE_AUTH_ONLY === "true" || isSupabasePrimaryStore()
  );
}

export function requireSupabaseClientsForLogin():
  | { anon: NonNullable<ReturnType<typeof getSupabaseServerAnon>>; service: NonNullable<ReturnType<typeof getSupabaseServiceRole>> }
  | { error: string } {
  const anon = getSupabaseServerAnon();
  const service = getSupabaseServiceRole();
  if (!anon || !service) {
    return {
      error:
        "Supabase is not fully configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }
  return { anon, service };
}
