"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { inputClass, labelClass } from "@/components/admin/admin-ui";
import { UkAddressFields } from "@/components/admin/UkAddressFields";
import { claimWhatsAppUrl } from "@/lib/admin/whatsapp";
import type { AdminClaim, ClaimNote, ClaimStatus, StaffMember, Vendor } from "@/types/admin";

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

type Props = {
  claim: AdminClaim;
  staff: Pick<StaffMember, "id" | "name" | "email" | "role">[];
  vendors: Pick<Vendor, "id" | "name" | "kind" | "allowOnInvoice">[];
  isNew?: boolean;
  /** When set, show a second shortcut to new invoice with this template id (e.g. recovery ready-made). */
  recoveryInvoiceTemplateId?: string;
};

export function ClaimManageForm({ claim: initial, staff, vendors, isNew, recoveryInvoiceTemplateId }: Props) {
  const router = useRouter();
  const [claim, setClaim] = useState(initial);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wa = claimWhatsAppUrl(claim);

  async function save(patch: Partial<AdminClaim> & { note?: { body: string } }) {
    setSaving(true);
    setError(null);
    const url = isNew ? "/api/admin/claims" : `/api/admin/claims/${claim.id}`;
    const method = isNew ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isNew ? { ...claim, ...patch } : patch),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return false;
    }
    if (isNew && data.claim) {
      router.push(`/admin/claims/${data.claim.id}`);
      router.refresh();
      return true;
    }
    if (data.claim) setClaim(data.claim);
    router.refresh();
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await save(claim);
  }

  async function addNote() {
    if (!note.trim()) return;
    const ok = await save({ note: { body: note.trim() } });
    if (ok) setNote("");
  }

  async function removeClaim() {
    if (!confirm(`Delete claim ${claim.reference}?`)) return;
    const res = await fetch(`/api/admin/claims/${claim.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/claims");
      router.refresh();
    }
  }

  function setField<K extends keyof AdminClaim>(key: K, value: AdminClaim[K]) {
    setClaim((c) => ({ ...c, [key]: value }));
  }

  async function persistAttachments(urls: string[]) {
    if (!isNew && claim.id) {
      await save({ attachmentUrls: urls });
      return;
    }
    setClaim((c) => ({ ...c, attachmentUrls: urls.length ? urls : undefined }));
  }

  async function onPickFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const next = [...(claim.attachmentUrls ?? [])];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("folder", "claims");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
        if (!res.ok || !data.url) {
          setError(data.error ?? "Upload failed");
          break;
        }
        next.push(data.url);
      }
      await persistAttachments(next);
    } finally {
      setUploading(false);
    }
  }

  async function removeAttachmentUrl(url: string) {
    const next = (claim.attachmentUrls ?? []).filter((u) => u !== url);
    await persistAttachments(next);
  }

  function toggleChecklistDone(i: number, checked: boolean) {
    const checklist = [...claim.checklist];
    const item = checklist[i]!;
    checklist[i] = {
      ...item,
      done: checked,
      skipped: checked ? false : item.skipped,
      doneAt: checked ? new Date().toISOString() : undefined,
    };
    setField("checklist", checklist);
  }

  function toggleChecklistSkipped(i: number) {
    const checklist = [...claim.checklist];
    const item = checklist[i]!;
    const skipped = !item.skipped;
    checklist[i] = {
      ...item,
      skipped,
      done: skipped ? false : item.done,
      doneAt: skipped ? undefined : item.doneAt,
    };
    setField("checklist", checklist);
  }

  const checklistCleared = claim.checklist.filter((x) => x.done || x.skipped).length;
  const checklistTotal = claim.checklist.length;

  const isDetail = !isNew;
  const sec = isDetail
    ? "rounded-xl border border-slate-200/90 bg-white p-5 shadow-md sm:p-6 border-l-[3px] border-l-teal-600"
    : "rounded-xl border border-slate-200/90 bg-white p-5 shadow-md ring-1 ring-slate-900/[0.04] sm:p-6";

  return (
    <form
      onSubmit={onSubmit}
      className={isDetail ? "space-y-4" : "flex flex-col gap-4"}
    >
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}

      <div
        className={
          isDetail
            ? "space-y-6 rounded-2xl border border-teal-900/25 bg-gradient-to-b from-slate-100/90 via-white to-teal-50/25 p-4 shadow-inner sm:p-6"
            : "flex flex-col gap-8 sm:gap-10"
        }
      >
        {isDetail ? (
          <div className="rounded-xl bg-gradient-to-r from-[#002f3b] to-[#0a4d5c] px-4 py-3.5 text-white shadow-sm ring-1 ring-black/10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-200/90">Case file editor</p>
            <p className="mt-1 text-sm leading-snug text-white/88">
              This workspace is for an <strong className="text-white">existing claim</strong>. Update sections, then
              press <strong className="text-white">Save changes</strong> at the bottom.
            </p>
          </div>
        ) : null}

      <section className={sec}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            {isDetail ? "Contacts & case filing" : "Claim details"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {wa ? (
              <a
                href={wa}
                rel="noopener noreferrer"
                className="rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white"
              >
                WhatsApp client
              </a>
            ) : null}
            {!isNew ? (
              <>
                <Link
                  href={`/admin/invoices/new?claimId=${claim.id}`}
                  className="rounded-lg border border-[var(--color-surface)]/15 px-3 py-2 text-sm font-medium"
                >
                  New invoice
                </Link>
                {recoveryInvoiceTemplateId ? (
                  <Link
                    href={`/admin/invoices/new?claimId=${claim.id}&template=${recoveryInvoiceTemplateId}`}
                    className="rounded-lg border border-[var(--color-accent)]/45 bg-[var(--color-band)] px-3 py-2 text-sm font-medium text-[var(--color-surface)]"
                  >
                    Recovery & storage invoice
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={removeClaim}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700"
                >
                  Delete
                </button>
              </>
            ) : null}
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Reference
            <input className={inputClass} value={claim.reference} readOnly disabled />
          </label>
          {!isDetail ? (
            <label className={labelClass}>
              Unique claim ID
              <input
                className={inputClass}
                value={claim.id || "— assigned when you create this claim —"}
                readOnly
                disabled
              />
            </label>
          ) : null}
          <label className={labelClass}>
            Status
            <select
              className={inputClass}
              value={claim.status}
              onChange={(e) => setField("status", e.target.value as ClaimStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Priority
            <select
              className={inputClass}
              value={claim.priority}
              onChange={(e) => setField("priority", e.target.value as AdminClaim["priority"])}
            >
              {(["low", "normal", "high", "urgent"] as const).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Assigned to
            <select
              className={inputClass}
              value={claim.assignedToId ?? ""}
              onChange={(e) => setField("assignedToId", e.target.value || undefined)}
            >
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Full name
            <input
              className={inputClass}
              value={claim.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              required
            />
          </label>
          <label className={labelClass}>
            Email
            <input
              type="email"
              className={inputClass}
              value={claim.email}
              onChange={(e) => setField("email", e.target.value)}
              required
            />
          </label>
          <label className={labelClass}>
            Phone
            <input
              className={inputClass}
              value={claim.phone}
              onChange={(e) => setField("phone", e.target.value)}
              required
            />
          </label>
          <UkAddressFields
            value={claim.clientAddress}
            onChange={(next) => setField("clientAddress", next)}
          />
          <label className={labelClass}>
            Vehicle registration
            <input
              className={inputClass}
              value={claim.vehicleRegistration}
              onChange={(e) => setField("vehicleRegistration", e.target.value.toUpperCase())}
              required
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Vehicle make &amp; model
            <input
              className={inputClass}
              placeholder="e.g. Ford Focus 1.0 EcoBoost Titanium"
              value={claim.vehicleMakeModel ?? ""}
              onChange={(e) => setField("vehicleMakeModel", e.target.value)}
            />
          </label>
          <label className={labelClass}>
            Incident date
            <input
              type="date"
              className={inputClass}
              value={claim.incidentDate}
              onChange={(e) => setField("incidentDate", e.target.value)}
              required
            />
          </label>
          <label className={labelClass}>
            Fault
            <select
              className={inputClass}
              value={claim.faultStatus}
              onChange={(e) => setField("faultStatus", e.target.value as AdminClaim["faultStatus"])}
            >
              <option value="non_fault">Non-fault</option>
              <option value="fault">Fault / split</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Insurer
            <input
              className={inputClass}
              value={claim.insurerName ?? ""}
              onChange={(e) => setField("insurerName", e.target.value)}
            />
          </label>
          <label className={labelClass}>
            Policy number
            <input
              className={inputClass}
              value={claim.policyNumber ?? ""}
              onChange={(e) => setField("policyNumber", e.target.value)}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Third party
            <textarea
              className={inputClass}
              rows={2}
              value={claim.thirdPartyDetails ?? ""}
              onChange={(e) => setField("thirdPartyDetails", e.target.value)}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Third party vehicle make &amp; model
            <input
              className={inputClass}
              placeholder="e.g. VW Golf 2.0 TDI"
              value={claim.thirdPartyVehicleMakeModel ?? ""}
              onChange={(e) => setField("thirdPartyVehicleMakeModel", e.target.value)}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Summary
            <textarea
              className={inputClass}
              rows={3}
              value={claim.message}
              onChange={(e) => setField("message", e.target.value)}
            />
          </label>
        </div>
        {isDetail ? (
          <details className="mt-4 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm">
            <summary className="cursor-pointer font-medium text-[var(--color-ink)]">System identifiers</summary>
            <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
              Internal ID (integrations / support):{" "}
              <code className="break-all rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-[var(--color-ink)]">
                {claim.id}
              </code>
            </p>
          </details>
        ) : null}
      </section>

      {vendors.length > 0 ? (
        <section className={sec}>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            {isDetail ? "Linked partners" : "Partners & vendors"}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {isDetail
              ? "Tick partners linked to this claim. Invoice pages can optionally print allowed partners on PDFs."
              : "Link courtesy hire, solicitors, recovery, or other partners to this claim. Invoice screens can link the same records and optionally print them on the PDF."}
          </p>
          <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
            {vendors.map((v) => {
              const checked = (claim.linkedVendorIds ?? []).includes(v.id);
              return (
                <li key={v.id}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-band)]/25 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const set = new Set(claim.linkedVendorIds ?? []);
                        if (e.target.checked) set.add(v.id);
                        else set.delete(v.id);
                        const next = [...set];
                        setField("linkedVendorIds", next.length ? next : undefined);
                      }}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium text-[var(--color-ink)]">{v.name}</span>
                      <span className="ml-2 text-xs capitalize text-[var(--color-ink-muted)]">
                        {v.kind.replace(/_/g, " ")}
                      </span>
                      {!v.allowOnInvoice ? (
                        <span className="mt-1 block text-xs text-amber-800">PDF printing disabled for this partner</span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
            <Link href="/admin/vendors" className="font-medium text-[var(--color-surface)] hover:underline">
              Manage partner directory
            </Link>
          </p>
        </section>
      ) : null}

      <section className={sec}>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
          {isDetail ? "Evidence & photos" : "Photos & attachments"}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {isDetail
            ? "Scene and damage photos stored under /uploads/claims/ — add or remove files as the case develops."
            : "Upload scene or damage photos (JPEG/PNG/WebP, max 5MB each). Files are stored on this server under "}
          {!isDetail ? (
            <>
              <code className="rounded bg-[var(--color-band)] px-1 text-xs">/uploads/claims/</code>. Remove a file to
              delete it from this claim only.
            </>
          ) : null}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-[var(--color-surface)]/15 bg-[var(--color-band)]/40 px-4 py-2 text-sm font-medium text-[var(--color-surface)] hover:bg-[var(--color-band)]/70">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              className="sr-only"
              disabled={uploading || saving}
              onChange={(e) => {
                void onPickFiles(e.target.files);
                e.target.value = "";
              }}
            />
            {uploading ? "Uploading…" : "+ Add photos"}
          </label>
        </div>
        {(claim.attachmentUrls?.length ?? 0) > 0 ? (
          <ul className="mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4">
            {(claim.attachmentUrls ?? []).map((url) => (
              <li
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-band)]/30"
              >
                <a href={url} target="_blank" rel="noopener noreferrer" className="block size-full">
                  <Image src={url} alt="" fill className="object-cover" sizes="(max-width:768px)50vw,12rem" />
                </a>
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white hover:bg-black/80"
                  onClick={() => void removeAttachmentUrl(url)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">No attachments yet.</p>
        )}
      </section>

      <section className={sec}>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
          {isDetail ? "Courtesy vehicle" : "Courtesy / hire vehicle"}
        </h2>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={claim.courtesyCar.supplied}
            onChange={(e) =>
              setClaim((c) => ({
                ...c,
                courtesyCar: { ...c.courtesyCar, supplied: e.target.checked },
              }))
            }
          />
          Courtesy vehicle supplied
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["registration", "Registration"],
              ["makeModel", "Make & model"],
              ["supplier", "Supplier"],
              ["outDate", "Out date"],
              ["returnDate", "Return date"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={labelClass}>
              {label}
              <input
                className={inputClass}
                value={claim.courtesyCar[key] ?? ""}
                onChange={(e) =>
                  setClaim((c) => ({
                    ...c,
                    courtesyCar: { ...c.courtesyCar, [key]: e.target.value },
                  }))
                }
              />
            </label>
          ))}
          <label className={labelClass}>
            Daily rate (£)
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={claim.courtesyCar.dailyRate ?? ""}
              onChange={(e) =>
                setClaim((c) => ({
                  ...c,
                  courtesyCar: {
                    ...c.courtesyCar,
                    dailyRate: e.target.value ? Number(e.target.value) : undefined,
                  },
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className={sec}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              {isDetail ? "Workflow checklist" : "15-step workflow"}
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-[var(--color-ink-muted)]">
              {isDetail
                ? "Track operational steps for this file. Done and N/A both advance the progress bar."
                : "Tick Done when a step is complete. Use N/A when a step does not apply to this claim — it still counts toward overall progress so nothing blocks you."}
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-band)]/50 px-3 py-2 text-center text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">Progress</p>
            <p className="mt-0.5 text-lg font-semibold text-[var(--color-surface)]">
              {checklistCleared}/{checklistTotal}
            </p>
          </div>
        </div>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-band)]"
          role="progressbar"
          aria-valuenow={checklistCleared}
          aria-valuemin={0}
          aria-valuemax={checklistTotal}
          aria-label="Workflow steps cleared"
        >
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300"
            style={{ width: `${checklistTotal ? (100 * checklistCleared) / checklistTotal : 0}%` }}
          />
        </div>
        <ul className="mt-5 space-y-3">
          {claim.checklist.map((item, i) => (
            <li
              key={item.id}
              className={`flex flex-col gap-2 rounded-lg border border-[var(--color-surface)]/10 p-3 sm:flex-row sm:items-center sm:justify-between ${
                item.skipped ? "bg-amber-50/60" : item.done ? "bg-emerald-50/50" : "bg-[var(--color-page)]"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.done}
                  disabled={item.skipped}
                  onChange={(e) => toggleChecklistDone(i, e.target.checked)}
                  className="mt-1 size-4 shrink-0 rounded border-[var(--color-surface)]/25 accent-[var(--color-surface)]"
                  aria-label={`Mark done: ${item.label}`}
                />
                <span
                  className={`text-sm leading-snug ${
                    item.done ? "text-[var(--color-ink-muted)] line-through" : "text-[var(--color-ink)]"
                  } ${item.skipped ? "text-[var(--color-ink-muted)]" : ""}`}
                >
                  <span className="font-mono text-xs text-[var(--color-ink-muted)]">Step {i + 1}.</span>{" "}
                  {item.label}
                </span>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pl-2">
                <button
                  type="button"
                  onClick={() => toggleChecklistSkipped(i)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                    item.skipped
                      ? "border-amber-300 bg-amber-100 text-amber-950"
                      : "border-[var(--color-surface)]/15 bg-white text-[var(--color-ink-muted)] hover:border-amber-200 hover:text-amber-950"
                  }`}
                >
                  {item.skipped ? "N/A ✓" : "N/A"}
                </button>
                {item.done && item.doneAt ? (
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    {new Date(item.doneAt).toLocaleDateString("en-GB")}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {!isNew ? (
        <section className={sec}>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            {isDetail ? "Case notes" : "Notes"}
          </h2>
          <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
            {claim.notes.length === 0 ? (
              <li className="text-[var(--color-ink-muted)]">No notes yet.</li>
            ) : (
              claim.notes.map((n: ClaimNote) => (
                <li key={n.id} className="rounded-lg bg-[var(--color-band)] px-3 py-2">
                  <p className="text-[var(--color-ink)]">{n.body}</p>
                  <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                    {n.authorName} · {new Date(n.createdAt).toLocaleString("en-GB")}
                  </p>
                </li>
              ))
            )}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              className={`${inputClass} mt-0 flex-1`}
              placeholder="Add a note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              type="button"
              onClick={addNote}
              className="shrink-0 rounded-lg bg-[var(--color-band)] px-4 py-2 text-sm font-medium"
            >
              Add
            </button>
          </div>
        </section>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className={`rounded-lg bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 ${
          isDetail ? "w-full shadow-md sm:w-auto" : ""
        }`}
      >
        {saving ? "Saving…" : isNew ? "Create claim" : "Save changes"}
      </button>
      </div>
    </form>
  );
}
