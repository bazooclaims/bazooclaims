import { InvoiceManageForm } from "@/components/admin/InvoiceManageForm";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { newId } from "@/lib/admin/crypto";
import {
  bootstrapAdminIfNeeded,
  readDb,
  RECOVERY_STORAGE_READY_MADE_TEMPLATE_NAME,
  seedInvoiceTemplatesIfEmpty,
} from "@/lib/admin/store";
import type { Invoice } from "@/types/admin";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata = { title: "New invoice" };

export default async function NewInvoicePage({ searchParams }: Props) {
  await bootstrapAdminIfNeeded();
  await seedInvoiceTemplatesIfEmpty();
  const sp = await searchParams;
  const claimId = typeof sp.claimId === "string" ? sp.claimId : undefined;
  const templateId = typeof sp.template === "string" ? sp.template : undefined;

  const db = await readDb();
  const claim = claimId ? db.claims.find((c) => c.id === claimId) : undefined;
  const recoveryTpl = db.invoiceTemplates.find((t) => t.name === RECOVERY_STORAGE_READY_MADE_TEMPLATE_NAME);
  const effectiveTemplateId =
    templateId ?? (claimId && recoveryTpl ? recoveryTpl.id : undefined);
  const tpl = effectiveTemplateId ? db.invoiceTemplates.find((t) => t.id === effectiveTemplateId) : undefined;
  const today = new Date().toISOString().slice(0, 10);

  const notesFromClaim =
    claim &&
    [`Claim ${claim.reference}`, `VRM ${claim.vehicleRegistration}`, claim.phone ? `Tel ${claim.phone}` : null]
      .filter(Boolean)
      .join(" · ");

  const draft: Invoice = {
    id: "",
    number: "",
    claimId: claim?.id,
    status: "draft",
    clientName: claim?.fullName ?? "",
    clientEmail: claim?.email,
    clientPhone: claim?.phone?.trim() ? claim.phone : undefined,
    clientAddress: claim?.clientAddress?.trim() ? claim.clientAddress : undefined,
    issueDate: today,
    dueDate: today,
    lines: tpl
      ? tpl.lines.map((l) => ({ ...l, id: newId("line") }))
      : [{ id: newId("line"), description: "Service", quantity: 1, unitPrice: 0 }],
    taxRate: tpl?.taxRate ?? 20,
    notes: notesFromClaim || undefined,
    linkedVendorIds: claim?.linkedVendorIds?.length ? [...claim.linkedVendorIds] : undefined,
    showLinkedVendorsOnPdf: false,
    createdAt: today,
    updatedAt: today,
    createdById: "",
  };

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
        title="New invoice"
        description={
          claim
            ? `Linked to ${claim.reference} (${claim.vehicleRegistration}) — client and lines prefilled. Change claim or template below if needed.`
            : "Build an invoice with line items and optional claim link. Open from a claim to prefill client details."
        }
      />
      <InvoiceManageForm
        invoice={draft}
        claims={claims}
        templates={db.invoiceTemplates}
        vendors={db.vendors.map((v) => ({
          id: v.id,
          name: v.name,
          kind: v.kind,
          allowOnInvoice: v.allowOnInvoice,
        }))}
        staff={db.staff.map((s) => ({ id: s.id, name: s.name, role: s.role, active: s.active }))}
        isNew
      />
    </>
  );
}
