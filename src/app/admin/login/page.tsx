import Link from "next/link";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = {
  title: "Admin login",
};

export default function AdminLoginPage() {
  const supabaseOnly =
    process.env.ADMIN_SUPABASE_AUTH_ONLY === "true" ||
    Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--color-surface-2)] p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-soft)]">
          Bazoo Claims
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Admin sign in</h1>
        <p className="mt-2 text-sm text-white/70">
          Sign in with your <strong className="text-white/90">Supabase</strong> email and password.
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-white/60">Loading…</p>}>
          <AdminLoginForm />
        </Suspense>
        <p className="mt-6 text-center text-xs text-white/45">
          {supabaseOnly ? (
            <>
              Supabase Auth only — no local password file.{" "}
              <Link href="/admin/register" className="text-[var(--color-accent)] hover:underline">
                Register the first admin
              </Link>{" "}
              if none exists yet.
            </>
          ) : (
            <>
              With Supabase configured, Supabase is tried first.{" "}
              <Link href="/admin/register" className="text-[var(--color-accent)] hover:underline">
                Register
              </Link>{" "}
              when using Supabase as the database.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
