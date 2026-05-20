import { AdminButton, AdminPageHeader, labelClass } from "@/components/admin/admin-ui";
import { ClaimsTable } from "@/components/admin/tables/ClaimsTable";
import { paginate, parsePageParams } from "@/lib/admin/pagination";
import { bootstrapAdminIfNeeded, readDb } from "@/lib/admin/store";
import type { AdminClaim, ClaimStatus } from "@/types/admin";

export const metadata = { title: "Claims" };

const STATUSES: ClaimStatus[] = [
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

const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
const SOURCES = ["website", "admin", "whatsapp", "enquiry"] as const satisfies readonly AdminClaim["source"][];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminClaimsPage({ searchParams }: Props) {
  await bootstrapAdminIfNeeded();
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") params.set(k, v);
  }
  const { page, pageSize, q } = parsePageParams(params);
  const status = typeof sp.status === "string" ? sp.status : "";
  const priority = typeof sp.priority === "string" ? sp.priority : "";
  const source = typeof sp.source === "string" ? sp.source : "";

  const db = await readDb();
  let list = [...db.claims].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  if (status && STATUSES.includes(status as ClaimStatus)) {
    list = list.filter((c) => c.status === status);
  }
  if (priority && PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
    list = list.filter((c) => c.priority === priority);
  }
  if (source && SOURCES.includes(source as AdminClaim["source"])) {
    list = list.filter((c) => c.source === source);
  }
  if (q) {
    const qq = q.toLowerCase();
    list = list.filter(
      (c) =>
        c.reference.toLowerCase().includes(qq) ||
        c.fullName.toLowerCase().includes(qq) ||
        c.vehicleRegistration.toLowerCase().includes(qq) ||
        (c.vehicleMakeModel?.toLowerCase().includes(qq) ?? false) ||
        (c.thirdPartyVehicleMakeModel?.toLowerCase().includes(qq) ?? false) ||
        c.email.toLowerCase().includes(qq) ||
        c.phone.includes(q),
    );
  }
  const paged = paginate(list, page, pageSize);

  const filterParams: Record<string, string> = {};
  if (q) filterParams.q = q;
  if (status) filterParams.status = status;
  if (priority) filterParams.priority = priority;
  if (source) filterParams.source = source;

  return (
    <>
      <AdminPageHeader
        title="Claims"
        description="Filter, open a claim to view the full workflow, attachments, courtesy vehicle, notes, and invoices. Each claim has a permanent unique ID."
        action={<AdminButton href="/admin/claims/new">New claim</AdminButton>}
      />
      <form className="mb-4 flex flex-col gap-3 rounded-xl border border-[var(--color-surface)]/10 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <label className={`${labelClass} min-w-0 flex-1 sm:min-w-[10rem]`}>
          Search
          <input
            name="q"
            defaultValue={q}
            placeholder="Reference, name, reg, make/model, email…"
            className="mt-1 w-full rounded-lg border border-[var(--color-surface)]/15 px-3 py-2 text-sm"
          />
        </label>
        <label className={`${labelClass} min-w-[9rem]`}>
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
        <label className={`${labelClass} min-w-[8rem]`}>
          Priority
          <select
            name="priority"
            defaultValue={priority}
            className="mt-1 w-full rounded-lg border border-[var(--color-surface)]/15 px-3 py-2 text-sm"
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className={`${labelClass} min-w-[9rem]`}>
          Source
          <select
            name="source"
            defaultValue={source}
            className="mt-1 w-full rounded-lg border border-[var(--color-surface)]/15 px-3 py-2 text-sm"
          >
            <option value="">All sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
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
          <button type="submit" className="rounded-lg bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-white">
            Apply
          </button>
          <a
            href="/admin/claims"
            className="rounded-lg border border-[var(--color-surface)]/15 px-4 py-2 text-sm font-medium text-[var(--color-ink)]"
          >
            Reset
          </a>
        </div>
      </form>
      <ClaimsTable
        rows={paged.items}
        page={paged.page}
        totalPages={paged.totalPages}
        total={paged.total}
        pageSize={paged.pageSize}
        searchParams={filterParams}
      />
    </>
  );
}
