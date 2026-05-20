import { InvoiceTemplateEditor } from "@/components/admin/InvoiceTemplateEditor";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { newId } from "@/lib/admin/crypto";
import { bootstrapAdminIfNeeded, readDb, seedInvoiceTemplatesIfEmpty } from "@/lib/admin/store";
import type { InvoiceTemplate } from "@/types/admin";

export const metadata = { title: "New invoice template" };

export default async function NewInvoiceTemplatePage() {
  await bootstrapAdminIfNeeded();
  await seedInvoiceTemplatesIfEmpty();
  await readDb();
  const now = new Date().toISOString();
  const draft: InvoiceTemplate = {
    id: "",
    name: "",
    description: undefined,
    taxRate: 20,
    lines: [{ id: newId("line"), description: "", quantity: 1, unitPrice: 0 }],
    createdAt: now,
  };

  return (
    <>
      <AdminPageHeader
        title="New invoice template"
        description="Define a reusable set of line items and VAT rate. Save to add it to the presaved list."
        action={
          <a
            href="/admin/invoices/templates"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-surface)]/15 bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-band)]"
          >
            All templates
          </a>
        }
      />
      <InvoiceTemplateEditor template={draft} isNew />
    </>
  );
}
