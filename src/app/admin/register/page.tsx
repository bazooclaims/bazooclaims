import { Suspense } from "react";

import { AdminRegisterForm } from "@/components/admin/AdminRegisterForm";

export const metadata = {
  title: "Admin register",
};

export default function AdminRegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--color-surface-2)] p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-soft)]">
          Bazoo Claims
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Create admin account</h1>
        <p className="mt-2 text-sm text-white/70">
          Registers you in <strong className="text-white/90">Supabase Auth</strong> and creates a matching staff
          profile in the CRM. No local password file is used.
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-white/60">Loading…</p>}>
          <AdminRegisterForm />
        </Suspense>
        <p className="mt-6 text-center text-xs text-white/45">
          The first account is an admin; additional sign-ups are staff admins too unless you lock registration with{" "}
          <code className="text-white/60">ADMIN_ALLOW_PUBLIC_REGISTER=false</code>.
        </p>
      </div>
    </div>
  );
}
