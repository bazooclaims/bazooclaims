import { NextResponse } from "next/server";

import { bootstrapAdminIfNeeded, buildEnquiryFromIntake, logActivity, readDb, writeDb } from "@/lib/admin/store";
import { notifyEnquirySubmitted } from "@/lib/notify/enquiry-notify";
import { parseClaimIntake } from "@/lib/validators/claim-intake";
import { syncEnquiryToSupabase } from "@/lib/supabase/sync-enquiry";
import type { ClaimIntakeResponse } from "@/types/claim";

/** Validates wizard payload and stores an enquiry only — no claim until staff convert it. */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json<ClaimIntakeResponse>(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = parseClaimIntake(json);
  if (!parsed.ok) {
    return NextResponse.json<ClaimIntakeResponse>(
      { ok: false, error: parsed.error },
      { status: 422 },
    );
  }

  await bootstrapAdminIfNeeded();
  const db = await readDb();
  const enquiry = buildEnquiryFromIntake(
    {
      ...parsed.data,
      attachmentUrls: parsed.data.attachmentUrls ?? [],
    },
    db,
  );

  await writeDb((d) => {
    d.enquiries.unshift(enquiry);
  });
  await syncEnquiryToSupabase(enquiry);
  await logActivity({
    actorId: "system",
    actorName: "Website",
    action: "New enquiry submitted",
    entityType: "enquiry",
    entityId: enquiry.id,
    detail: enquiry.reference,
  });

  const notifications = await notifyEnquirySubmitted({
    ...parsed.data,
    reference: enquiry.reference,
    attachmentUrls: parsed.data.attachmentUrls ?? [],
  });

  const persistence =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "supabase"
      : "none";

  return NextResponse.json<ClaimIntakeResponse>({
    ok: true,
    reference: enquiry.reference,
    clientReference: enquiry.clientReference,
    persistence,
    notifications,
  });
}
