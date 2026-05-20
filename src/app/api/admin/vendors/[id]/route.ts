import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { logActivity, readDb, writeDb } from "@/lib/admin/store";
import type { VendorKind } from "@/types/admin";

type Params = { params: Promise<{ id: string }> };

const KINDS: VendorKind[] = ["courtesy_hire", "solicitor", "recovery", "insurer", "other"];

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const db = await readDb();
  const vendor = db.vendors.find((v) => v.id === id);
  if (!vendor) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, vendor });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = (await request.json()) as Partial<{
    kind: VendorKind;
    name: string;
    shortLabel: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
    allowOnInvoice: boolean;
  }>;

  let found = false;
  await writeDb((db) => {
    const v = db.vendors.find((x) => x.id === id);
    if (!v) return;
    found = true;
    if (typeof body.name === "string" && body.name.trim()) v.name = body.name.trim();
    if (body.kind !== undefined && KINDS.includes(body.kind)) v.kind = body.kind;
    if (body.shortLabel !== undefined) v.shortLabel = body.shortLabel.trim() || undefined;
    if (body.email !== undefined) v.email = body.email.trim() || undefined;
    if (body.phone !== undefined) v.phone = body.phone.trim() || undefined;
    if (body.address !== undefined) v.address = body.address.trim() || undefined;
    if (body.notes !== undefined) v.notes = body.notes.trim() || undefined;
    if (typeof body.allowOnInvoice === "boolean") v.allowOnInvoice = body.allowOnInvoice;
    v.updatedAt = new Date().toISOString();
  });

  if (!found) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Updated vendor / partner",
    entityType: "vendor",
    entityId: id,
  });
  const db = await readDb();
  return NextResponse.json({ ok: true, vendor: db.vendors.find((x) => x.id === id) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;

  let name = "";
  await writeDb((db) => {
    const idx = db.vendors.findIndex((v) => v.id === id);
    if (idx === -1) return;
    name = db.vendors[idx]!.name;
    db.vendors.splice(idx, 1);
    for (const c of db.claims) {
      if (c.linkedVendorIds?.length) {
        c.linkedVendorIds = c.linkedVendorIds.filter((x) => x !== id);
        if (c.linkedVendorIds.length === 0) delete c.linkedVendorIds;
      }
    }
    for (const inv of db.invoices) {
      if (inv.linkedVendorIds?.length) {
        inv.linkedVendorIds = inv.linkedVendorIds.filter((x) => x !== id);
        if (inv.linkedVendorIds.length === 0) delete inv.linkedVendorIds;
      }
    }
  });

  if (!name) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Deleted vendor / partner",
    entityType: "vendor",
    entityId: id,
    detail: name,
  });
  return NextResponse.json({ ok: true });
}
