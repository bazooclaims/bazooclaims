import type { Metadata } from "next";
import Link from "next/link";

import { KeyInformationSection } from "@/components/sections/KeyInformationSection";
import { WorkflowSection } from "@/components/sections/WorkflowSection";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "How it works",
  description: `Workflow and key information for UK motor claims with ${siteConfig.name}.`,
};

export default function HowItWorksPage() {
  return (
    <div>
      <div className="border-b border-[var(--color-surface)]/10 bg-[var(--color-band)]/60 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            How everything works
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
            Below is the end-to-end workflow we aim to follow, then fifteen practical notes most
            drivers ask about. Nothing here replaces advice on your individual file — it is a map of
            how {siteConfig.name} typically operates.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/start-your-claim"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-surface-2)] touch-manipulation"
            >
              Start your claim
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--color-surface)]/20 bg-[var(--color-page-elevated)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] hover:bg-white touch-manipulation"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
      <WorkflowSection />
      <KeyInformationSection />
      <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">
        <p className="text-sm text-[var(--color-ink-muted)]">
          Ready to begin? Use the secure wizard — it keeps your answers in one place for our
          handlers.
        </p>
        <Link
          href="/start-your-claim"
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-[#002a35] shadow-sm hover:brightness-110 touch-manipulation"
        >
          Open claim wizard
        </Link>
      </div>
    </div>
  );
}
