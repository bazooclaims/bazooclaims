"use client";

import Link from "next/link";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  /** Stable id field on each row (e.g. `"id"`). Do not pass a function from a Server Component. */
  rowIdField: keyof T;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  baseHref: string;
  searchParams?: Record<string, string>;
  emptyMessage?: string;
  /** Tailwind min-width on the table (default fits most list pages). */
  tableMinClass?: string;
};

export function AdminDataTable<T>({
  columns,
  rows,
  rowIdField,
  page,
  totalPages,
  total,
  pageSize,
  baseHref,
  searchParams = {},
  emptyMessage = "No records found.",
  tableMinClass = "min-w-[640px]",
}: Props<T>) {
  function rowKey(row: T) {
    return String(row[rowIdField]);
  }

  function pageHref(p: number) {
    const q = new URLSearchParams({ ...searchParams, page: String(p), pageSize: String(pageSize) });
    return `${baseHref}?${q.toString()}`;
  }

  const isActionsCol = (key: string) => key === "view" || key === "actions";

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-surface)]/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className={`w-full text-left text-sm ${tableMinClass}`}>
          <thead className="border-b border-white/10 bg-gradient-to-r from-[#002f3b] via-[#063848] to-[#0a4d5c] text-white shadow-sm">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-white/95 ${isActionsCol(c.key) ? "w-[1%] min-w-[15.5rem] whitespace-nowrap text-right" : ""}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[var(--color-ink-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-[var(--color-surface)]/5 last:border-0 hover:bg-[var(--color-band)]/50"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-3 text-[var(--color-ink)] ${isActionsCol(c.key) ? "text-right" : ""}`}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-surface)]/10 px-4 py-3 text-sm text-[var(--color-ink-muted)]">
        <p>
          {total} total · page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="rounded-md border border-[var(--color-surface)]/15 px-3 py-1.5 font-medium hover:bg-[var(--color-band)]"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-md border border-transparent px-3 py-1.5 opacity-40">Previous</span>
          )}
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="rounded-md border border-[var(--color-surface)]/15 px-3 py-1.5 font-medium hover:bg-[var(--color-band)]"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-md border border-transparent px-3 py-1.5 opacity-40">Next</span>
          )}
        </div>
      </div>
    </div>
  );
}
