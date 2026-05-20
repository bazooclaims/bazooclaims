"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { inputClass, labelClass } from "@/components/admin/admin-ui";
import { invoiceTotals } from "@/lib/admin/invoice-math";
import type { InvoiceLine, InvoiceTemplate } from "@/types/admin";

function newLine(): InvoiceLine {
  return {
    id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    description: "",
    quantity: 1,
    unitPrice: 0,
  };
}

export function InvoiceTemplateEditor({ template: initial, isNew }: { template: InvoiceTemplate; isNew?: boolean }) {
  const router = useRouter();
  const [template, setTemplate] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totals = invoiceTotals({ lines: template.lines, taxRate: template.taxRate });

  async function save() {
    if (!template.name.trim()) {
      setError("Template name is required");
      return;
    }
    setSaving(true);
    setError(null);
    const url = isNew ? "/api/admin/invoice-templates" : `/api/admin/invoice-templates/${template.id}`;
    const method = isNew ? "POST" : "PATCH";
    const body = isNew
      ? {
          name: template.name.trim(),
          description: template.description?.trim() || undefined,
          taxRate: template.taxRate,
          lines: template.lines.map(({ description, quantity, unitPrice }) => ({
            description,
            quantity,
            unitPrice,
          })),
        }
      : {
          name: template.name.trim(),
          description: template.description?.trim() || undefined,
          taxRate: template.taxRate,
          lines: template.lines,
        };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    if (isNew && data.template?.id) {
      router.push(`/admin/invoices/templates/${data.template.id}`);
      router.refresh();
      return;
    }
    if (data.template) setTemplate(data.template);
    router.refresh();
  }

  async function remove() {
    if (isNew) return;
    if (!confirm(`Delete template “${template.name}”? This cannot be undone.`)) return;
    setSaving(true);
    const res = await fetch(`/api/admin/invoice-templates/${template.id}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/invoices/templates");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}

      <section className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            Template name
            <input
              className={inputClass}
              value={template.name}
              onChange={(e) => setTemplate((t) => ({ ...t, name: e.target.value }))}
              required
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Description <span className="font-normal text-[var(--color-ink-muted)]">(optional)</span>
            <input
              className={inputClass}
              value={template.description ?? ""}
              onChange={(e) => setTemplate((t) => ({ ...t, description: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            VAT %
            <input
              type="number"
              className={inputClass}
              value={template.taxRate}
              onChange={(e) => setTemplate((t) => ({ ...t, taxRate: Number(e.target.value) || 0 }))}
            />
          </label>
        </div>

        <div className="mt-6 border-t border-[var(--color-surface)]/10 pt-6">
          <h3 className="font-medium text-[var(--color-ink)]">Line items</h3>
          <p className="mt-1 max-w-3xl text-xs text-[var(--color-ink-muted)]">
            Same rules as invoices: amounts are <strong>excluding VAT</strong>. Qty can be days or units.
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
              {template.lines.map((line, idx) => {
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
                        value={line.description}
                        onChange={(e) => {
                          const lines = [...template.lines];
                          lines[idx] = { ...line, description: e.target.value };
                          setTemplate((t) => ({ ...t, lines }));
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={`${labelClass} sm:sr-only`}>Qty</label>
                      <input
                        type="number"
                        min={0}
                        step="1"
                        className={`${inputClass} mt-1 sm:mt-0`}
                        value={line.quantity === 0 ? "" : line.quantity}
                        onChange={(e) => {
                          const lines = [...template.lines];
                          const raw = e.target.value;
                          lines[idx] = { ...line, quantity: raw === "" ? 0 : Number(raw) || 0 };
                          setTemplate((t) => ({ ...t, lines }));
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={`${labelClass} sm:sr-only`}>Unit £</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={`${inputClass} mt-1 sm:mt-0`}
                        value={line.unitPrice === 0 ? "" : line.unitPrice}
                        onChange={(e) => {
                          const lines = [...template.lines];
                          const raw = e.target.value;
                          lines[idx] = { ...line, unitPrice: raw === "" ? 0 : Number(raw) || 0 };
                          setTemplate((t) => ({ ...t, lines }));
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <div className="mt-1 flex min-h-[42px] items-center justify-end rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-band)]/40 px-3 text-sm font-medium tabular-nums sm:mt-0">
                        £{lineNet.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-end justify-end sm:col-span-1 sm:pb-0.5">
                      <button
                        type="button"
                        disabled={template.lines.length <= 1}
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-40"
                        onClick={() =>
                          setTemplate((t) => ({
                            ...t,
                            lines: t.lines.length <= 1 ? t.lines : t.lines.filter((_, j) => j !== idx),
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
            onClick={() => setTemplate((t) => ({ ...t, lines: [...t.lines, newLine()] }))}
            className="mt-3 text-sm font-semibold text-[var(--color-surface)] underline underline-offset-2"
          >
            + Add line
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-band)]/40 p-4 text-sm">
          <p className="font-medium text-[var(--color-ink)]">Sample totals (inc VAT)</p>
          <ul className="mt-2 space-y-1 text-[var(--color-ink)]">
            <li className="flex justify-between">
              <span>Net</span>
              <span className="tabular-nums">£{totals.subtotal.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>VAT @ {template.taxRate}%</span>
              <span className="tabular-nums">£{totals.tax.toFixed(2)}</span>
            </li>
            <li className="flex justify-between border-t border-[var(--color-surface)]/10 pt-2 font-semibold">
              <span>Total inc VAT</span>
              <span className="tabular-nums">£{totals.total.toFixed(2)}</span>
            </li>
          </ul>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : isNew ? "Create template" : "Save template"}
        </button>
        <Link
          href="/admin/invoices/templates"
          className="inline-flex items-center rounded-lg border border-[var(--color-surface)]/15 px-4 py-3 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-band)]/60"
        >
          Back to templates
        </Link>
        {!isNew ? (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="rounded-lg border border-red-300 bg-red-50/80 px-4 py-3 text-sm font-semibold text-red-800 disabled:opacity-60"
          >
            Delete template
          </button>
        ) : null}
      </div>
    </div>
  );
}
