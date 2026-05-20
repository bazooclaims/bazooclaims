import { getSupabaseServiceRole } from "@/lib/supabase/server";
import { normalizeSupabaseUrl } from "@/lib/supabase/normalize-url";
import { defaultCompanyProfile } from "@/lib/admin/defaults";
import { normalizeDb } from "@/lib/admin/normalize-admin-db";
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

/** When URL + service role are set, the CRM uses Postgres as the source of truth (not data/admin-db.json). */
export function isSupabasePrimaryStore(): boolean {
  return Boolean(
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

type StaffRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  password_hash: string | null;
  auth_user_id: string | null;
  created_at: string;
};

function staffFromRow(row: StaffRow): StaffMember {
  return {
    id: row.id,
    email: String(row.email).toLowerCase(),
    name: row.name,
    passwordHash: row.password_hash ?? "",
    role: row.role as StaffMember["role"],
    active: row.active,
    createdAt: row.created_at,
    authUserId: row.auth_user_id ?? undefined,
  };
}

export async function readAdminDatabaseFromSupabase(): Promise<AdminDatabase> {
  const supa = getSupabaseServiceRole();
  if (!supa) throw new Error("Supabase service role not configured");

  const [
    profileRes,
    staffRes,
    claimsRes,
    invoicesRes,
    tplRes,
    actRes,
    enqRes,
    vendRes,
  ] = await Promise.all([
    supa.from("company_profile").select("payload").eq("id", "default").maybeSingle(),
    supa.from("staff").select("*"),
    supa.from("claims").select("*"),
    supa.from("invoices").select("*"),
    supa.from("invoice_templates").select("*"),
    supa.from("activity").select("*"),
    supa.from("enquiries").select("*"),
    supa.from("vendors").select("*"),
  ]);

  const errors = [
    profileRes.error,
    staffRes.error,
    claimsRes.error,
    invoicesRes.error,
    tplRes.error,
    actRes.error,
    enqRes.error,
    vendRes.error,
  ].filter(Boolean);
  if (errors.length) {
    const msg = errors.map((e) => e?.message).join("; ");
    const urlHint =
      /Invalid path specified in request URL/i.test(msg) || /invalid path/i.test(msg)
        ? " Check NEXT_PUBLIC_SUPABASE_URL: use the project base only (e.g. https://YOUR_REF.supabase.co) — no /rest/v1, no trailing slash."
        : "";
    throw new Error(
      `Supabase read failed: ${msg}.${urlHint} Ensure migrations in supabase/migrations are applied (including 004_vendors.sql).`,
    );
  }

  let companyProfile: CompanyProfile = defaultCompanyProfile();
  const pRow = profileRes.data as { payload?: unknown } | null;
  if (pRow?.payload && typeof pRow.payload === "object") {
    companyProfile = { ...defaultCompanyProfile(), ...(pRow.payload as CompanyProfile) };
  }

  const staff = ((staffRes.data ?? []) as StaffRow[]).map(staffFromRow);

  const claims: AdminClaim[] = (claimsRes.data ?? []).map((r: Record<string, unknown>) => {
    const pl = (r.payload as Partial<AdminClaim> | null) ?? {};
    return {
      ...pl,
      id: String(r.id),
      reference: String(r.reference ?? pl.reference ?? ""),
      status: (r.status as AdminClaim["status"]) ?? pl.status ?? "new",
      createdAt: String(r.created_at ?? pl.createdAt ?? ""),
      updatedAt: String(r.updated_at ?? pl.updatedAt ?? ""),
    } as AdminClaim;
  });

  const invoices: Invoice[] = (invoicesRes.data ?? []).map((r: Record<string, unknown>) => {
    const pl = (r.payload as Partial<Invoice> | null) ?? {};
    const claimId = (r.claim_id as string | null | undefined) ?? pl.claimId;
    return {
      ...pl,
      id: String(r.id),
      number: String(r.number ?? pl.number ?? ""),
      claimId: claimId || undefined,
      createdAt: String(r.created_at ?? pl.createdAt ?? ""),
      updatedAt: String(r.updated_at ?? pl.updatedAt ?? ""),
    } as Invoice;
  });

  const invoiceTemplates: InvoiceTemplate[] = (tplRes.data ?? []).map((r: Record<string, unknown>) => {
    const pl = (r.payload as Partial<InvoiceTemplate> | null) ?? {};
    return {
      ...pl,
      id: String(r.id),
      name: String(r.name ?? pl.name ?? ""),
      createdAt: String(r.created_at ?? pl.createdAt ?? ""),
    } as InvoiceTemplate;
  });

  const activity: ActivityEntry[] = (actRes.data ?? [])
    .map((r: Record<string, unknown>) => {
      const pl = (r.payload as Partial<ActivityEntry> | null) ?? {};
      return {
        ...pl,
        id: String(r.id),
        at: String(r.at ?? pl.at ?? ""),
      } as ActivityEntry;
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const enquiries: Enquiry[] = (enqRes.data ?? []).map((r: Record<string, unknown>) => {
    const pl = (r.payload as Partial<Enquiry> | null) ?? {};
    return {
      ...pl,
      id: String(r.id),
      reference: String(r.reference ?? pl.reference ?? ""),
      status: (r.status as Enquiry["status"]) ?? pl.status ?? "new",
      createdAt: String(r.created_at ?? pl.createdAt ?? ""),
      updatedAt: String(r.updated_at ?? pl.updatedAt ?? ""),
    } as Enquiry;
  });

  const vendors: Vendor[] = (vendRes.data ?? []).map((r: Record<string, unknown>) => {
    const pl = (r.payload as Partial<Vendor> | null) ?? {};
    return {
      ...pl,
      id: String(r.id),
      createdAt: String(r.created_at ?? pl.createdAt ?? ""),
      updatedAt: String(r.updated_at ?? pl.updatedAt ?? ""),
    } as Vendor;
  });

  return normalizeDb({
    version: 2,
    staff,
    claims,
    invoices,
    invoiceTemplates,
    activity,
    companyProfile,
    enquiries,
    vendors,
  });
}

const UPSERT_CHUNK = 60;

async function upsertChunk(
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string,
): Promise<void> {
  if (rows.length === 0) return;
  const supa = getSupabaseServiceRole();
  if (!supa) throw new Error("Supabase not configured");
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK);
    const { error } = await supa.from(table).upsert(chunk, { onConflict });
    if (error) throw new Error(`${table} upsert: ${error.message}`);
  }
}

async function deleteIdsNotInLocal(table: string, localIds: string[]): Promise<void> {
  const supa = getSupabaseServiceRole();
  if (!supa) throw new Error("Supabase not configured");
  const { data, error } = await supa.from(table).select("id");
  if (error) throw new Error(`${table} list ids: ${error.message}`);
  const local = new Set(localIds);
  const toRemove = (data ?? []).map((d: { id: string }) => d.id).filter((id) => !local.has(id));
  if (toRemove.length === 0) return;
  const CHUNK = 40;
  for (let i = 0; i < toRemove.length; i += CHUNK) {
    const slice = toRemove.slice(i, i + CHUNK);
    const { error: delErr } = await supa.from(table).delete().in("id", slice);
    if (delErr) throw new Error(`${table} delete: ${delErr.message}`);
  }
}

export async function persistAdminDatabaseToSupabase(db: AdminDatabase): Promise<void> {
  const supa = getSupabaseServiceRole();
  if (!supa) throw new Error("Supabase service role not configured");
  const now = new Date().toISOString();

  const { data: existingStaff } = await supa.from("staff").select("id, auth_user_id");
  const authByStaffId = new Map<string, string | null>(
    (existingStaff ?? []).map((r: { id: string; auth_user_id: string | null }) => [r.id, r.auth_user_id]),
  );

  const { error: cpErr } = await supa.from("company_profile").upsert(
    {
      id: "default",
      payload: db.companyProfile,
      updated_at: now,
    },
    { onConflict: "id" },
  );
  if (cpErr) throw new Error(`company_profile upsert: ${cpErr.message}`);

  const staffRows = db.staff.map((s) => ({
    id: s.id,
    email: s.email,
    name: s.name,
    role: s.role,
    active: s.active,
    password_hash: s.passwordHash || null,
    auth_user_id: s.authUserId ?? authByStaffId.get(s.id) ?? null,
    created_at: s.createdAt,
    updated_at: now,
  }));
  await upsertChunk("staff", staffRows, "id");

  const claimRows = db.claims.map((c) => ({
    id: c.id,
    reference: c.reference,
    status: c.status,
    payload: c,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  }));
  await upsertChunk("claims", claimRows, "id");

  const invoiceRows = db.invoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    claim_id: inv.claimId ?? null,
    payload: inv,
    created_at: inv.createdAt,
    updated_at: inv.updatedAt,
  }));
  await upsertChunk("invoices", invoiceRows, "id");

  const tplRows = db.invoiceTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    payload: t,
    created_at: t.createdAt,
  }));
  await upsertChunk("invoice_templates", tplRows, "id");

  const enqRows = db.enquiries.map((e) => ({
    id: e.id,
    reference: e.reference,
    status: e.status,
    payload: e,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  }));
  await upsertChunk("enquiries", enqRows, "id");

  const vendRows = db.vendors.map((v) => ({
    id: v.id,
    payload: v,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
  }));
  await upsertChunk("vendors", vendRows, "id");

  const actRows = db.activity.map((a) => ({
    id: a.id,
    at: a.at,
    payload: a,
  }));
  await upsertChunk("activity", actRows, "id");

  await deleteIdsNotInLocal("activity", db.activity.map((a) => a.id));
  await deleteIdsNotInLocal("enquiries", db.enquiries.map((e) => e.id));
  await deleteIdsNotInLocal("invoice_templates", db.invoiceTemplates.map((t) => t.id));
  await deleteIdsNotInLocal("invoices", db.invoices.map((i) => i.id));
  await deleteIdsNotInLocal("vendors", db.vendors.map((v) => v.id));
  await deleteIdsNotInLocal("claims", db.claims.map((c) => c.id));
  await deleteIdsNotInLocal("staff", db.staff.map((s) => s.id));
}
