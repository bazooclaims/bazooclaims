import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { newId } from "@/lib/admin/crypto";
import { paginate, parsePageParams } from "@/lib/admin/pagination";
import { logActivity, readDb, writeDb } from "@/lib/admin/store";
import type { Vendor, VendorKind } from "@/types/admin";

const KINDS: VendorKind[] = ["courtesy_hire", "solicitor", "recovery", "insurer", "other"];

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, pageSize, q } = parsePageParams(searchParams, 50);
  const db = await readDb();
  let list = [...db.vendors].sort((a, b) => a.name.localeCompare(b.name));
  if (q) {
    const ql = q.toLowerCase();
    list = list.filter(
      (v) =>
        v.name.toLowerCase().includes(ql) ||
        (v.shortLabel?.toLowerCase().includes(ql) ?? false) ||
        (v.email?.toLowerCase().includes(ql) ?? false) ||
        (v.phone?.includes(q) ?? false),
    );
  }
  return NextResponse.json({ ok: true, ...paginate(list, page, pageSize) });
}

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;

  const body = (await request.json()) as Partial<Vendor>;
  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: "Name required" }, { status: 422 });
  }
  const kind = KINDS.includes(body.kind as VendorKind) ? (body.kind as VendorKind) : "other";
  const now = new Date().toISOString();

  const vendor: Vendor = {
    id: newId("vendor"),
    kind,
    name,
    shortLabel: body.shortLabel?.trim() || undefined,
    email: body.email?.trim() || undefined,
    phone: body.phone?.trim() || undefined,
    address: body.address?.trim() || undefined,
    notes: body.notes?.trim() || undefined,
    allowOnInvoice: Boolean(body.allowOnInvoice),
    createdAt: now,
    updatedAt: now,
  };

  await writeDb((d) => {
    d.vendors.push(vendor);
  });
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Created vendor / partner",
    entityType: "vendor",
    entityId: vendor.id,
    detail: vendor.name,
  });

  return NextResponse.json({ ok: true, vendor }, { status: 201 });
}
