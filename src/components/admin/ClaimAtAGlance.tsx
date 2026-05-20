import Link from "next/link";

import { ClaimStatusBadge, PriorityBadge } from "@/components/admin/admin-badges";
import type { AdminClaim } from "@/types/admin";

export function ClaimAtAGlance({
  claim,
  assigneeName,
  linkedInvoices,
}: {
  claim: AdminClaim;
  assigneeName?: string;
  linkedInvoices: { id: string; number: string }[];
}) {
  const addr = claim.clientAddress?.trim();

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-[var(--color-surface)]/10 bg-white shadow-md">
      <div className="border-b border-[var(--color-surface)]/10 bg-gradient-to-r from-[#002f3b] via-[#063848] to-[#0a4d5c] px-5 py-4 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-200/90">Claim</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{claim.reference}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ClaimStatusBadge status={claim.status} />
              <PriorityBadge priority={claim.priority} />
            </div>
          </div>
          <div className="text-right text-sm text-teal-50/95">
            <p className="text-xs uppercase tracking-wider text-white/60">Vehicle</p>
            <p className="font-mono text-lg font-semibold tracking-wide">{claim.vehicleRegistration}</p>
            {claim.vehicleMakeModel?.trim() ? (
              <p className="mt-1 max-w-[14rem] text-xs leading-snug text-teal-100/95 sm:ml-auto sm:text-right">
                {claim.vehicleMakeModel}
              </p>
            ) : null}
            {linkedInvoices.length > 0 ? (
              <div className="mt-2 text-xs text-white/85">
                <p className="text-[10px] uppercase tracking-wider text-white/55">Invoices</p>
                <div className="mt-1 flex flex-wrap justify-end gap-x-2 gap-y-1">
                  {linkedInvoices.map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/admin/invoices/${inv.id}`}
                      className="font-medium text-white underline decoration-white/40 underline-offset-2 hover:decoration-white"
                    >
                      {inv.number}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Client</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-ink)]">{claim.fullName}</p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{claim.email}</p>
          <p className="text-sm font-medium text-[var(--color-surface)]">{claim.phone}</p>
        </div>
        <div className="sm:col-span-1 lg:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Address</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-ink)]">
            {addr && addr.length > 0 ? addr : "— Add the client’s address in the form below."}
          </p>
        </div>
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Assigned</p>
            <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">{assigneeName ?? "Unassigned"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Incident</p>
            <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">{claim.incidentDate}</p>
            <p className="mt-0.5 text-xs capitalize text-[var(--color-ink-muted)]">{claim.faultStatus.replace(/_/g, " ")}</p>
          </div>
          {claim.thirdPartyVehicleMakeModel?.trim() || claim.thirdPartyDetails?.trim() ? (
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Third party
              </p>
              {claim.thirdPartyVehicleMakeModel?.trim() ? (
                <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">{claim.thirdPartyVehicleMakeModel}</p>
              ) : null}
              {claim.thirdPartyDetails?.trim() ? (
                <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-[var(--color-ink-muted)]">
                  {claim.thirdPartyDetails}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <details className="border-t border-[var(--color-surface)]/10 bg-[var(--color-band)]/30 px-5 py-3 text-xs text-[var(--color-ink-muted)]">
        <summary className="cursor-pointer font-medium text-[var(--color-ink)]">Technical reference (internal)</summary>
        <p className="mt-2 font-mono text-[11px] break-all text-[var(--color-ink-muted)]">{claim.id}</p>
        <p className="mt-2">Use this ID only for support or integrations — clients see {claim.reference}.</p>
      </details>
    </section>
  );
}
