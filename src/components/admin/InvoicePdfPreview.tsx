/** Embedded invoice layout for the admin detail page (no auto-print). */
export function InvoicePdfPreview({ invoiceId }: { invoiceId: string }) {
  const src = `/admin/invoices/${invoiceId}/print?preview=1`;
  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-[var(--color-surface)]/10 bg-white shadow-sm">
      <div className="border-b border-[var(--color-surface)]/10 bg-[var(--color-band)]/50 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">PDF preview</h2>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
          Same layout as print/export. <strong className="text-[var(--color-ink)]">Export PDF</strong> opens the
          print view — use <strong>Save as PDF</strong> and turn off <strong>Headers and footers</strong> in print
          settings so the file has no URL or date banner.
        </p>
      </div>
      <iframe title="Invoice PDF preview" src={src} className="block h-[min(72vh,880px)] w-full border-0 bg-slate-100" />
    </section>
  );
}
