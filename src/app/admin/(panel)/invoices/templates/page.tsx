import Link from "next/link";

import { AdminButton, AdminPageHeader } from "@/components/admin/admin-ui";
import { bootstrapAdminIfNeeded, invoiceTotals, readDb, seedInvoiceTemplatesIfEmpty } from "@/lib/admin/store";

export const metadata = { title: "Invoice templates" };

export default async function InvoiceTemplatesPage() {
  await bootstrapAdminIfNeeded();
  await seedInvoiceTemplatesIfEmpty();
  const db = await readDb();

  return (
    <>
      <AdminPageHeader
        title="Presaved invoice templates"
        description="Edit any template’s lines and VAT rate, or create a new one. “Use template” still opens a new invoice with these lines prefilled."
        action={
          <div className="flex flex-wrap gap-2">
            <AdminButton href="/admin/invoices/templates/new" variant="secondary">
              New template
            </AdminButton>
            <AdminButton href="/admin/invoices/new">New invoice</AdminButton>
          </div>
        }
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {db.invoiceTemplates.map((t) => {
          const { total } = invoiceTotals({ lines: t.lines, taxRate: t.taxRate });
          return (
            <li key={t.id} className="rounded-xl border border-[var(--color-surface)]/10 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-[var(--color-ink)]">{t.name}</h3>
              {t.description ? <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{t.description}</p> : null}
              <ul className="mt-3 space-y-1 text-xs text-[var(--color-ink-muted)]">
                {t.lines.map((l) => (
                  <li key={l.id}>
                    {l.description} ×{l.quantity} @ £{l.unitPrice}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-medium text-[var(--color-surface)]">From £{total.toFixed(2)} + VAT</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Link
                  href={`/admin/invoices/templates/${t.id}`}
                  className="font-semibold text-[var(--color-surface)] hover:underline"
                >
                  Edit template
                </Link>
                <Link
                  href={`/admin/invoices/new?template=${t.id}`}
                  className="font-medium text-[var(--color-accent)] hover:underline"
                >
                  Use template →
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
