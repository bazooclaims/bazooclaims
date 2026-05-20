import { notFound } from "next/navigation";

import { InvoiceTemplateEditor } from "@/components/admin/InvoiceTemplateEditor";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { bootstrapAdminIfNeeded, readDb, seedInvoiceTemplatesIfEmpty } from "@/lib/admin/store";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  await bootstrapAdminIfNeeded();
  await seedInvoiceTemplatesIfEmpty();
  const { id } = await params;
  const db = await readDb();
  const t = db.invoiceTemplates.find((x) => x.id === id);
  return { title: t ? `Edit: ${t.name}` : "Template" };
}

export default async function EditInvoiceTemplatePage({ params }: Props) {
  await bootstrapAdminIfNeeded();
  await seedInvoiceTemplatesIfEmpty();
  const { id } = await params;
  const db = await readDb();
  const template = db.invoiceTemplates.find((t) => t.id === id);
  if (!template) notFound();

  return (
    <>
      <AdminPageHeader
        title={template.name}
        description="Edit line items, VAT rate, or wording — Save template stores changes for everyone using presaved invoices."
        action={
          <a
            href="/admin/invoices/templates"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-surface)]/15 bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-band)]"
          >
            All templates
          </a>
        }
      />
      <InvoiceTemplateEditor template={template} />
    </>
  );
}
