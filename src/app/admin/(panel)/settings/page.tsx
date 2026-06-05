import { CallMeBotSetupPanel } from "@/components/admin/CallMeBotSetupPanel";
import { CompanyProfileForm } from "@/components/admin/CompanyProfileForm";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { bootstrapAdminIfNeeded, readDb, seedInvoiceTemplatesIfEmpty } from "@/lib/admin/store";
import { getWhatsAppE164 } from "@/config/site";

export const metadata = { title: "Company settings" };

export default async function AdminSettingsPage() {
  await bootstrapAdminIfNeeded();
  await seedInvoiceTemplatesIfEmpty();
  const db = await readDb();

  return (
    <>
      <AdminPageHeader
        title="Company & invoices"
        description="Address, VAT number, and logo appear on printed invoices and PDFs."
      />
      <CompanyProfileForm initial={db.companyProfile} />
      <CallMeBotSetupPanel
        initial={{
          callMeBotApiKey: db.companyProfile.callMeBotApiKey,
          whatsAppNotifyE164: db.companyProfile.whatsAppNotifyE164,
        }}
        defaultPhone={getWhatsAppE164() ?? "447798982626"}
      />
    </>
  );
}
