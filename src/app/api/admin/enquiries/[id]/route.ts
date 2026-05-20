import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { logActivity, readDb, writeDb } from "@/lib/admin/store";
import { syncEnquiryUpdateToSupabase } from "@/lib/supabase/sync-enquiry";
import { parseOptionalEnquiryClientReference } from "@/lib/validators/claim-intake";
import type { Enquiry, EnquiryStatus } from "@/types/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const db = await readDb();
  const enquiry = db.enquiries.find((e) => e.id === id);
  if (!enquiry) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, enquiry });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await request.json();

  /** Object refs so TS narrows after `writeDb`; outer `let` assignments inside the mutator are not tracked. */
  const patch: { found: boolean; enquiry: Enquiry | null } = { found: false, enquiry: null };
  await writeDb((db) => {
    const e = db.enquiries.find((x) => x.id === id);
    if (!e) return;
    patch.found = true;
    if (typeof body.status === "string") {
      const s = body.status as EnquiryStatus;
      if (["new", "follow_up", "called", "closed", "converted"].includes(s)) e.status = s;
    }
    if (typeof body.internalNotes === "string") {
      e.internalNotes = body.internalNotes;
    }
    if ("clientReference" in body) {
      const parsed = parseOptionalEnquiryClientReference(body.clientReference);
      if (parsed.ok) {
        e.clientReference = parsed.clientReference;
      }
    }
    e.updatedAt = new Date().toISOString();
    patch.enquiry = { ...e };
  });
  if (!patch.found || !patch.enquiry) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const updated = patch.enquiry;
  await syncEnquiryUpdateToSupabase(updated);
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Updated enquiry",
    entityType: "enquiry",
    entityId: id,
    detail: updated.status,
  });
  return NextResponse.json({ ok: true, enquiry: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  let ref = "";
  await writeDb((db) => {
    const i = db.enquiries.findIndex((e) => e.id === id);
    if (i === -1) return;
    ref = db.enquiries[i]!.reference;
    db.enquiries.splice(i, 1);
  });
  if (!ref) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Removed enquiry",
    entityType: "enquiry",
    entityId: id,
    detail: ref,
  });
  return NextResponse.json({ ok: true });
}
