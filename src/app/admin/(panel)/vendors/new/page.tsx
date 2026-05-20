import { VendorForm } from "@/components/admin/VendorForm";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata = { title: "New partner" };

export default function NewVendorPage() {
  return (
    <>
      <AdminPageHeader title="New partner" description="Add a courtesy provider, solicitor, or other partner for claims and invoices." />
      <VendorForm initial={null} isNew />
    </>
  );
}
