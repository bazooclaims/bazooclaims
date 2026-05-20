import { ClaimManageForm } from "@/components/admin/ClaimManageForm";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { createDefaultChecklist } from "@/lib/admin/checklist";
import { bootstrapAdminIfNeeded, readDb } from "@/lib/admin/store";
import type { AdminClaim } from "@/types/admin";

export const metadata = { title: "New claim" };

export default async function NewClaimPage() {
  await bootstrapAdminIfNeeded();
  const db = await readDb();
  const now = new Date().toISOString().slice(0, 10);
  const draft: AdminClaim = {
    id: "",
    reference: "NEW",
    status: "new",
    fullName: "",
    email: "",
    phone: "",
    vehicleRegistration: "",
    incidentDate: now,
    faultStatus: "unknown",
    message: "",
    priority: "normal",
    checklist: createDefaultChecklist(),
    courtesyCar: { supplied: false },
    notes: [],
    invoiceIds: [],
    attachmentUrls: [],
    source: "admin",
    createdAt: now,
    updatedAt: now,
  };
  const staff = db.staff.filter((s) => s.active).map(({ passwordHash: _, ...s }) => s);
  const vendors = db.vendors.map((v) => ({
    id: v.id,
    name: v.name,
    kind: v.kind,
    allowOnInvoice: v.allowOnInvoice,
  }));

  return (
    <>
      <AdminPageHeader title="New claim" description="Create a claim manually in the admin system." />
      <ClaimManageForm claim={draft} staff={staff} vendors={vendors} isNew />
    </>
  );
}
