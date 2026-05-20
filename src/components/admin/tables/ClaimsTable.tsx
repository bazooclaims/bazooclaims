"use client";

import Link from "next/link";

import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import { ClaimStatusBadge, PriorityBadge } from "@/components/admin/admin-badges";
import type { AdminClaim } from "@/types/admin";

const viewBtn =
  "inline-flex items-center justify-center rounded-lg bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95";

const columns: Column<AdminClaim>[] = [
  {
    key: "ref",
    header: "Reference",
    render: (c) => (
      <Link href={`/admin/claims/${c.id}`} className="font-semibold text-[var(--color-surface)] hover:underline">
        {c.reference}
      </Link>
    ),
  },
  {
    key: "client",
    header: "Client",
    render: (c) => (
      <div className="min-w-0 max-w-[11rem]">
        <p className="truncate font-medium text-[var(--color-ink)]">{c.fullName}</p>
        <p className="truncate text-xs text-[var(--color-ink-muted)]">{c.email}</p>
      </div>
    ),
  },
  {
    key: "phone",
    header: "Phone",
    render: (c) => <span className="whitespace-nowrap font-medium tabular-nums text-[var(--color-ink)]">{c.phone}</span>,
  },
  {
    key: "reg",
    header: "Vehicle",
    render: (c) => <span className="font-mono text-sm font-semibold tracking-wide text-[var(--color-surface)]">{c.vehicleRegistration}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (c) => <ClaimStatusBadge status={c.status} />,
  },
  {
    key: "pri",
    header: "Priority",
    render: (c) => <PriorityBadge priority={c.priority} />,
  },
  {
    key: "courtesy",
    header: "Courtesy",
    render: (c) => (
      <span className={c.courtesyCar.supplied ? "font-medium text-teal-800" : "text-[var(--color-ink-muted)]"}>
        {c.courtesyCar.supplied ? "Yes" : "—"}
      </span>
    ),
  },
  {
    key: "chk",
    header: "Workflow",
    render: (c) => (
      <span className="tabular-nums text-[var(--color-ink-muted)]">
        {c.checklist.filter((x) => x.done || x.skipped).length}/{c.checklist.length}
      </span>
    ),
  },
  {
    key: "view",
    header: "",
    render: (c) => (
      <Link href={`/admin/claims/${c.id}`} className={viewBtn}>
        View
      </Link>
    ),
  },
];

type Props = {
  rows: AdminClaim[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  searchParams?: Record<string, string>;
};

export function ClaimsTable({ rows, page, totalPages, total, pageSize, searchParams }: Props) {
  return (
    <AdminDataTable<AdminClaim>
      baseHref="/admin/claims"
      columns={columns}
      rows={rows}
      rowIdField="id"
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      searchParams={searchParams}
    />
  );
}
