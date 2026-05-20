"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Enquiry, EnquiryStatus } from "@/types/admin";

const STATUSES: EnquiryStatus[] = ["new", "follow_up", "called", "closed", "converted"];

export function EnquiryDetailClient({ enquiry: initial }: { enquiry: Enquiry }) {
  const router = useRouter();
  const [enquiry, setEnquiry] = useState(initial);
  const [notes, setNotes] = useState(initial.internalNotes);
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(partial: Partial<Enquiry> & { internalNotes?: string }) {
    setBusy("save");
    const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    const data = await res.json();
    setBusy(null);
    if (res.ok && data.enquiry) setEnquiry(data.enquiry);
    router.refresh();
  }

  async function saveNotes() {
    await patch({ internalNotes: notes });
  }

  async function setStatus(status: EnquiryStatus) {
    await patch({ status });
  }

  async function convert() {
    setBusy("convert");
    const res = await fetch(`/api/admin/enquiries/${enquiry.id}/convert-claim`, { method: "POST" });
    const data = await res.json();
    setBusy(null);
    if (res.ok && data.claimId) {
      router.push(`/admin/claims/${data.claimId}`);
      router.refresh();
    }
  }

  async function remove() {
    if (!confirm("Remove this enquiry permanently?")) return;
    setBusy("del");
    await fetch(`/api/admin/enquiries/${enquiry.id}`, { method: "DELETE" });
    setBusy(null);
    router.push("/admin/enquiries");
    router.refresh();
  }

  const sec =
    "rounded-xl border border-slate-200/90 bg-white p-5 shadow-md sm:p-6 border-l-[3px] border-l-teal-600";

  return (
    <div className="space-y-6 rounded-2xl border border-teal-900/25 bg-gradient-to-b from-slate-100/90 via-white to-teal-50/25 p-4 shadow-inner sm:p-6">
      <div className="rounded-xl bg-gradient-to-r from-[#002f3b] to-[#0a4d5c] px-4 py-3.5 text-white shadow-sm ring-1 ring-black/10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-200/90">Intake record editor</p>
        <p className="mt-1 text-sm leading-snug text-white/88">
          This workspace is for an <strong className="text-white">existing enquiry</strong> — not a claim file until
          you convert it. Use the pipeline buttons below, then <strong className="text-white">Save notes</strong> when
          you change internal notes. <strong className="text-white">Create claim</strong> opens a new claim (BZ-…) and
          links it here.
        </p>
      </div>

      <section className={sec}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Pipeline & actions</h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-muted)]">
              Set the enquiry status for your team. Only <strong className="text-[var(--color-ink)]">Create claim</strong>{" "}
              adds a claim record — website submissions do not.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy !== null || enquiry.status === "converted"}
              onClick={() => setStatus(s)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
                enquiry.status === s
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15"
                  : "border-[var(--color-surface)]/15 hover:bg-[var(--color-band)]"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
          <button
            type="button"
            disabled={busy !== null || enquiry.status === "converted"}
            onClick={convert}
            className="rounded-lg bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-white shadow-md"
          >
            Create claim
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={remove}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700"
          >
            Remove
          </button>
        </div>
      </section>

      <section className={sec}>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Submission snapshot</h2>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-ink-muted)]">Enquiry number</dt>
            <dd className="font-mono font-semibold text-[var(--color-ink)]">{enquiry.reference}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-ink-muted)]">Their reference</dt>
            <dd className="font-mono text-[var(--color-ink)]">{enquiry.clientReference?.trim() || "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-ink-muted)]">Name</dt>
            <dd className="font-medium">{enquiry.fullName}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-ink-muted)]">Email</dt>
            <dd>{enquiry.email}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-ink-muted)]">Phone</dt>
            <dd>{enquiry.phone}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-ink-muted)]">Vehicle</dt>
            <dd>{enquiry.vehicleRegistration}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-ink-muted)]">Incident date</dt>
            <dd>{enquiry.incidentDate}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-ink-muted)]">Fault</dt>
            <dd className="capitalize">{enquiry.faultStatus.replace(/_/g, " ")}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[var(--color-ink-muted)]">Message</dt>
            <dd className="mt-1 whitespace-pre-wrap">{enquiry.message}</dd>
          </div>
        </dl>
      </section>

      {enquiry.attachmentUrls.length > 0 ? (
        <section className={sec}>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Evidence from the lead</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Images attached when the enquiry was submitted on the website.
          </p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {enquiry.attachmentUrls.map((url) => (
              <li key={url} className="relative size-28 overflow-hidden rounded-lg border bg-[var(--color-band)]">
                <Image src={url} alt="" fill className="object-cover" sizes="112px" unoptimized />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={sec}>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Internal notes</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Staff-only — not visible to the lead. Press Save notes after edits.
        </p>
        <textarea
          className="mt-3 w-full rounded-lg border border-[var(--color-surface)]/15 bg-white p-3 text-sm shadow-sm"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          type="button"
          onClick={saveNotes}
          disabled={busy !== null}
          className="mt-3 rounded-lg bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
        >
          Save notes
        </button>
      </section>
    </div>
  );
}
