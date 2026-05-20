"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import { invoicePdfTotals } from "@/lib/admin/invoice-math";
import type { Invoice, InvoiceStatus } from "@/types/admin";

const STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "void"];

const viewBtn =
  "inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95";
const exportBtn =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-surface)]/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink)] shadow-sm transition hover:bg-[var(--color-band)]/60";
const eyeBtn =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--color-surface)]/20 bg-white text-[var(--color-surface)] shadow-sm transition hover:bg-[var(--color-band)]/60";

function IconEye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className={className ?? "size-4"}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function invoiceAbout(i: Invoice): string {
  const fromLines = i.lines
    .map((l) => l.description.trim())
    .filter(Boolean)
    .join(" · ");
  if (fromLines) return fromLines.length > 110 ? `${fromLines.slice(0, 110)}…` : fromLines;
  const n = i.notes?.trim();
  if (n) return n.length > 110 ? `${n.slice(0, 110)}…` : n;
  return "—";
}

function InvoiceStatusQuickSelect({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [status, setStatus] = useState(invoice.status);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus(invoice.status);
  }, [invoice.id, invoice.status]);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as InvoiceStatus;
    const prev = status;
    setStatus(next);
    setBusy(true);
    const res = await fetch(`/api/admin/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      setStatus(prev);
      e.target.value = prev;
    }
  }

  return (
    <select
      value={status}
      disabled={busy}
      onChange={onChange}
      className="max-w-[9.5rem] cursor-pointer rounded-lg border border-[var(--color-surface)]/20 bg-white py-1.5 pl-2 pr-7 text-xs font-semibold capitalize text-[var(--color-ink)] shadow-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/25 disabled:opacity-60"
      aria-label={`Status for invoice ${invoice.number}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

function InvoiceQuickViewModal({
  invoice,
  claimRef,
  onClose,
}: {
  invoice: Invoice;
  claimRef: string | undefined;
  onClose: () => void;
}) {
  const totals = invoicePdfTotals(invoice);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qv-title"
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--color-surface)]/15 bg-white p-5 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p id="qv-title" className="text-lg font-semibold text-[var(--color-ink)]">
              {invoice.number}
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              {invoice.clientName}
              {invoice.claimId && claimRef ? (
                <>
                  {" "}
                  · Claim{" "}
                  <Link href={`/admin/claims/${invoice.claimId}`} className="font-medium text-[var(--color-surface)] underline">
                    {claimRef}
                  </Link>
                </>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--color-surface)]/15 px-2 py-1 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-band)]"
          >
            Close
          </button>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">What it covers</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink)]">{invoiceAbout(invoice)}</p>

        <ul className="mt-4 divide-y divide-[var(--color-surface)]/10 rounded-lg border border-[var(--color-surface)]/10 text-sm">
          {invoice.lines.map((l) => (
            <li key={l.id} className="flex justify-between gap-3 px-3 py-2">
              <span className="min-w-0 text-[var(--color-ink)]">{l.description || "—"}</span>
              <span className="shrink-0 tabular-nums text-[var(--color-ink-muted)]">
                {l.quantity} × £{l.unitPrice.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-surface)]/10 pt-4 text-sm">
          <span className="font-medium text-[var(--color-ink)]">
            {totals.showTaxOnPdf !== false ? "Total inc VAT" : "Total"}
          </span>
          <span className="text-lg font-semibold tabular-nums text-[var(--color-surface)]">£{totals.total.toFixed(2)}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/admin/invoices/${invoice.id}`} className={viewBtn + " px-4"}>
            Open full page
          </Link>
          <a
            href={`/admin/invoices/${invoice.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className={exportBtn + " px-4"}
          >
            Export PDF
          </a>
        </div>
      </div>
    </div>
  );
}

type Props = {
  rows: Invoice[];
  /** claimId → reference for display (built on the server, JSON-serializable). */
  claimRefById: Record<string, string>;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  searchParams?: Record<string, string>;
};

export function InvoicesTable({
  rows,
  claimRefById,
  page,
  totalPages,
  total,
  pageSize,
  searchParams,
}: Props) {
  const [quickView, setQuickView] = useState<Invoice | null>(null);
  const closeQuick = useCallback(() => setQuickView(null), []);

  const columns: Column<Invoice>[] = [
    {
      key: "num",
      header: "Number",
      render: (i) => (
        <Link href={`/admin/invoices/${i.id}`} className="font-semibold text-[var(--color-surface)] hover:underline">
          {i.number}
        </Link>
      ),
    },
    {
      key: "about",
      header: "About",
      render: (i) => (
        <p className="max-w-[14rem] text-xs leading-snug text-[var(--color-ink)] sm:max-w-[18rem]" title={invoiceAbout(i)}>
          {invoiceAbout(i)}
        </p>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (i) => (
        <div className="min-w-0 max-w-[11rem]">
          <p className="truncate font-medium text-[var(--color-ink)]">{i.clientName}</p>
          {i.clientEmail ? <p className="truncate text-xs text-[var(--color-ink-muted)]">{i.clientEmail}</p> : null}
          {i.clientPhone ? (
            <p className="truncate font-mono text-xs text-[var(--color-ink-muted)]">{i.clientPhone}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "claim",
      header: "Claim",
      render: (i) => {
        if (!i.claimId) return <span className="text-[var(--color-ink-muted)]">—</span>;
        const ref = claimRefById[i.claimId];
        return ref ? (
          <Link href={`/admin/claims/${i.claimId}`} className="font-medium text-[var(--color-surface)] hover:underline">
            {ref}
          </Link>
        ) : (
          "—"
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (i) => <InvoiceStatusQuickSelect invoice={i} />,
    },
    {
      key: "total",
      header: "Total",
      render: (i) => <span className="font-medium tabular-nums">£{invoicePdfTotals(i).total.toFixed(2)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (i) => (
        <div className="flex flex-nowrap items-center justify-end gap-1.5">
          <Link href={`/admin/invoices/${i.id}`} className={viewBtn}>
            View
          </Link>
          <a
            href={`/admin/invoices/${i.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            title="Export PDF"
            className={exportBtn}
          >
            Export PDF
          </a>
          <button
            type="button"
            className={eyeBtn}
            title="Quick view"
            aria-label={`Quick view invoice ${i.number}`}
            onClick={() => setQuickView(i)}
          >
            <IconEye />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {quickView ? (
        <InvoiceQuickViewModal
          invoice={quickView}
          claimRef={quickView.claimId ? claimRefById[quickView.claimId] : undefined}
          onClose={closeQuick}
        />
      ) : null}
      <AdminDataTable<Invoice>
        baseHref="/admin/invoices"
        columns={columns}
        rows={rows}
        rowIdField="id"
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        searchParams={searchParams}
        tableMinClass="min-w-[920px]"
      />
    </>
  );
}
