import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Privacy policy</h1>
      <p className="mt-6 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        Placeholder legal page for development. Replace with counsel-approved wording before
        production. Claim form submissions are currently stored only in server logs when you
        add persistence — Supabase is not connected in this build.
      </p>
    </div>
  );
}
