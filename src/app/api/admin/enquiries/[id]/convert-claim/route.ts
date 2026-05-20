import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { buildClaimFromIntake, logActivity, readDb, writeDb } from "@/lib/admin/store";
import { syncEnquiryUpdateToSupabase } from "@/lib/supabase/sync-enquiry";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;

  const dbBefore = await readDb();
  const existing = dbBefore.enquiries.find((e) => e.id === id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (existing.claimId) {
    const claim = dbBefore.claims.find((c) => c.id === existing.claimId);
    return NextResponse.json({
      ok: true,
      claimId: existing.claimId,
      reference: claim?.reference ?? "",
      already: true,
    });
  }

  let claimRef = "";
  let claimId = "";

  await writeDb((db) => {
    const enquiry = db.enquiries.find((e) => e.id === id);
    if (!enquiry || enquiry.claimId) return;
    const claim = buildClaimFromIntake(
      {
        fullName: enquiry.fullName,
        email: enquiry.email,
        phone: enquiry.phone,
        vehicleRegistration: enquiry.vehicleRegistration,
        incidentDate: enquiry.incidentDate,
        faultStatus: enquiry.faultStatus,
        message: enquiry.message,
        attachmentUrls: enquiry.attachmentUrls.length ? enquiry.attachmentUrls : undefined,
      },
      db,
      "enquiry",
    );
    db.claims.push(claim);
    enquiry.status = "converted";
    enquiry.claimId = claim.id;
    enquiry.updatedAt = new Date().toISOString();
    claimId = claim.id;
    claimRef = claim.reference;
  });

  const dbAfter = await readDb();
  const enq = dbAfter.enquiries.find((e) => e.id === id);
  if (enq) await syncEnquiryUpdateToSupabase(enq);

  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Converted enquiry to claim",
    entityType: "enquiry",
    entityId: id,
    detail: claimRef,
  });

  return NextResponse.json({ ok: true, claimId, reference: claimRef });
}
