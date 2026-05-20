import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-ui";
import { bootstrapAdminIfNeeded, readDb, seedInvoiceTemplatesIfEmpty } from "@/lib/admin/store";
import { claimWhatsAppUrl } from "@/lib/admin/whatsapp";
import type { ClaimStatus, InvoiceStatus } from "@/types/admin";

export const metadata = { title: "Dashboard" };

const STATUS_ORDER: ClaimStatus[] = [
  "new",
  "triage",
  "active",
  "awaiting_insurer",
  "mobility",
  "repair",
  "settlement",
  "closed",
  "cancelled",
];

function StatusBarChart({ counts, max }: { counts: Record<string, number>; max: number }) {
  const chartStatuses = STATUS_ORDER.filter((s) => s !== "cancelled");
  const w = 340;
  const rowH = 20;
  const gap = 5;
  const labelW = 112;
  const barX = labelW + 10;
  const barMaxW = w - barX - 40;
  const h = 16 + chartStatuses.length * (rowH + gap);
  let y = 10;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-w-[360px]" role="img" aria-label="Claims by status">
      <defs>
        <linearGradient id="barFillClaims" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#134e4a" />
        </linearGradient>
      </defs>
      {chartStatuses.map((status) => {
        const n = counts[status] ?? 0;
        const bw = max > 0 ? Math.max(3, (n / max) * barMaxW) : 0;
        const row = (
          <g key={status} transform={`translate(0, ${y})`}>
            <text x={labelW} y={13} textAnchor="end" fill="#64748b" style={{ fontSize: 10 }}>
              {status.replace(/_/g, " ")}
            </text>
            <rect x={barX} y={2} width={barMaxW} height={rowH - 6} rx={4} fill="#e2e8f0" />
            <rect x={barX} y={2} width={bw} height={rowH - 6} rx={4} fill="url(#barFillClaims)" />
            <text x={barX + barMaxW + 8} y={13} fill="#334155" style={{ fontSize: 11, fontWeight: 600 }} className="tabular-nums">
              {n}
            </text>
          </g>
        );
        y += rowH + gap;
        return row;
      })}
    </svg>
  );
}

const INVOICE_STATUS_ORDER: InvoiceStatus[] = ["draft", "sent", "paid", "void"];

function InvoiceBarChart({ counts, max }: { counts: Record<string, number>; max: number }) {
  const w = 300;
  const rowH = 22;
  const gap = 6;
  const labelW = 72;
  const barX = labelW + 10;
  const barMaxW = w - barX - 36;
  const h = 16 + INVOICE_STATUS_ORDER.length * (rowH + gap);
  let y = 10;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-w-[320px]" role="img" aria-label="Invoices by status">
      <defs>
        <linearGradient id="barFillInvoices" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      {INVOICE_STATUS_ORDER.map((status) => {
        const n = counts[status] ?? 0;
        const bw = max > 0 ? Math.max(3, (n / max) * barMaxW) : 0;
        const row = (
          <g key={status} transform={`translate(0, ${y})`}>
            <text x={labelW} y={14} textAnchor="end" fill="#64748b" style={{ fontSize: 11 }} className="capitalize">
              {status}
            </text>
            <rect x={barX} y={2} width={barMaxW} height={rowH - 6} rx={4} fill="#e2e8f0" />
            <rect x={barX} y={2} width={bw} height={rowH - 6} rx={4} fill="url(#barFillInvoices)" />
            <text x={barX + barMaxW + 8} y={14} fill="#334155" style={{ fontSize: 11, fontWeight: 600 }} className="tabular-nums">
              {n}
            </text>
          </g>
        );
        y += rowH + gap;
        return row;
      })}
    </svg>
  );
}

export default async function AdminDashboardPage() {
  await bootstrapAdminIfNeeded();
  await seedInvoiceTemplatesIfEmpty();
  const db = await readDb();

  const open = db.claims.filter((c) => c.status !== "closed" && c.status !== "cancelled").length;
  const enquiries = db.enquiries ?? [];
  const openEnquiries = enquiries.filter((e) => e.status === "new" || e.status === "follow_up").length;
  const recentClaims = [...db.claims]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  const recentEnquiries = [...enquiries]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  const recentActivity = db.activity.slice(0, 10);

  const statusCounts: Record<string, number> = {};
  for (const s of STATUS_ORDER) statusCounts[s] = 0;
  for (const c of db.claims) {
    statusCounts[c.status] = (statusCounts[c.status] ?? 0) + 1;
  }
  const maxStatus = Math.max(1, ...STATUS_ORDER.filter((s) => s !== "cancelled").map((s) => statusCounts[s] ?? 0));

  const invoiceCounts: Record<string, number> = {};
  for (const s of INVOICE_STATUS_ORDER) invoiceCounts[s] = 0;
  for (const inv of db.invoices) {
    invoiceCounts[inv.status] = (invoiceCounts[inv.status] ?? 0) + 1;
  }
  const maxInv = Math.max(1, ...INVOICE_STATUS_ORDER.map((s) => invoiceCounts[s] ?? 0));

  const stats = [
    { label: "Open claims", value: open, href: "/admin/claims" },
    { label: "Open enquiries", value: openEnquiries, href: "/admin/enquiries" },
    { label: "Total claims", value: db.claims.length, href: "/admin/claims" },
    { label: "Total enquiries", value: enquiries.length, href: "/admin/enquiries" },
    { label: "Invoices", value: db.invoices.length, href: "/admin/invoices" },
    { label: "Staff", value: db.staff.filter((s) => s.active).length, href: "/admin/staff" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Live snapshot of claims, partners, finance, and what changed recently."
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="block rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm transition hover:border-[var(--color-accent)]/40"
            >
              <p className="text-sm text-[var(--color-ink-muted)]">{s.label}</p>
              <p className="mt-1 text-3xl font-semibold text-[var(--color-surface)] tabular-nums">{s.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-[var(--color-ink)]">Claims by status</h2>
            <Link href="/admin/claims" className="text-xs font-semibold text-teal-700 hover:underline">
              View all
            </Link>
          </div>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Volume across each claim stage.</p>
          <div className="mt-4 flex justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
            <StatusBarChart counts={statusCounts} max={maxStatus} />
          </div>
        </section>

        <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-[var(--color-ink)]">Invoices by status</h2>
            <Link href="/admin/invoices" className="text-xs font-semibold text-sky-800 hover:underline">
              View all
            </Link>
          </div>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Draft, sent, paid, and void counts.</p>
          <div className="mt-4 flex justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
            <InvoiceBarChart counts={invoiceCounts} max={maxInv} />
          </div>
        </section>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--color-ink)]">Recent claims</h2>
          <ul className="mt-4 space-y-3">
            {recentClaims.length === 0 ? (
              <li className="text-sm text-[var(--color-ink-muted)]">No claims yet.</li>
            ) : (
              recentClaims.map((c) => {
                const wa = claimWhatsAppUrl(c);
                return (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/admin/claims/${c.id}`} className="font-medium text-[var(--color-surface)] hover:underline">
                      {c.reference} · {c.fullName}
                    </Link>
                    <span className="shrink-0 capitalize text-[var(--color-ink-muted)]">{c.status.replace(/_/g, " ")}</span>
                    {wa ? (
                      <a href={wa} rel="noopener noreferrer" className="shrink-0 text-xs font-medium text-[#128C7E] hover:underline">
                        WhatsApp
                      </a>
                    ) : null}
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--color-ink)]">Latest updates</h2>
          <ul className="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-1 text-sm">
            {recentActivity.length === 0 ? (
              <li className="text-[var(--color-ink-muted)]">No activity yet.</li>
            ) : (
              recentActivity.map((a) => (
                <li key={a.id} className="flex gap-2 border-l-2 border-teal-500/40 pl-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-[var(--color-ink)]">{a.actorName}</span>
                    <span className="text-[var(--color-ink-muted)]"> — {a.action}</span>
                    {a.detail ? <div className="truncate text-xs text-[var(--color-ink-muted)]">{a.detail}</div> : null}
                  </div>
                  <time className="shrink-0 text-[10px] text-[var(--color-ink-muted)] tabular-nums" dateTime={a.at}>
                    {new Date(a.at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </time>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--color-ink)]">Recent enquiries</h2>
          <ul className="mt-4 space-y-3">
            {recentEnquiries.length === 0 ? (
              <li className="text-sm text-[var(--color-ink-muted)]">No enquiries yet.</li>
            ) : (
              recentEnquiries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link
                    href={`/admin/enquiries/${e.id}`}
                    className="min-w-0 font-medium text-[var(--color-surface)] hover:underline"
                  >
                    <span className="truncate">{e.reference}</span>
                    <span className="text-[var(--color-ink-muted)]"> · {e.fullName}</span>
                  </Link>
                  <span className="shrink-0 capitalize text-[var(--color-ink-muted)]">{e.status.replace(/_/g, " ")}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-dashed border-teal-600/25 bg-[var(--color-band)]/30 p-6">
        <h2 className="font-semibold text-[var(--color-ink)]">Quick links</h2>
        <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/vendors/new", label: "New partner / vendor" },
            { href: "/admin/invoices/new", label: "New invoice" },
            { href: "/admin/claims/new", label: "New claim" },
            { href: "/admin/settings", label: "Company & VAT" },
          ].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block rounded-lg border border-[var(--color-surface)]/10 bg-white px-3 py-2 text-sm font-medium text-[var(--color-surface)] hover:border-teal-500/40 hover:bg-teal-50/50"
              >
                {l.label} →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
