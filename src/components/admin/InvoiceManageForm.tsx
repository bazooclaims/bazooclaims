"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { inputClass, labelClass } from "@/components/admin/admin-ui";
import { UkAddressFields } from "@/components/admin/UkAddressFields";
import { invoicePdfTotals } from "@/lib/admin/invoice-math";
import { getWhatsAppUrlToNumber, invoiceWhatsAppToClientMessage } from "@/lib/admin/whatsapp";
import type { AdminClaim, Invoice, InvoiceLine, InvoiceTemplate, StaffMember, Vendor } from "@/types/admin";

type StaffPick = Pick<StaffMember, "id" | "name" | "role" | "active">;

type ClaimPick = Pick<AdminClaim, "id" | "reference" | "fullName" | "email" | "clientAddress" | "phone">;

type Props = {
  invoice: Invoice;
  claims: ClaimPick[];
  templates: InvoiceTemplate[];
  vendors: Pick<Vendor, "id" | "name" | "kind" | "allowOnInvoice">[];
  staff: StaffPick[];
  isNew?: boolean;
};

function newLine(): InvoiceLine {
  return {
    id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    description: "",
    quantity: 1,
    unitPrice: 0,
  };
}

export function InvoiceManageForm({ invoice: initial, claims, templates, vendors, staff, isNew }: Props) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfPreviewTotals = invoicePdfTotals(invoice);

  const linkedClaim = invoice.claimId ? claims.find((c) => c.id === invoice.claimId) : undefined;
  const activeStaff = staff.filter((s) => s.active);
  const selectedStaff = invoice.assignedStaffId
    ? activeStaff.find((s) => s.id === invoice.assignedStaffId)
    : undefined;
  const phoneForWhatsApp =
    invoice.clientPhone?.trim() || linkedClaim?.phone?.trim() || "";
  const waClient = getWhatsAppUrlToNumber(phoneForWhatsApp, invoiceWhatsAppToClientMessage(invoice));

  function applyTemplate(tpl: InvoiceTemplate) {
    setInvoice((inv) => ({
      ...inv,
      taxRate: tpl.taxRate,
      lines: tpl.lines.map((l) => ({
        id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
    }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const url = isNew ? "/api/admin/invoices" : `/api/admin/invoices/${invoice.id}`;
    const method = isNew ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...invoice, documentTitle: invoice.documentTitle ?? "" }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    if (isNew && data.invoice) {
      router.push(`/admin/invoices/${data.invoice.id}`);
      router.refresh();
      return;
    }
    if (data.invoice) setInvoice(data.invoice);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete invoice ${invoice.number}?`)) return;
    const res = await fetch(`/api/admin/invoices/${invoice.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/invoices");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}

      {templates.length > 0 ? (
        <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[var(--color-ink)]">Presaved templates</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                className="rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-band)] px-3 py-1.5 text-xs font-medium"
              >
                {t.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Invoice number
            <input
              className={inputClass}
              value={invoice.number}
              onChange={(e) => setInvoice((i) => ({ ...i, number: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Status
            <select
              className={inputClass}
              value={invoice.status}
              onChange={(e) =>
                setInvoice((i) => ({ ...i, status: e.target.value as Invoice["status"] }))
              }
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="void">Void</option>
            </select>
          </label>
          <label className={labelClass}>
            Link to claim
            <select
              className={inputClass}
              value={invoice.claimId ?? ""}
              onChange={(e) => {
                const claimId = e.target.value || undefined;
                const c = claims.find((x) => x.id === claimId);
                setInvoice((i) => ({
                  ...i,
                  claimId,
                  ...(c
                    ? {
                        clientName: c.fullName,
                        clientEmail: c.email,
                        clientAddress: c.clientAddress?.trim()
                          ? c.clientAddress
                          : i.clientAddress,
                        clientPhone: c.phone?.trim() ? c.phone : i.clientPhone,
                      }
                    : {}),
                }));
              }}
            >
              <option value="">None</option>
              {claims.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.reference} — {c.fullName}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
              Choosing a claim fills{" "}
              <strong className="text-[var(--color-ink)]">name, email, address, and mobile</strong> from that claim
              (you can edit before saving).
            </p>
          </label>
          <label className={labelClass}>
            Client name
            <input
              className={inputClass}
              value={invoice.clientName}
              onChange={(e) => setInvoice((i) => ({ ...i, clientName: e.target.value }))}
              required
            />
          </label>
          <label className={labelClass}>
            Client email
            <input
              type="email"
              className={inputClass}
              value={invoice.clientEmail ?? ""}
              onChange={(e) => setInvoice((i) => ({ ...i, clientEmail: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Client mobile (WhatsApp)
            <input
              className={inputClass}
              inputMode="tel"
              autoComplete="tel"
              placeholder="e.g. 07700 900123"
              value={invoice.clientPhone ?? ""}
              onChange={(e) => setInvoice((i) => ({ ...i, clientPhone: e.target.value || undefined }))}
            />
            {waClient ? (
              <a
                href={waClient}
                rel="noopener noreferrer"
                target="_blank"
                className="mt-2 inline-flex w-fit items-center rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                WhatsApp client
              </a>
            ) : (
              <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
                Enter a UK mobile here, or link a claim that has a phone number — then you can open WhatsApp with a
                prefilled invoice message to that number.
              </p>
            )}
          </label>
          <label className={labelClass}>
            VAT %
            <input
              type="number"
              className={inputClass}
              value={invoice.taxRate}
              onChange={(e) => setInvoice((i) => ({ ...i, taxRate: Number(e.target.value) || 0 }))}
            />
          </label>
          <label className={labelClass}>
            Staff on invoice (optional)
            <select
              className={inputClass}
              value={invoice.assignedStaffId ?? ""}
              onChange={(e) => {
                const assignedStaffId = e.target.value || undefined;
                setInvoice((i) => ({
                  ...i,
                  assignedStaffId,
                  showStaffOnPdf: assignedStaffId ? i.showStaffOnPdf ?? false : false,
                }));
              }}
            >
              <option value="">None</option>
              {activeStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.role}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs font-normal text-[var(--color-ink-muted)]">
              Choose from Admin → Staff. Full name and role can be printed on the PDF.
            </span>
          </label>
          <label className={`${labelClass} flex cursor-pointer items-start gap-3`}>
            <input
              type="checkbox"
              className="mt-1"
              disabled={!invoice.assignedStaffId}
              checked={Boolean(invoice.showStaffOnPdf && invoice.assignedStaffId)}
              onChange={(e) =>
                setInvoice((i) => ({
                  ...i,
                  showStaffOnPdf: e.target.checked,
                }))
              }
            />
            <span>
              <span className="font-medium text-[var(--color-ink)]">Print staff name on PDF</span>
              {selectedStaff ? (
                <span className="mt-0.5 block text-xs font-normal text-[var(--color-ink-muted)]">
                  Will show: <strong className="text-[var(--color-ink)]">{selectedStaff.name}</strong> ·{" "}
                  {selectedStaff.role}
                </span>
              ) : (
                <span className="mt-0.5 block text-xs font-normal text-[var(--color-ink-muted)]">
                  Select a staff member first.
                </span>
              )}
            </span>
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Document title (printed PDF)
            <input
              className={inputClass}
              placeholder="Tax invoice"
              value={invoice.documentTitle ?? ""}
              onChange={(e) =>
                setInvoice((i) => ({
                  ...i,
                  documentTitle: e.target.value === "" ? undefined : e.target.value,
                }))
              }
            />
            <span className="mt-1 block text-xs font-normal text-[var(--color-ink-muted)]">
              Shown on the export next to the invoice number (e.g. Proforma invoice, Invoice, Tax invoice).
            </span>
          </label>
          <label className={`${labelClass} flex cursor-pointer items-start gap-3 sm:col-span-2`}>
            <input
              type="checkbox"
              className="mt-1"
              checked={invoice.showTaxOnPdf !== false}
              onChange={(e) =>
                setInvoice((i) => ({
                  ...i,
                  showTaxOnPdf: e.target.checked ? true : false,
                }))
              }
            />
            <span>
              <span className="font-medium text-[var(--color-ink)]">Show VAT on exported PDF</span>
              <span className="mt-0.5 block text-xs font-normal text-[var(--color-ink-muted)]">
                Turn off for a net-only total with no VAT line or company VAT number on the printout.
              </span>
            </span>
          </label>
          <label className={labelClass}>
            Issue date
            <input
              type="date"
              className={inputClass}
              value={invoice.issueDate}
              onChange={(e) => setInvoice((i) => ({ ...i, issueDate: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Due date
            <input
              type="date"
              className={inputClass}
              value={invoice.dueDate}
              onChange={(e) => setInvoice((i) => ({ ...i, dueDate: e.target.value }))}
            />
          </label>
          <UkAddressFields
            value={invoice.clientAddress}
            onChange={(next) => setInvoice((i) => ({ ...i, clientAddress: next }))}
          />
        </div>

        {vendors.length > 0 ? (
          <div className="mt-6 border-t border-[var(--color-surface)]/10 pt-6">
            <h3 className="font-medium text-[var(--color-ink)]">Partners on this invoice</h3>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              Link partners from your directory (courtesy hire, solicitors, etc.). Only partners marked “allowed on
              invoice” can print on the PDF when you enable the option below.
            </p>
            <ul className="mt-3 grid list-none gap-2 p-0 sm:grid-cols-2">
              {vendors.map((v) => {
                const checked = (invoice.linkedVendorIds ?? []).includes(v.id);
                return (
                  <li key={v.id}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-band)]/25 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const set = new Set(invoice.linkedVendorIds ?? []);
                          if (e.target.checked) set.add(v.id);
                          else set.delete(v.id);
                          const next = [...set];
                          setInvoice((i) => ({
                            ...i,
                            linkedVendorIds: next.length ? next : undefined,
                          }));
                        }}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="font-medium text-[var(--color-ink)]">{v.name}</span>
                        <span className="ml-2 text-xs capitalize text-[var(--color-ink-muted)]">
                          {v.kind.replace(/_/g, " ")}
                        </span>
                        {!v.allowOnInvoice ? (
                          <span className="mt-1 block text-xs text-amber-800">Cannot print on PDF</span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={Boolean(invoice.showLinkedVendorsOnPdf)}
                onChange={(e) =>
                  setInvoice((i) => ({
                    ...i,
                    showLinkedVendorsOnPdf: e.target.checked,
                  }))
                }
                className="mt-1"
              />
              <span>
                <span className="font-medium">Show linked partners on exported invoice PDF</span>
                <span className="mt-0.5 block text-xs font-normal text-[var(--color-ink-muted)]">
                  When off, partner details stay in the admin panel only.
                </span>
              </span>
            </label>
          </div>
        ) : null}

        <div className="mt-6 border-t border-[var(--color-surface)]/10 pt-6">
          <h3 className="font-medium text-[var(--color-ink)]">Line items</h3>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[var(--color-ink-muted)]">
            Add as many lines as you need — recovery, storage, courtesy hire, admin fees, parts, etc.{" "}
            <strong className="text-[var(--color-ink)]">Qty</strong> can be days (e.g. 7) or units (e.g. 1).{" "}
            <strong className="text-[var(--color-ink)]">Unit £</strong> is the price per unit/day{" "}
            <strong>excluding VAT</strong>. Line £ is calculated for you.
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--color-surface)]/15 bg-[var(--color-page)]">
            <div className="hidden gap-2 border-b border-[var(--color-surface)]/10 bg-[var(--color-band)]/50 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] sm:grid sm:grid-cols-12 sm:items-center">
              <div className="sm:col-span-5">Description</div>
              <div className="sm:col-span-2">Qty / days</div>
              <div className="sm:col-span-2">Unit £ (ex VAT)</div>
              <div className="sm:col-span-2 text-right sm:pr-2">Line £ (ex VAT)</div>
              <div className="sm:col-span-1" />
            </div>

            <div className="divide-y divide-[var(--color-surface)]/10">
              {invoice.lines.map((line, idx) => {
                const lineNet = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
                return (
                  <div
                    key={line.id}
                    className="grid gap-3 px-3 py-4 sm:grid-cols-12 sm:items-end sm:gap-2 sm:py-3"
                  >
                    <div className="sm:col-span-5">
                      <label className={`${labelClass} sm:sr-only`}>Description</label>
                      <input
                        className={`${inputClass} mt-1 sm:mt-0`}
                        placeholder="e.g. Vehicle recovery, Storage per day…"
                        value={line.description}
                        onChange={(e) => {
                          const lines = [...invoice.lines];
                          lines[idx] = { ...line, description: e.target.value };
                          setInvoice((i) => ({ ...i, lines }));
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={`${labelClass} sm:sr-only`}>Qty / days</label>
                      <input
                        type="number"
                        min={0}
                        step="1"
                        className={`${inputClass} mt-1 sm:mt-0`}
                        placeholder="1"
                        value={line.quantity === 0 ? "" : line.quantity}
                        onChange={(e) => {
                          const lines = [...invoice.lines];
                          const raw = e.target.value;
                          lines[idx] = { ...line, quantity: raw === "" ? 0 : Number(raw) || 0 };
                          setInvoice((i) => ({ ...i, lines }));
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={`${labelClass} sm:sr-only`}>Unit £ (ex VAT)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={`${inputClass} mt-1 sm:mt-0`}
                        placeholder="0.00"
                        value={line.unitPrice === 0 ? "" : line.unitPrice}
                        onChange={(e) => {
                          const lines = [...invoice.lines];
                          const raw = e.target.value;
                          lines[idx] = { ...line, unitPrice: raw === "" ? 0 : Number(raw) || 0 };
                          setInvoice((i) => ({ ...i, lines }));
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={`${labelClass} sm:sr-only`}>Line net (ex VAT)</label>
                      <div
                        className="mt-1 flex min-h-[42px] items-center justify-end rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-band)]/40 px-3 text-sm font-medium tabular-nums text-[var(--color-ink)] sm:mt-0"
                        aria-live="polite"
                      >
                        £{lineNet.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-end justify-end sm:col-span-1 sm:justify-end sm:pb-0.5">
                      <button
                        type="button"
                        disabled={invoice.lines.length <= 1}
                        title={invoice.lines.length <= 1 ? "Keep at least one line" : "Remove this line"}
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                        onClick={() =>
                          setInvoice((i) => ({
                            ...i,
                            lines: i.lines.length <= 1 ? i.lines : i.lines.filter((_, j) => j !== idx),
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setInvoice((i) => ({ ...i, lines: [...i.lines, newLine()] }))}
            className="mt-3 text-sm font-semibold text-[var(--color-surface)] underline decoration-[var(--color-surface)]/30 underline-offset-2 hover:decoration-[var(--color-surface)]"
          >
            + Add line
          </button>
        </div>

        <div className="rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-band)]/40 p-4 text-sm">
          <p className="font-medium text-[var(--color-ink)]">UK VAT (standard)</p>
          <p className="mt-2 text-[var(--color-ink-muted)]">
            Line amounts are <strong>excluding VAT</strong>. VAT is net × {invoice.taxRate}% (change the rate
            above if you use a non-standard rate).
            {invoice.showTaxOnPdf === false ? (
              <>
                {" "}
                <strong className="text-[var(--color-ink)]">Exported PDF is set to hide the VAT breakdown</strong> (net
                total only).
              </>
            ) : null}
          </p>
          <ul className="mt-3 space-y-1 text-[var(--color-ink)]">
            <li className="flex justify-between">
              <span>Net (ex VAT)</span>
              <span>£{pdfPreviewTotals.subtotal.toFixed(2)}</span>
            </li>
            {pdfPreviewTotals.showTaxOnPdf !== false ? (
              <li className="flex justify-between">
                <span>VAT @ {invoice.taxRate}%</span>
                <span>£{pdfPreviewTotals.tax.toFixed(2)}</span>
              </li>
            ) : null}
            <li className="flex justify-between border-t border-[var(--color-surface)]/10 pt-2 text-base font-semibold">
              <span>{pdfPreviewTotals.showTaxOnPdf !== false ? "Total inc VAT" : "Total (as on PDF)"}</span>
              <span>£{pdfPreviewTotals.total.toFixed(2)}</span>
            </li>
          </ul>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : isNew ? "Create invoice" : "Save changes"}
        </button>
        {!isNew ? (
          <>
            <a
              href={`/admin/invoices/${invoice.id}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-surface)]/15 px-4 py-3 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-band)]/60"
            >
              Export PDF
            </a>
            <button
              type="button"
              onClick={remove}
              disabled={saving}
              className="rounded-lg border border-red-300 bg-red-50/80 px-4 py-3 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-60"
            >
              Delete invoice
            </button>
            <p className="w-full text-xs text-[var(--color-ink-muted)] sm:ml-auto sm:w-auto sm:text-right">
              Export PDF opens a print-ready page with a short reminder to{" "}
              <strong className="text-[var(--color-ink)]">disable headers and footers</strong> in your browser print
              settings for a clean file.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
