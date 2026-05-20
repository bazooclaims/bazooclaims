import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vehicle replacement",
  description:
    "Like-for-like or closest practical replacement vehicles after a non-fault accident.",
};

export default function VehicleReplacementPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        Vehicle replacement made straightforward
      </h1>
      <div className="mt-8 max-w-none space-y-4 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
        <p>
          After a non-fault collision, staying mobile is critical. We coordinate credit hire or
          replacement provision in line with eligibility, liability, and insurer protocols — with
          one UK-based team accountable for your file from first call to settlement.
        </p>
        <h2 className="mt-10 text-xl font-semibold text-[var(--color-surface)]">What we aim for</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--color-ink-muted)]">
          <li>Clear handover: vehicle class, fuel type, transmission, and accessibility needs.</li>
          <li>Fast triage: paperwork, ID, and third-party details captured once.</li>
          <li>Repair alignment: replacement duration matched to realistic repair timelines.</li>
        </ul>
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
