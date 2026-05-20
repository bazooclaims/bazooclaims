import { defaultCompanyProfile } from "@/lib/admin/defaults";
import type {
  ActivityEntry,
  AdminClaim,
  AdminDatabase,
  CompanyProfile,
  Enquiry,
  Invoice,
  InvoiceTemplate,
  StaffMember,
  Vendor,
} from "@/types/admin";

export function emptyDb(): AdminDatabase {
  return {
    version: 2,
    staff: [],
    claims: [],
    invoices: [],
    invoiceTemplates: [],
    activity: [],
    companyProfile: defaultCompanyProfile(),
    enquiries: [],
    vendors: [],
  };
}

export function normalizeDb(parsed: unknown): AdminDatabase {
  const d = parsed as Partial<AdminDatabase> & Record<string, unknown>;
  const base = emptyDb();
  return {
    version: 2,
    staff: Array.isArray(d.staff) ? (d.staff as StaffMember[]) : base.staff,
    claims: Array.isArray(d.claims)
      ? (d.claims as AdminClaim[]).map((c) => ({
          ...c,
          linkedVendorIds: Array.isArray((c as { linkedVendorIds?: unknown }).linkedVendorIds)
            ? (c as { linkedVendorIds: string[] }).linkedVendorIds
            : undefined,
          checklist: (c.checklist ?? []).map((item) => ({
            ...item,
            skipped: Boolean((item as { skipped?: boolean }).skipped),
          })),
        }))
      : base.claims,
    invoices: Array.isArray(d.invoices) ? (d.invoices as Invoice[]) : base.invoices,
    invoiceTemplates: Array.isArray(d.invoiceTemplates)
      ? (d.invoiceTemplates as InvoiceTemplate[])
      : base.invoiceTemplates,
    activity: Array.isArray(d.activity) ? (d.activity as ActivityEntry[]) : base.activity,
    companyProfile:
      d.companyProfile && typeof d.companyProfile === "object"
        ? { ...defaultCompanyProfile(), ...(d.companyProfile as CompanyProfile) }
        : defaultCompanyProfile(),
    enquiries: Array.isArray(d.enquiries) ? (d.enquiries as Enquiry[]) : base.enquiries,
    vendors: Array.isArray(d.vendors) ? (d.vendors as Vendor[]) : base.vendors,
  };
}
