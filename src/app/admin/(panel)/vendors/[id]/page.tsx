import { notFound } from "next/navigation";

import { VendorForm } from "@/components/admin/VendorForm";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { bootstrapAdminIfNeeded, readDb } from "@/lib/admin/store";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const db = await readDb();
  const v = db.vendors.find((x) => x.id === id);
  return { title: v ? v.name : "Partner" };
}

export default async function VendorDetailPage({ params }: Props) {
  await bootstrapAdminIfNeeded();
  const { id } = await params;
  const db = await readDb();
  const vendor = db.vendors.find((v) => v.id === id);
  if (!vendor) notFound();

  return (
    <>
      <AdminPageHeader title={vendor.name} description="Edit partner details used when linking to claims and invoices." />
      <VendorForm initial={vendor} isNew={false} />
    </>
  );
}
