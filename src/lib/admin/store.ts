import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { hashPassword, newId } from "@/lib/admin/crypto";
import { createDefaultChecklist } from "@/lib/admin/checklist";
import { defaultCompanyProfile } from "@/lib/admin/defaults";
import { normalizeDb } from "@/lib/admin/normalize-admin-db";
import {
  isSupabasePrimaryStore,
  persistAdminDatabaseToSupabase,
  readAdminDatabaseFromSupabase,
} from "@/lib/admin/store-supabase";
import type { ActivityEntry, AdminClaim, AdminDatabase, Enquiry, Invoice, InvoiceTemplate, StaffMember } from "@/types/admin";

const DB_PATH = path.join(process.cwd(), "data", "admin-db.json");

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDbFile(): Promise<AdminDatabase> {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    const raw = await readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const normalized = normalizeDb(parsed);
    const prev = JSON.stringify(parsed);
    const next = JSON.stringify(normalized);
    if (prev !== next) {
      await writeFile(DB_PATH, JSON.stringify(normalized, null, 2), "utf8");
    }
    return normalized;
  } catch {
    const db = normalizeDb({});
    await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export async function readDb(): Promise<AdminDatabase> {
  if (isSupabasePrimaryStore()) {
    return readAdminDatabaseFromSupabase();
  }
  return ensureDbFile();
}

export async function writeDb(mutator: (db: AdminDatabase) => void): Promise<AdminDatabase> {
  let result!: AdminDatabase;
  writeQueue = writeQueue.then(async () => {
    if (isSupabasePrimaryStore()) {
      const db = await readAdminDatabaseFromSupabase();
      mutator(db);
      result = db;
      await persistAdminDatabaseToSupabase(db);
    } else {
      const db = await ensureDbFile();
      mutator(db);
      result = db;
      await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
    }
  });
  await writeQueue;
  return result;
}

export { isSupabasePrimaryStore } from "@/lib/admin/store-supabase";

export async function bootstrapAdminIfNeeded(): Promise<void> {
  const db = await readDb();
  if (db.staff.length > 0) return;

  // Supabase-primary: no local bootstrap — use /admin/register instead.
  if (isSupabasePrimaryStore() || process.env.ADMIN_SUPABASE_AUTH_ONLY === "true") {
    return;
  }

  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@bazooclaims.co.uk").toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "ChangeMe123!";
  const name = process.env.ADMIN_BOOTSTRAP_NAME ?? "BAZOO Admin";

  const staff: StaffMember = {
    id: newId("staff"),
    name,
    email,
    passwordHash: hashPassword(password),
    role: "admin",
    active: true,
    createdAt: new Date().toISOString(),
  };

  await writeDb((d) => {
    d.staff.push(staff);
    d.activity.push({
      id: newId("act"),
      at: new Date().toISOString(),
      actorId: staff.id,
      actorName: staff.name,
      action: "Bootstrap admin account created",
      entityType: "system",
      detail: email,
    });
  });
}

export async function logActivity(
  entry: Omit<ActivityEntry, "id" | "at"> & { at?: string },
): Promise<void> {
  await writeDb((db) => {
    db.activity.unshift({
      id: newId("act"),
      at: entry.at ?? new Date().toISOString(),
      ...entry,
    });
    if (db.activity.length > 500) db.activity.length = 500;
  });
}

export function nextClaimReference(db: AdminDatabase): string {
  const n = db.claims.length + 1;
  return `BZ-${String(n).padStart(5, "0")}`;
}

export function nextEnquiryReference(db: AdminDatabase): string {
  const n = db.enquiries.length + 1;
  return `ENQ-${String(n).padStart(5, "0")}`;
}

export function nextInvoiceNumber(db: AdminDatabase): string {
  const year = new Date().getFullYear();
  const count = db.invoices.filter((i) => i.number.startsWith(`INV-${year}`)).length + 1;
  return `INV-${year}-${String(count).padStart(4, "0")}`;
}

export function buildClaimFromIntake(
  data: {
    fullName: string;
    email: string;
    phone: string;
    vehicleRegistration: string;
    vehicleMakeModel?: string;
    thirdPartyVehicleMakeModel?: string;
    thirdPartyDetails?: string;
    incidentDate: string;
    faultStatus: AdminClaim["faultStatus"];
    message: string;
    attachmentUrls?: string[];
    clientAddress?: string;
  },
  db: AdminDatabase,
  source: AdminClaim["source"] = "website",
): AdminClaim {
  const now = new Date().toISOString();
  return {
    id: newId("claim"),
    reference: nextClaimReference(db),
    status: "new",
    ...data,
    vehicleMakeModel: data.vehicleMakeModel?.trim() || undefined,
    thirdPartyVehicleMakeModel: data.thirdPartyVehicleMakeModel?.trim() || undefined,
    thirdPartyDetails: data.thirdPartyDetails?.trim() || undefined,
    attachmentUrls: data.attachmentUrls?.length ? data.attachmentUrls : undefined,
    clientAddress: data.clientAddress?.trim() || undefined,
    priority: "normal",
    checklist: createDefaultChecklist(),
    courtesyCar: { supplied: false },
    notes: [],
    invoiceIds: [],
    source,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildEnquiryFromIntake(
  data: {
    fullName: string;
    email: string;
    phone: string;
    vehicleRegistration: string;
    incidentDate: string;
    faultStatus: AdminClaim["faultStatus"];
    message: string;
    consent: boolean;
    attachmentUrls: string[];
    clientReference?: string;
  },
  db: AdminDatabase,
): Enquiry {
  const now = new Date().toISOString();
  return {
    id: newId("enq"),
    reference: nextEnquiryReference(db),
    status: "new",
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    vehicleRegistration: data.vehicleRegistration,
    incidentDate: data.incidentDate,
    faultStatus: data.faultStatus,
    message: data.message,
    consent: data.consent,
    attachmentUrls: data.attachmentUrls,
    clientReference: data.clientReference?.trim() || undefined,
    internalNotes: "",
    createdAt: now,
    updatedAt: now,
  };
}

export { invoiceTotals } from "@/lib/admin/invoice-math";

type InvoiceTemplateSeed = {
  name: string;
  description?: string;
  taxRate: number;
  lines: { description: string; quantity: number; unitPrice: number }[];
};

export const RECOVERY_STORAGE_READY_MADE_TEMPLATE_NAME = "Recovery & storage (ready-made)" as const;

export const DEFAULT_INVOICE_TEMPLATES: InvoiceTemplateSeed[] = [
  {
    name: "Admin fee — standard",
    description: "Standard accident management admin fee",
    taxRate: 20,
    lines: [{ description: "Accident management administration", quantity: 1, unitPrice: 250 }],
  },
  {
    name: "Recovery & storage",
    description: "Recovery and initial storage",
    taxRate: 20,
    lines: [
      { description: "Vehicle recovery", quantity: 1, unitPrice: 180 },
      { description: "Storage (per day)", quantity: 3, unitPrice: 45 },
    ],
  },
  {
    name: RECOVERY_STORAGE_READY_MADE_TEMPLATE_NAME,
    description: "Fixed recovery attendance plus 7 days secure storage — edit prices before sending",
    taxRate: 20,
    lines: [
      { description: "Recovery attendance & uplift to secure compound", quantity: 1, unitPrice: 195 },
      { description: "Secure indoor storage (per day)", quantity: 7, unitPrice: 42 },
      { description: "Compound administration & release documentation", quantity: 1, unitPrice: 65 },
    ],
  },
  {
    name: "Courtesy vehicle hire",
    description: "Credit hire / courtesy vehicle",
    taxRate: 20,
    lines: [{ description: "Courtesy vehicle hire (daily rate)", quantity: 7, unitPrice: 65 }],
  },
];

/** Keep only vendor IDs that exist in the database (deduped). */
export function filterAssignedStaffId(db: AdminDatabase, staffId: unknown): string | undefined {
  if (typeof staffId !== "string" || !staffId.trim()) return undefined;
  const id = staffId.trim();
  const staff = db.staff.find((s) => s.id === id && s.active);
  return staff?.id;
}

export function filterKnownVendorIds(db: AdminDatabase, ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const allowed = new Set(db.vendors.map((v) => v.id));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of ids) {
    if (typeof x !== "string" || !allowed.has(x) || seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

export async function seedInvoiceTemplatesIfEmpty(): Promise<void> {
  const db = await readDb();
  const existingNames = new Set(db.invoiceTemplates.map((t) => t.name));
  const missing = DEFAULT_INVOICE_TEMPLATES.filter((t) => !existingNames.has(t.name));
  if (missing.length === 0) return;
  await writeDb((d) => {
    for (const t of missing) {
      d.invoiceTemplates.push({
        ...t,
        id: newId("tpl"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lines: t.lines.map((l) => ({ ...l, id: newId("line") })),
      });
    }
  });
}
