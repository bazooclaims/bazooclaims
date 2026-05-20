import { notFound } from "next/navigation";

import { InvoiceManageForm } from "@/components/admin/InvoiceManageForm";
import { InvoicePdfPreview } from "@/components/admin/InvoicePdfPreview";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { bootstrapAdminIfNeeded, readDb, seedInvoiceTemplatesIfEmpty } from "@/lib/admin/store";

type Props = { params: Promise<{ id: string }> };

export default async function InvoiceDetailPage({ params }: Props) {
  await bootstrapAdminIfNeeded();
  await seedInvoiceTemplatesIfEmpty();
  const { id } = await params;
  const db = await readDb();
  const invoice = db.invoices.find((i) => i.id === id);
  if (!invoice) notFound();
  const claims = db.claims.map((c) => ({
    id: c.id,
    reference: c.reference,
    fullName: c.fullName,
    email: c.email,
    clientAddress: c.clientAddress,
    phone: c.phone,
  }));

  return (
    <>
      <AdminPageHeader
        title={invoice.number}
        description={`${invoice.clientName} · ${invoice.status} — preview below, then edit or export.`}
        action={
          <div className="flex flex-wrap gap-2">
            <a
              href={`/admin/invoices/${invoice.id}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-surface)]/15 bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-band)]"
            >
              Export PDF
            </a>
            <a
              href="#invoice-editor"
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-surface-2)]"
            >
              Edit invoice
            </a>
          </div>
        }
      />
      <InvoicePdfPreview invoiceId={invoice.id} />
      <div id="invoice-editor">
        <InvoiceManageForm
          invoice={invoice}
          claims={claims}
          templates={db.invoiceTemplates}
          vendors={db.vendors.map((v) => ({
            id: v.id,
            name: v.name,
            kind: v.kind,
            allowOnInvoice: v.allowOnInvoice,
          }))}
          staff={db.staff.map((s) => ({ id: s.id, name: s.name, role: s.role, active: s.active }))}
        />
      </div>
    </>
  );
}
