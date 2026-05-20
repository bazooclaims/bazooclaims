"use client";

import Link from "next/link";

import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import type { Vendor, VendorKind } from "@/types/admin";

const viewBtn =
  "inline-flex items-center justify-center rounded-lg bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95";

const kindLabel: Record<VendorKind, string> = {
  courtesy_hire: "Courtesy hire",
  solicitor: "Solicitor",
  recovery: "Recovery",
  insurer: "Insurer",
  other: "Other",
};

const columns: Column<Vendor>[] = [
  {
    key: "name",
    header: "Name",
    render: (v) => (
      <div className="min-w-0 max-w-[14rem]">
        <Link href={`/admin/vendors/${v.id}`} className="font-semibold text-[var(--color-surface)] hover:underline">
          {v.name}
        </Link>
        {v.shortLabel ? <p className="truncate text-xs text-[var(--color-ink-muted)]">{v.shortLabel}</p> : null}
      </div>
    ),
  },
  {
    key: "kind",
    header: "Type",
    render: (v) => <span className="text-sm text-[var(--color-ink-muted)]">{kindLabel[v.kind]}</span>,
  },
  {
    key: "contact",
    header: "Contact",
    render: (v) => (
      <span className="block max-w-[12rem] truncate text-sm text-[var(--color-ink-muted)]">
        {[v.email, v.phone].filter(Boolean).join(" · ") || "—"}
      </span>
    ),
  },
  {
    key: "pdf",
    header: "PDF",
    render: (v) => (
      <span className={`text-xs font-medium ${v.allowOnInvoice ? "text-teal-800" : "text-[var(--color-ink-muted)]"}`}>
        {v.allowOnInvoice ? "On invoice OK" : "Admin only"}
      </span>
    ),
  },
  {
    key: "view",
    header: "",
    render: (v) => (
      <Link href={`/admin/vendors/${v.id}`} className={viewBtn}>
        View
      </Link>
    ),
  },
];

type Props = {
  rows: Vendor[];
};

export function VendorsTable({ rows }: Props) {
  const n = rows.length;
  return (
    <AdminDataTable<Vendor>
      baseHref="/admin/vendors"
      columns={columns}
      rows={rows}
      rowIdField="id"
      page={1}
      totalPages={1}
      total={n}
      pageSize={Math.max(n, 1)}
    />
  );
}
