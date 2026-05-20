import { notFound } from "next/navigation";

import { ClaimAtAGlance } from "@/components/admin/ClaimAtAGlance";
import { ClaimManageForm } from "@/components/admin/ClaimManageForm";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { bootstrapAdminIfNeeded, readDb, RECOVERY_STORAGE_READY_MADE_TEMPLATE_NAME, seedInvoiceTemplatesIfEmpty } from "@/lib/admin/store";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const db = await readDb();
  const claim = db.claims.find((c) => c.id === id);
  return { title: claim ? claim.reference : "Claim" };
}

export default async function ClaimDetailPage({ params }: Props) {
  await bootstrapAdminIfNeeded();
  await seedInvoiceTemplatesIfEmpty();
  const { id } = await params;
  const db = await readDb();
  const claim = db.claims.find((c) => c.id === id);
  if (!claim) notFound();
  const staff = db.staff.filter((s) => s.active).map(({ passwordHash: _, ...s }) => s);
  const linkedInvoices = db.invoices.filter((i) => i.claimId === id);
  const recoveryTpl = db.invoiceTemplates.find((t) => t.name === RECOVERY_STORAGE_READY_MADE_TEMPLATE_NAME);
  const assignee = claim.assignedToId ? db.staff.find((s) => s.id === claim.assignedToId) : undefined;

  return (
    <>
      <AdminPageHeader
        title="Case file workspace"
        description="Review the summary card, then work through the case file editor below. Use Save changes after edits — this is an existing claim, not the new-claim wizard."
      />
      <ClaimAtAGlance
        claim={claim}
        assigneeName={assignee?.name}
        linkedInvoices={linkedInvoices.map((i) => ({ id: i.id, number: i.number }))}
      />
      <ClaimManageForm
        claim={claim}
        staff={staff}
        vendors={db.vendors.map((v) => ({
          id: v.id,
          name: v.name,
          kind: v.kind,
          allowOnInvoice: v.allowOnInvoice,
        }))}
        recoveryInvoiceTemplateId={recoveryTpl?.id}
      />
    </>
  );
}
