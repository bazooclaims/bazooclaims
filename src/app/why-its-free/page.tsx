import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Why it’s free",
  description: "How non-fault motor claims are funded and what eligibility means in practice.",
};

export default function WhyItsFreePage() {
  return (
    <div>
      <div className="border-b border-[var(--color-surface)]/10 bg-[var(--color-band)]/60 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            Why the core service is free for eligible non-fault claims
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
            Many drivers ask how {siteConfig.name} can manage an accident without charging upfront.
            The short answer: in many non-fault cases, reasonable costs are recovered from the
            at-fault driver&apos;s insurer — not from you — subject to evidence, terms, and
            regulatory requirements.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
          <section>
            <h2 className="text-xl font-semibold text-[var(--color-surface)]">How funding works</h2>
            <p className="mt-4">
              When another party is liable, their insurer may meet costs such as hire, storage,
              recovery, and administration under common UK motor insurance practice. We manage the
              process and present costs in line with what insurers expect — you are not asked to
              pay upfront for the managed pathway we describe during onboarding.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-surface)]">Transparency first</h2>
            <p className="mt-4">
              We explain what is recoverable, what might be disputed, and what happens if liability
              changes mid-case. If fault is split or denied, we tell you early what options remain
              (including using your own policy or self-funding). Nothing on this page substitutes
              for individual advice on your specific facts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-surface)]">What might not be covered</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>Policy excesses on your own insurance if you claim there instead.</li>
              <li>Disputed hire periods where repairs finish sooner than expected.</li>
              <li>Upgrades beyond like-for-like replacement without agreement.</li>
              <li>Matters outside accident management (e.g. unrelated mechanical faults).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-surface)]">No-claims and your policy</h2>
            <p className="mt-4">
              On many non-fault routes, the incident may not be recorded as a claim on your own
              policy — but this depends on insurer practice and the route taken. We discuss
              no-claims implications before you instruct us. See also our{" "}
              <Link href="/how-it-works" className="font-medium text-[var(--color-surface)] underline">
                How it works
              </Link>{" "}
              page for the full workflow.
            </p>
          </section>

          <section className="rounded-xl border border-[var(--color-surface)]/10 bg-[var(--color-band)]/40 p-5">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Check if we can help</h2>
            <p className="mt-2 text-sm">
              Submit a free enquiry — we review eligibility and call you back. Your information is
              stored securely in our CRM.
            </p>
            <Link
              href="/start-your-claim"
              className="mt-4 inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-surface-2)] touch-manipulation"
            >
              Start your enquiry
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
