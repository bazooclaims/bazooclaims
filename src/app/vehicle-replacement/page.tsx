import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Vehicle replacement",
  description:
    "Like-for-like or closest practical replacement vehicles after a non-fault accident — coordinated by Bazoo Claims.",
};

export default function VehicleReplacementPage() {
  return (
    <div>
      <div className="border-b border-[var(--color-surface)]/10 bg-[var(--color-band)]/60 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            Vehicle replacement made straightforward
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
            After a non-fault collision, staying mobile is critical. {siteConfig.name} coordinates
            credit hire or replacement provision in line with eligibility, liability, and insurer
            protocols — with one UK-based team accountable for your file from first call to
            settlement.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
          <section>
            <h2 className="text-xl font-semibold text-[var(--color-surface)]">What we aim for</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-[var(--color-ink)]">Clear handover</strong> — vehicle class,
                fuel type, transmission, and accessibility needs captured up front.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Fast triage</strong> — paperwork, ID,
                and third-party details recorded once in our CRM.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Repair alignment</strong> — replacement
                duration matched to realistic repair timelines where possible.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-surface)]">Typical process</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5">
              <li>You submit an enquiry via our wizard or WhatsApp.</li>
              <li>We confirm liability indicators and insurer details.</li>
              <li>A suitable replacement is arranged with an approved supplier.</li>
              <li>Your own vehicle is repaired or total-loss handled in parallel.</li>
              <li>Replacement is returned when repairs complete or settlement is agreed.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-surface)]">Eligibility</h2>
            <p className="mt-4">
              Replacement is usually considered where another party is at fault and insurers accept
              liability, or where your policy provides hire cover. We explain funding before you
              commit — see{" "}
              <Link href="/why-its-free" className="font-medium text-[var(--color-surface)] underline">
                Why it&apos;s free
              </Link>
              . Nothing here guarantees a particular vehicle grade or hire period.
            </p>
          </section>

          <section className="rounded-xl border border-[var(--color-surface)]/10 bg-[var(--color-band)]/40 p-5">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Ready to start?</h2>
            <p className="mt-2 text-sm">
              Complete the secure enquiry wizard — your details are saved to our CRM and you can send
              a copy to us on WhatsApp in one tap.
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
