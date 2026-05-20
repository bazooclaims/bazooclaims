import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & conditions",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
        Terms & conditions
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        Placeholder for development. Add FCA / claims management disclosures and contractual
        terms as required for your regulated activities.
      </p>
    </div>
  );
}
