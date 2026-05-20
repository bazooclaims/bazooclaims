import { AdminButton, AdminPageHeader, labelClass } from "@/components/admin/admin-ui";
import { InvoicesTable } from "@/components/admin/tables/InvoicesTable";
import { paginate, parsePageParams } from "@/lib/admin/pagination";
import { bootstrapAdminIfNeeded, readDb } from "@/lib/admin/store";
import type { InvoiceStatus } from "@/types/admin";

export const metadata = { title: "Invoices" };

const STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "void"];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminInvoicesPage({ searchParams }: Props) {
  await bootstrapAdminIfNeeded();
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") params.set(k, v);
  }
  const { page, pageSize, q } = parsePageParams(params);
  const status = typeof sp.status === "string" ? sp.status : "";
  const claimLink = typeof sp.claim === "string" ? sp.claim : "";

  const db = await readDb();
  let list = [...db.invoices].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  if (status && STATUSES.includes(status as InvoiceStatus)) {
    list = list.filter((i) => i.status === status);
  }
  if (claimLink === "linked") {
    list = list.filter((i) => Boolean(i.claimId));
  } else if (claimLink === "unlinked") {
    list = list.filter((i) => !i.claimId);
  }

  if (q) {
    const qq = q.toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    list = list.filter((i) => {
      const textMatch =
        i.number.toLowerCase().includes(qq) ||
        i.clientName.toLowerCase().includes(qq) ||
        (i.clientEmail?.toLowerCase().includes(qq) ?? false);
      const phoneMatch =
        qDigits.length >= 3 && (i.clientPhone?.replace(/\D/g, "").includes(qDigits) ?? false);
      return textMatch || phoneMatch;
    });
  }

  const paged = paginate(list, page, pageSize);

  const claimRefById: Record<string, string> = {};
  for (const c of db.claims) {
    claimRefById[c.id] = c.reference;
  }

  const filterParams: Record<string, string> = {};
  if (q) filterParams.q = q;
  if (status) filterParams.status = status;
  if (claimLink) filterParams.claim = claimLink;

  return (
    <>
      <AdminPageHeader
        title="Invoices"
        description="Filter by status and claim link, search by client or number, then open an invoice to edit, WhatsApp the client, or export PDF."
        action={
          <div className="flex gap-2">
            <AdminButton href="/admin/invoices/templates" variant="secondary">
              Templates
            </AdminButton>
            <AdminButton href="/admin/invoices/new">New invoice</AdminButton>
          </div>
        }
      />
      <form className="mb-4 flex flex-col gap-3 rounded-xl border border-[var(--color-surface)]/10 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <label className={`${labelClass} min-w-0 flex-1 sm:min-w-[10rem]`}>
          Search
          <input
            name="q"
            defaultValue={q}
            placeholder="Number, client name, email, mobile…"
            className="mt-1 w-full rounded-lg border border-[var(--color-surface)]/15 px-3 py-2 text-sm"
          />
        </label>
        <label className={`${labelClass} min-w-[8rem]`}>
          Status
          <select
            name="status"
            defaultValue={status}
            className="mt-1 w-full rounded-lg border border-[var(--color-surface)]/15 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className={`${labelClass} min-w-[10rem]`}>
          Claim link
          <select
            name="claim"
            defaultValue={claimLink}
            className="mt-1 w-full rounded-lg border border-[var(--color-surface)]/15 px-3 py-2 text-sm"
          >
            <option value="">All invoices</option>
            <option value="linked">Linked to claim</option>
            <option value="unlinked">Not linked</option>
          </select>
        </label>
        <label className={`${labelClass} w-full min-w-[5rem] sm:w-auto`}>
          Page size
          <select
            name="pageSize"
            defaultValue={String(pageSize)}
            className="mt-1 w-full rounded-lg border border-[var(--color-surface)]/15 px-3 py-2 text-sm"
          >
            {[10, 15, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-white">
            Apply
          </button>
          <a
            href="/admin/invoices"
            className="rounded-lg border border-[var(--color-surface)]/15 px-4 py-2 text-sm font-medium text-[var(--color-ink)]"
          >
            Reset
          </a>
        </div>
      </form>
      <InvoicesTable
        rows={paged.items}
        claimRefById={claimRefById}
        page={paged.page}
        totalPages={paged.totalPages}
        total={paged.total}
        pageSize={paged.pageSize}
        searchParams={filterParams}
      />
    </>
  );
}
