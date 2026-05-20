import type { Metadata } from "next";

import { StartClaimForm } from "@/components/forms/StartClaimForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Start your enquiry",
  description: `Submit a motor incident enquiry to ${siteConfig.name}. A claim file is only opened after our team reviews it.`,
};

export default function StartYourClaimPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:max-w-4xl lg:px-8">
      <header className="text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          Start your enquiry
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)] sm:mx-0 sm:mt-4 sm:text-base">
          Complete the secure 6-step wizard below. We log this as an <strong className="text-[var(--color-ink)]">enquiry</strong>{" "}
          first — we only open a formal <strong className="text-[var(--color-ink)]">claim</strong> file if we take your
          case forward (you will then get a separate claim reference).
        </p>
      </header>
      <div className="mt-8 sm:mt-10 pb-[max(5rem,env(safe-area-inset-bottom))]">
        <StartClaimForm />
      </div>
    </div>
  );
}
