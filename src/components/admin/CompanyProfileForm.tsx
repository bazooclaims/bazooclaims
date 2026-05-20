"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { inputClass, labelClass } from "@/components/admin/admin-ui";
import type { CompanyProfile } from "@/types/admin";

export function CompanyProfileForm({ initial }: { initial: CompanyProfile }) {
  const [profile, setProfile] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setProfile(initial);
  }, [initial]);

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/company-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(data.error ?? "Save failed");
      return;
    }
    setMessage("Saved.");
    if (data.profile) setProfile(data.profile);
  }

  async function removeLogo() {
    setMessage(null);
    const res = await fetch("/api/admin/company-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoPath: null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Remove failed");
      return;
    }
    setMessage("Logo removed.");
    if (data.profile) setProfile(data.profile);
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", "company");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    e.target.value = "";
    if (!res.ok) {
      setMessage(data.error ?? "Upload failed");
      return;
    }
    const url = data.url as string;
    setProfile((p) => ({ ...p, logoPath: url }));
    const persist = await fetch("/api/admin/company-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoPath: url }),
    });
    const persistData = await persist.json();
    if (!persist.ok) {
      setMessage(persistData.error ?? "Uploaded but failed to save — use Save company profile.");
      return;
    }
    if (persistData.profile) setProfile(persistData.profile);
    setMessage("Logo saved.");
  }

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-[var(--color-ink-muted)]">{message}</p> : null}
      <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-[var(--color-ink)]">Branding</h2>
        <label className={`${labelClass} mt-4`}>
          Logo (PNG/JPEG, shown on printed invoices)
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadLogo} className="mt-1 text-sm" />
        </label>
        {profile.logoPath ? (
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="relative h-16 w-44 overflow-hidden rounded-lg border border-[var(--color-surface)]/15 bg-[var(--color-band)]/40">
              <Image src={profile.logoPath} alt="Company logo" fill className="object-contain p-2" unoptimized sizes="176px" />
            </div>
            <button
              type="button"
              onClick={() => void removeLogo()}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              Remove logo
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-[var(--color-ink-muted)]">No logo on file.</p>
        )}
      </section>

      <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-[var(--color-ink)]">Registered details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Legal name
            <input
              className={inputClass}
              value={profile.legalName}
              onChange={(e) => setProfile((p) => ({ ...p, legalName: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Trading name
            <input
              className={inputClass}
              value={profile.tradingName ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, tradingName: e.target.value }))}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Address lines (one per line in the box — use line breaks)
            <textarea
              className={inputClass}
              rows={4}
              value={profile.addressLines.join("\n")}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  addressLines: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
                }))
              }
            />
          </label>
          <label className={labelClass}>
            City
            <input
              className={inputClass}
              value={profile.city ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Postcode
            <input
              className={inputClass}
              value={profile.postcode ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, postcode: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Country
            <input
              className={inputClass}
              value={profile.country}
              onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            VAT number
            <input
              className={inputClass}
              value={profile.vatNumber ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, vatNumber: e.target.value }))}
              placeholder="GB123456789"
            />
          </label>
          <label className={labelClass}>
            Company number
            <input
              className={inputClass}
              value={profile.companyNumber ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, companyNumber: e.target.value }))}
              placeholder="e.g. 12345678 (Companies House)"
            />
          </label>
          <label className={labelClass}>
            Phone
            <input
              className={inputClass}
              value={profile.phone ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Email
            <input
              type="email"
              className={inputClass}
              value={profile.email ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Website
            <input
              className={inputClass}
              value={profile.website ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-6 rounded-lg bg-[var(--color-surface)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save company profile"}
        </button>
      </section>
    </div>
  );
}
