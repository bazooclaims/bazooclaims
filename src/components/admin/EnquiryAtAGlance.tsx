import Link from "next/link";

import { EnquiryStatusBadge } from "@/components/admin/admin-badges";
import type { Enquiry } from "@/types/admin";

type Props = {
  enquiry: Enquiry;
  /** Claim reference (e.g. BZ-…) when this enquiry has been converted / linked */
  linkedClaimReference?: string;
};

export function EnquiryAtAGlance({ enquiry, linkedClaimReference }: Props) {
  const submitted = new Date(enquiry.createdAt).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const updated = new Date(enquiry.updatedAt).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const msg = enquiry.message?.trim() ?? "";

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-[var(--color-surface)]/10 bg-white shadow-md">
      <div className="border-b border-[var(--color-surface)]/10 bg-gradient-to-r from-[#002f3b] via-[#063848] to-[#0a4d5c] px-5 py-4 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-200/90">Web intake</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-100/80">
              Enquiry number
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{enquiry.reference}</h2>
            {enquiry.clientReference?.trim() ? (
              <p className="mt-2 text-sm font-medium text-teal-50/95">
                Their reference: <span className="font-mono tracking-wide">{enquiry.clientReference.trim()}</span>
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <EnquiryStatusBadge status={enquiry.status} />
              {enquiry.consent ? (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-100 ring-1 ring-white/20">
                  Consent recorded
                </span>
              ) : null}
            </div>
          </div>
          <div className="text-right text-sm text-teal-50/95">
            <p className="text-xs uppercase tracking-wider text-white/60">Vehicle</p>
            <p className="font-mono text-lg font-semibold tracking-wide">{enquiry.vehicleRegistration}</p>
            {enquiry.claimId ? (
              <div className="mt-2 text-xs text-white/90">
                <p className="text-[10px] uppercase tracking-wider text-white/55">Claim created</p>
                <Link
                  href={`/admin/claims/${enquiry.claimId}`}
                  className="mt-1 inline-flex flex-col items-end gap-0.5 font-semibold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white"
                >
                  {linkedClaimReference ? (
                    <span className="font-mono text-base tracking-wide">{linkedClaimReference}</span>
                  ) : null}
                  <span className="text-[11px] font-medium">Open claim file →</span>
                </Link>
              </div>
            ) : (
              <div className="mt-2 text-xs text-teal-100/85">
                <p className="text-[10px] uppercase tracking-wider text-white/55">Claim</p>
                <p className="mt-0.5 font-medium text-teal-50/90">Not created yet — use Create claim below.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Contact</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-ink)]">{enquiry.fullName}</p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{enquiry.email}</p>
          <p className="text-sm font-medium text-[var(--color-surface)]">{enquiry.phone}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Incident</p>
          <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">{enquiry.incidentDate}</p>
          <p className="mt-0.5 text-xs capitalize text-[var(--color-ink-muted)]">
            {enquiry.faultStatus.replace(/_/g, " ")}
          </p>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
            Submitted
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink)]">{submitted}</p>
          <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">Last update · {updated}</p>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Their message</p>
          <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-ink)]">
            {msg.length > 0 ? msg : "— No message text was left with this submission."}
          </p>
        </div>
      </div>

      <details className="border-t border-[var(--color-surface)]/10 bg-[var(--color-band)]/30 px-5 py-3 text-xs text-[var(--color-ink-muted)]">
        <summary className="cursor-pointer font-medium text-[var(--color-ink)]">Technical reference (internal)</summary>
        <p className="mt-2 font-mono text-[11px] break-all text-[var(--color-ink-muted)]">{enquiry.id}</p>
        <p className="mt-2">
          Use this ID only for support or integrations — the lead sees enquiry number <strong>{enquiry.reference}</strong>
          {enquiry.clientReference?.trim()
            ? <> and their own reference <strong>{enquiry.clientReference.trim()}</strong></>
            : null}
          .
        </p>
      </details>
    </section>
  );
}
