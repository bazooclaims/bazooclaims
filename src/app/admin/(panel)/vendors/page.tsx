import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-ui";
import { VendorsTable } from "@/components/admin/tables/VendorsTable";
import { bootstrapAdminIfNeeded, readDb } from "@/lib/admin/store";

export const metadata = { title: "Partners & vendors" };

export default async function VendorsPage() {
  await bootstrapAdminIfNeeded();
  const db = await readDb();
  const vendors = [...db.vendors].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <AdminPageHeader
        title="Partners & vendors"
        description="Courtesy vehicles, solicitors, recovery firms — link them to claims and invoices. Control whether they appear on PDF exports per invoice."
      />
      <p className="mb-6">
        <Link
          href="/admin/vendors/new"
          className="inline-flex rounded-lg bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-white"
        >
          Add partner
        </Link>
      </p>
      <VendorsTable rows={vendors} />
    </>
  );
}
