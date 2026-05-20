export type ClaimStatus =
  | "new"
  | "triage"
  | "active"
  | "awaiting_insurer"
  | "mobility"
  | "repair"
  | "settlement"
  | "closed"
  | "cancelled";

/** Free-text job title / permission label (e.g. admin, Claims handler). */
export type StaffRole = string;

export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  /** Not applicable for this claim — clears the step without marking it “done”. */
  skipped?: boolean;
  doneAt?: string;
  doneBy?: string;
};

export type CourtesyCar = {
  supplied: boolean;
  registration?: string;
  makeModel?: string;
  supplier?: string;
  outDate?: string;
  returnDate?: string;
  dailyRate?: number;
  notes?: string;
};

export type ClaimNote = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string;
};

export type ActivityEntry = {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: "claim" | "invoice" | "staff" | "system" | "enquiry" | "vendor";
  entityId?: string;
  detail?: string;
};

/** Courtesy hire, solicitors, recovery partners — link to claims & invoices */
export type VendorKind = "courtesy_hire" | "solicitor" | "recovery" | "insurer" | "other";

export type Vendor = {
  id: string;
  kind: VendorKind;
  name: string;
  shortLabel?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  /** When true, this vendor may appear on invoice PDFs when linked and “show on PDF” is on */
  allowOnInvoice: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminClaim = {
  id: string;
  reference: string;
  status: ClaimStatus;
  fullName: string;
  email: string;
  phone: string;
  vehicleRegistration: string;
  /** Client / insured vehicle, e.g. Ford Focus Titanium */
  vehicleMakeModel?: string;
  incidentDate: string;
  faultStatus: "non_fault" | "fault" | "unknown";
  message: string;
  attachmentUrls?: string[];
  /** Client postal address — UK-style lines joined with newlines (see UkAddressFields). */
  clientAddress?: string;
  insurerName?: string;
  policyNumber?: string;
  thirdPartyDetails?: string;
  /** Other party vehicle, e.g. VW Golf */
  thirdPartyVehicleMakeModel?: string;
  assignedToId?: string;
  priority: "low" | "normal" | "high" | "urgent";
  checklist: ChecklistItem[];
  courtesyCar: CourtesyCar;
  notes: ClaimNote[];
  invoiceIds: string[];
  /** Partner / supplier directory IDs linked to this claim */
  linkedVendorIds?: string[];
  source: "website" | "admin" | "whatsapp" | "enquiry";
  createdAt: string;
  updatedAt: string;
};

export type InvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  number: string;
  claimId?: string;
  status: InvoiceStatus;
  clientName: string;
  clientEmail?: string;
  /** Client mobile for WhatsApp (UK 07… or E.164); also prefilled from linked claim. */
  clientPhone?: string;
  /** Bill-to address — UK-style lines joined with newlines (see UkAddressFields). */
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  lines: InvoiceLine[];
  notes?: string;
  taxRate: number;
  /** Shown under the invoice number on printed / PDF export (e.g. "Tax invoice", "Proforma invoice"). */
  documentTitle?: string;
  /** When false, VAT line and "inc VAT" wording are omitted on the printed PDF (net total only). Default true. */
  showTaxOnPdf?: boolean;
  linkedVendorIds?: string[];
  /** When true, linked vendors with allowOnInvoice appear on exported PDF */
  showLinkedVendorsOnPdf?: boolean;
  /** Staff member to show on the PDF when {@link showStaffOnPdf} is true */
  assignedStaffId?: string;
  /** Print assigned staff full name and role on exported PDF */
  showStaffOnPdf?: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
};

export type InvoiceTemplate = {
  id: string;
  name: string;
  description?: string;
  lines: InvoiceLine[];
  taxRate: number;
  createdAt: string;
  updatedAt?: string;
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  /** Empty when the account uses Supabase Auth only. */
  passwordHash: string;
  role: StaffRole;
  active: boolean;
  createdAt: string;
  /** Linked Supabase Auth user (auth.users.id) when registered via Supabase. */
  authUserId?: string;
};

/** UK-style company details for invoices & printouts */
export type CompanyProfile = {
  legalName: string;
  tradingName?: string;
  addressLines: string[];
  city?: string;
  postcode?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  vatNumber?: string;
  /** Companies House registration number (UK) */
  companyNumber?: string;
  /** Public path e.g. /uploads/company/logo.png */
  logoPath?: string;
};

export type EnquiryStatus = "new" | "follow_up" | "called" | "closed" | "converted";

/** Website wizard submission before it becomes a managed claim */
export type Enquiry = {
  id: string;
  /** System enquiry number (e.g. ENQ-00001) — not a claim reference. */
  reference: string;
  /** Optional label from the submitter (policy no., file ref, etc.) — distinct from {@link reference}. */
  clientReference?: string;
  status: EnquiryStatus;
  fullName: string;
  email: string;
  phone: string;
  vehicleRegistration: string;
  incidentDate: string;
  faultStatus: "non_fault" | "fault" | "unknown";
  message: string;
  consent: boolean;
  attachmentUrls: string[];
  claimId?: string;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminDatabase = {
  version: 2;
  staff: StaffMember[];
  claims: AdminClaim[];
  invoices: Invoice[];
  invoiceTemplates: InvoiceTemplate[];
  activity: ActivityEntry[];
  companyProfile: CompanyProfile;
  enquiries: Enquiry[];
  vendors: Vendor[];
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
