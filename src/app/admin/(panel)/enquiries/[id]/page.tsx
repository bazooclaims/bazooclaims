import { notFound } from "next/navigation";

import { EnquiryAtAGlance } from "@/components/admin/EnquiryAtAGlance";
import { EnquiryDetailClient } from "@/components/admin/EnquiryDetailClient";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { bootstrapAdminIfNeeded, readDb, seedInvoiceTemplatesIfEmpty } from "@/lib/admin/store";

type Props = { params: Promise<{ id: string }> };

export default async function EnquiryDetailPage({ params }: Props) {
  await bootstrapAdminIfNeeded();
  await seedInvoiceTemplatesIfEmpty();
  const { id } = await params;
  const db = await readDb();
  const enquiry = db.enquiries.find((e) => e.id === id);
  if (!enquiry) notFound();

  const linkedClaimReference =
    enquiry.claimId ? db.claims.find((c) => c.id === enquiry.claimId)?.reference : undefined;

  return (
    <>
      <AdminPageHeader
        title="Intake workspace"
        description="Review the website submission, update pipeline status, and keep internal notes. This screen is the record for an existing lead — not the public wizard."
      />
      <EnquiryAtAGlance enquiry={enquiry} linkedClaimReference={linkedClaimReference} />
      <EnquiryDetailClient enquiry={enquiry} />
    </>
  );
}
