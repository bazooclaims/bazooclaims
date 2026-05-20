import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { newId } from "@/lib/admin/crypto";
import { filterKnownVendorIds, logActivity, readDb, writeDb } from "@/lib/admin/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const db = await readDb();
  const claim = db.claims.find((c) => c.id === id);
  if (!claim) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const invoices = db.invoices.filter((i) => i.claimId === id);
  const assignee = claim.assignedToId
    ? db.staff.find((s) => s.id === claim.assignedToId)
    : undefined;
  return NextResponse.json({ ok: true, claim, invoices, assignee });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const patch = await request.json();

  let updated = false;
  await writeDb((db) => {
    const claim = db.claims.find((c) => c.id === id);
    if (!claim) return;
    updated = true;
    const fields = [
      "status",
      "fullName",
      "email",
      "phone",
      "vehicleRegistration",
      "vehicleMakeModel",
      "incidentDate",
      "faultStatus",
      "message",
      "clientAddress",
      "insurerName",
      "policyNumber",
      "thirdPartyDetails",
      "thirdPartyVehicleMakeModel",
      "assignedToId",
      "priority",
      "checklist",
      "courtesyCar",
      "invoiceIds",
      "attachmentUrls",
      "linkedVendorIds",
    ] as const;
    for (const f of fields) {
      if (patch[f] !== undefined) {
        if (f === "linkedVendorIds") {
          claim.linkedVendorIds = filterKnownVendorIds(db, patch.linkedVendorIds);
          if (claim.linkedVendorIds.length === 0) delete claim.linkedVendorIds;
        } else if (f === "clientAddress") {
          const v = patch.clientAddress;
          const t = typeof v === "string" ? v.trim() : "";
          if (t) claim.clientAddress = t;
          else delete claim.clientAddress;
        } else if (f === "vehicleMakeModel" || f === "thirdPartyVehicleMakeModel") {
          const v = patch[f];
          if (v === null || v === "") {
            delete (claim as Record<string, unknown>)[f];
          } else if (typeof v === "string") {
            const t = v.trim();
            if (t) (claim as Record<string, unknown>)[f] = t;
            else delete (claim as Record<string, unknown>)[f];
          }
        } else {
          (claim as Record<string, unknown>)[f] = patch[f];
        }
      }
    }
    if (patch.note?.body) {
      claim.notes.unshift({
        id: newId("note"),
        body: String(patch.note.body),
        createdAt: new Date().toISOString(),
        authorId: auth.session!.staffId,
        authorName: auth.session!.name,
      });
    }
    claim.updatedAt = new Date().toISOString();
  });

  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Updated claim",
    entityType: "claim",
    entityId: id,
  });
  const db = await readDb();
  const claim = db.claims.find((c) => c.id === id);
  return NextResponse.json({ ok: true, claim });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  let ref = "";
  await writeDb((db) => {
    const idx = db.claims.findIndex((c) => c.id === id);
    if (idx === -1) return;
    ref = db.claims[idx]!.reference;
    db.claims.splice(idx, 1);
    for (const inv of db.invoices) {
      if (inv.claimId === id) inv.claimId = undefined;
    }
  });
  if (!ref) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Deleted claim",
    entityType: "claim",
    entityId: id,
    detail: ref,
  });
  return NextResponse.json({ ok: true });
}
