import type { AdminClaim, ClaimStatus, InvoiceStatus, EnquiryStatus } from "@/types/admin";

const claimStatusClass: Partial<Record<ClaimStatus, string>> & { default: string } = {
  default: "bg-slate-100 text-slate-800 ring-1 ring-slate-200/80",
  new: "bg-sky-100 text-sky-950 ring-1 ring-sky-200/80",
  triage: "bg-indigo-100 text-indigo-950 ring-1 ring-indigo-200/80",
  active: "bg-teal-100 text-teal-950 ring-1 ring-teal-200/80",
  awaiting_insurer: "bg-amber-100 text-amber-950 ring-1 ring-amber-200/80",
  mobility: "bg-cyan-100 text-cyan-950 ring-1 ring-cyan-200/80",
  repair: "bg-orange-100 text-orange-950 ring-1 ring-orange-200/80",
  settlement: "bg-violet-100 text-violet-950 ring-1 ring-violet-200/80",
  closed: "bg-slate-200 text-slate-800 ring-1 ring-slate-300/80",
  cancelled: "bg-zinc-200 text-zinc-700 ring-1 ring-zinc-300/80",
};

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const cls = claimStatusClass[status] ?? claimStatusClass.default;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: AdminClaim["priority"] }) {
  const map: Record<AdminClaim["priority"], string> = {
    low: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80",
    normal: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80",
    high: "bg-amber-100 text-amber-950 ring-1 ring-amber-200/80",
    urgent: "bg-red-100 text-red-900 ring-1 ring-red-300/90",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[priority]}`}>
      {priority}
    </span>
  );
}

const invStatusClass: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-800 ring-1 ring-slate-200/80",
  sent: "bg-sky-100 text-sky-950 ring-1 ring-sky-200/80",
  paid: "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200/80",
  void: "bg-zinc-200 text-zinc-700 ring-1 ring-zinc-300/80",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${invStatusClass[status]}`}>
      {status}
    </span>
  );
}

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-800 ring-1 ring-slate-200/80">
      {status.replace(/_/g, " ")}
    </span>
  );
}
