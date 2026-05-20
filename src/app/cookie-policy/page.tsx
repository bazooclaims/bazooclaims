import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie policy",
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Cookie policy</h1>
      <p className="mt-6 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        Placeholder for development. Document essential vs analytics cookies once analytics are
        wired.
      </p>
    </div>
  );
}
