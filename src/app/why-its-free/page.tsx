import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why it’s free",
  description: "How non-fault motor claims are funded and what eligibility means in practice.",
};

export default function WhyItsFreePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        Why the core service is free for eligible non-fault claims
      </h1>
      <div className="mt-8 max-w-none space-y-4 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
        <p>
          In many non-fault scenarios, the at-fault driver&apos;s insurer ultimately meets
          reasonable costs for hire, storage, and repairs — subject to terms, evidence, and
          regulatory requirements. You are not asked to pay upfront for the managed pathway we
          describe during onboarding.
        </p>
        <h2 className="mt-10 text-xl font-semibold text-[var(--color-surface)]">Transparency first</h2>
        <p>
          We explain what is recoverable, what might be disputed, and what happens if liability
          changes. Nothing substitutes for individual advice on your specific facts.
        </p>
      </div>
      <Link
        href="/start-your-claim"
        className="mt-10 inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-surface-2)] touch-manipulation"
      >
        Start your claim
      </Link>
    </div>
  );
}
