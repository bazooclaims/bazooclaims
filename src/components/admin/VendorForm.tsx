"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { inputClass, labelClass } from "@/components/admin/admin-ui";
import { UkAddressFields } from "@/components/admin/UkAddressFields";
import type { Vendor, VendorKind } from "@/types/admin";

const KINDS: { value: VendorKind; label: string }[] = [
  { value: "courtesy_hire", label: "Courtesy / credit hire" },
  { value: "solicitor", label: "Solicitor / lawyer" },
  { value: "recovery", label: "Recovery / storage" },
  { value: "insurer", label: "Insurer" },
  { value: "other", label: "Other partner" },
];

export function VendorForm({ initial, isNew }: { initial: Vendor | null; isNew: boolean }) {
  const router = useRouter();
  const now = new Date().toISOString();
  const [vendor, setVendor] = useState<Vendor>(
    initial ?? {
      id: "",
      kind: "other",
      name: "",
      shortLabel: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      allowOnInvoice: true,
      createdAt: now,
      updatedAt: now,
    },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const url = isNew ? "/api/admin/vendors" : `/api/admin/vendors/${vendor.id}`;
    const method = isNew ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendor),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    if (isNew && data.vendor?.id) {
      router.push(`/admin/vendors/${data.vendor.id}`);
      router.refresh();
      return;
    }
    if (data.vendor) setVendor(data.vendor);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete partner “${vendor.name}”? Links on claims and invoices will be cleared.`)) return;
    const res = await fetch(`/api/admin/vendors/${vendor.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/vendors");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Delete failed");
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {!isNew ? (
        <p className="text-sm">
          <Link href="/admin/vendors" className="font-medium text-[var(--color-surface)] hover:underline">
            ← All partners
          </Link>
        </p>
      ) : null}
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}

      <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-[var(--color-ink)]">Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Name
            <input
              className={inputClass}
              value={vendor.name}
              onChange={(e) => setVendor((v) => ({ ...v, name: e.target.value }))}
              required
            />
          </label>
          <label className={labelClass}>
            Type
            <select
              className={inputClass}
              value={vendor.kind}
              onChange={(e) => setVendor((v) => ({ ...v, kind: e.target.value as VendorKind }))}
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Short label (optional, for lists)
            <input
              className={inputClass}
              value={vendor.shortLabel ?? ""}
              onChange={(e) => setVendor((v) => ({ ...v, shortLabel: e.target.value }))}
            />
          </label>
          <label className={`${labelClass} flex flex-col gap-2 sm:col-span-2`}>
            <span className="font-medium">Show on invoice PDF when linked</span>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-normal text-[var(--color-ink-muted)]">
              <input
                type="checkbox"
                checked={vendor.allowOnInvoice}
                onChange={(e) => setVendor((v) => ({ ...v, allowOnInvoice: e.target.checked }))}
              />
              Allow this partner’s block to appear on printed invoices (you still choose per invoice whether to print
              partners).
            </label>
          </label>
          <label className={labelClass}>
            Email
            <input
              type="email"
              className={inputClass}
              value={vendor.email ?? ""}
              onChange={(e) => setVendor((v) => ({ ...v, email: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Phone
            <input
              className={inputClass}
              value={vendor.phone ?? ""}
              onChange={(e) => setVendor((v) => ({ ...v, phone: e.target.value }))}
            />
          </label>
          <UkAddressFields
            heading="Postal address (UK)"
            value={vendor.address}
            onChange={(next) => setVendor((v) => ({ ...v, address: next ?? "" }))}
          />
          <label className={`${labelClass} sm:col-span-2`}>
            Internal notes
            <textarea
              className={inputClass}
              rows={3}
              value={vendor.notes ?? ""}
              onChange={(e) => setVendor((v) => ({ ...v, notes: e.target.value }))}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--color-surface)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : isNew ? "Create partner" : "Save"}
        </button>
        {!isNew ? (
          <button type="button" onClick={remove} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm text-red-700">
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
