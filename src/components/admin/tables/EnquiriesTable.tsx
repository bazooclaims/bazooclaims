"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import type { Enquiry, EnquiryStatus } from "@/types/admin";

const STATUSES: EnquiryStatus[] = ["new", "follow_up", "called", "closed", "converted"];

const viewBtn =
  "inline-flex items-center justify-center rounded-lg bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95";

const selectClass =
  "max-w-[11rem] cursor-pointer rounded-lg border border-[var(--color-surface)]/20 bg-white py-1.5 pl-2 pr-7 text-xs font-semibold capitalize text-[var(--color-ink)] shadow-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/25 disabled:opacity-60";

function statusLabel(s: EnquiryStatus): string {
  return s.replace(/_/g, " ");
}

function EnquiryStatusQuickSelect({ enquiry }: { enquiry: Enquiry }) {
  const router = useRouter();
  const [status, setStatus] = useState(enquiry.status);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus(enquiry.status);
  }, [enquiry.id, enquiry.status]);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as EnquiryStatus;
    const prev = status;
    setStatus(next);
    setBusy(true);
    const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
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
      className={selectClass}
      aria-label={`Status for enquiry ${enquiry.reference}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabel(s)}
        </option>
      ))}
    </select>
  );
}

type Props = {
  rows: Enquiry[];
  /** claimId → BZ reference for table links */
  claimRefById: Record<string, string>;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  searchParams?: Record<string, string>;
};

export function EnquiriesTable({
  rows,
  claimRefById,
  page,
  totalPages,
  total,
  pageSize,
  searchParams,
}: Props) {
  const columns: Column<Enquiry>[] = [
    {
      key: "ref",
      header: "Enquiry no.",
      render: (e) => (
        <div className="min-w-0">
          <Link href={`/admin/enquiries/${e.id}`} className="font-semibold text-[var(--color-surface)] hover:underline">
            {e.reference}
          </Link>
          {e.clientReference?.trim() ? (
            <p className="mt-0.5 truncate text-[11px] text-[var(--color-ink-muted)]" title={e.clientReference.trim()}>
              Their ref: {e.clientReference.trim()}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (e) => (
        <div className="min-w-0 max-w-[12rem]">
          <p className="truncate font-medium text-[var(--color-ink)]">{e.fullName}</p>
          <p className="truncate text-xs text-[var(--color-ink-muted)]">{e.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (e) => <span className="whitespace-nowrap tabular-nums text-sm">{e.phone}</span>,
    },
    {
      key: "reg",
      header: "Vehicle",
      render: (e) => <span className="font-mono text-sm font-semibold text-[var(--color-surface)]">{e.vehicleRegistration}</span>,
    },
    {
      key: "imgs",
      header: "Photos",
      render: (e) => (
        <span className="tabular-nums text-[var(--color-ink-muted)]">{e.attachmentUrls.length ? e.attachmentUrls.length : "—"}</span>
      ),
    },
    {
      key: "claim",
      header: "Claim",
      render: (e) => {
        if (!e.claimId) return <span className="text-[var(--color-ink-muted)]">—</span>;
        const ref = claimRefById[e.claimId];
        return ref ? (
          <Link href={`/admin/claims/${e.claimId}`} className="font-medium text-[var(--color-surface)] hover:underline">
            {ref}
          </Link>
        ) : (
          <Link href={`/admin/claims/${e.claimId}`} className="text-xs font-medium text-[var(--color-surface)] hover:underline">
            Open claim
          </Link>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (e) => <EnquiryStatusQuickSelect enquiry={e} />,
    },
    {
      key: "view",
      header: "",
      render: (e) => (
        <Link href={`/admin/enquiries/${e.id}`} className={viewBtn}>
          View
        </Link>
      ),
    },
  ];

  return (
    <AdminDataTable<Enquiry>
      baseHref="/admin/enquiries"
      columns={columns}
      rows={rows}
      rowIdField="id"
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      searchParams={searchParams}
      tableMinClass="min-w-[960px]"
    />
  );
}
