import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { paginate, parsePageParams } from "@/lib/admin/pagination";
import { buildClaimFromIntake, filterKnownVendorIds, logActivity, readDb, writeDb } from "@/lib/admin/store";
import type { AdminClaim, ClaimStatus } from "@/types/admin";

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, pageSize, q } = parsePageParams(searchParams);
  const status = searchParams.get("status") as ClaimStatus | null;
  const priority = searchParams.get("priority") as AdminClaim["priority"] | null;
  const source = searchParams.get("source") as AdminClaim["source"] | null;

  const db = await readDb();
  let list = [...db.claims].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  if (status) list = list.filter((c) => c.status === status);
  if (priority) list = list.filter((c) => c.priority === priority);
  if (source) list = list.filter((c) => c.source === source);
  if (q) {
    list = list.filter(
      (c) =>
        c.reference.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.vehicleRegistration.toLowerCase().includes(q) ||
        (c.vehicleMakeModel?.toLowerCase().includes(q) ?? false) ||
        (c.thirdPartyVehicleMakeModel?.toLowerCase().includes(q) ?? false) ||
        c.phone.includes(q) ||
        (c.clientAddress?.toLowerCase().includes(q) ?? false),
    );
  }

  return NextResponse.json({ ok: true, ...paginate(list, page, pageSize) });
}

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;

  const body = (await request.json()) as Partial<AdminClaim>;
  const required = ["fullName", "email", "phone", "vehicleRegistration", "incidentDate"] as const;
  for (const key of required) {
    if (!body[key]?.toString().trim()) {
      return NextResponse.json({ ok: false, error: `Missing ${key}` }, { status: 422 });
    }
  }

  const db = await readDb();
  const claim = buildClaimFromIntake(
    {
      fullName: body.fullName!.trim(),
      email: body.email!.trim(),
      phone: body.phone!.trim(),
      vehicleRegistration: body.vehicleRegistration!.trim().toUpperCase(),
      vehicleMakeModel: typeof body.vehicleMakeModel === "string" ? body.vehicleMakeModel : undefined,
      thirdPartyVehicleMakeModel:
        typeof body.thirdPartyVehicleMakeModel === "string" ? body.thirdPartyVehicleMakeModel : undefined,
      thirdPartyDetails: typeof body.thirdPartyDetails === "string" ? body.thirdPartyDetails : undefined,
      incidentDate: body.incidentDate!,
      faultStatus: body.faultStatus ?? "unknown",
      message: body.message?.trim() ?? "",
      attachmentUrls:
        Array.isArray(body.attachmentUrls) && body.attachmentUrls.length > 0
          ? body.attachmentUrls.filter(
              (u): u is string => typeof u === "string" && u.startsWith("/uploads/"),
            )
          : undefined,
      clientAddress: typeof body.clientAddress === "string" ? body.clientAddress.trim() || undefined : undefined,
    },
    db,
    "admin",
  );
  if (body.status) claim.status = body.status;
  if (body.priority) claim.priority = body.priority;
  if (body.insurerName) claim.insurerName = body.insurerName;
  if (body.assignedToId) claim.assignedToId = body.assignedToId;
  const vendorIds = filterKnownVendorIds(db, body.linkedVendorIds);
  if (vendorIds.length) claim.linkedVendorIds = vendorIds;

  await writeDb((d) => {
    d.claims.push(claim);
  });
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Created claim",
    entityType: "claim",
    entityId: claim.id,
    detail: claim.reference,
  });

  return NextResponse.json({ ok: true, claim }, { status: 201 });
}
