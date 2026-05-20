import { AdminPageHeader, labelClass } from "@/components/admin/admin-ui";
import { EnquiriesTable } from "@/components/admin/tables/EnquiriesTable";
import { paginate, parsePageParams } from "@/lib/admin/pagination";
import { bootstrapAdminIfNeeded, readDb, seedInvoiceTemplatesIfEmpty } from "@/lib/admin/store";
import type { EnquiryStatus } from "@/types/admin";

export const metadata = { title: "Enquiries" };

const STATUSES: EnquiryStatus[] = ["new", "follow_up", "called", "closed", "converted"];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function EnquiriesPage({ searchParams }: Props) {
  await bootstrapAdminIfNeeded();
  await seedInvoiceTemplatesIfEmpty();
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") params.set(k, v);
  }
  const { page, pageSize, q } = parsePageParams(params);
  const status = typeof sp.status === "string" ? sp.status : "";

  const db = await readDb();
  let list = [...(db.enquiries ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (status && STATUSES.includes(status as EnquiryStatus)) {
    list = list.filter((e) => e.status === status);
  }
  if (q) {
    const qq = q.toLowerCase();
    list = list.filter(
      (e) =>
        e.reference.toLowerCase().includes(qq) ||
        (e.clientReference?.toLowerCase().includes(qq) ?? false) ||
        e.fullName.toLowerCase().includes(qq) ||
        e.email.toLowerCase().includes(qq) ||
        e.vehicleRegistration.toLowerCase().replace(/\s/g, "").includes(qq.replace(/\s/g, "")),
    );
  }
  const paged = paginate(list, page, pageSize);

  const claimRefById: Record<string, string> = {};
  for (const c of db.claims) {
    claimRefById[c.id] = c.reference;
  }

  const filterParams: Record<string, string> = {};
  if (q) filterParams.q = q;
  if (status) filterParams.status = status;

  return (
    <>
      <AdminPageHeader
        title="Enquiries"
        description="Website submissions are enquiries only (ENQ-…). A claim (BZ-…) is created only when you use Create claim on an enquiry."
      />
      <form className="mb-4 flex flex-col gap-3 rounded-xl border border-[var(--color-surface)]/10 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <label className={`${labelClass} min-w-0 flex-1 sm:min-w-[12rem]`}>
          Search
          <input
            name="q"
            defaultValue={q}
            placeholder="Enquiry no., their ref, name, email, vehicle reg…"
            className="mt-1 w-full rounded-lg border border-[var(--color-surface)]/15 px-3 py-2 text-sm"
          />
        </label>
        <label className={`${labelClass} min-w-[10rem]`}>
          Status
          <select
            name="status"
            defaultValue={status}
            className="mt-1 w-full rounded-lg border border-[var(--color-surface)]/15 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
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
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-white"
          >
            Apply
          </button>
          <a
            href="/admin/enquiries"
            className="rounded-lg border border-[var(--color-surface)]/15 px-4 py-2 text-sm font-medium text-[var(--color-ink)]"
          >
            Reset
          </a>
        </div>
      </form>
      <EnquiriesTable
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
