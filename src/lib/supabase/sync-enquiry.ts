import { isSupabasePrimaryStore } from "@/lib/admin/store-supabase";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import type { Enquiry } from "@/types/admin";

/** Best-effort mirror of enquiries into Supabase when configured. */
export async function syncEnquiryToSupabase(enquiry: Enquiry): Promise<void> {
  if (isSupabasePrimaryStore()) return;
  const supa = getSupabaseServiceRole();
  if (!supa) return;
  try {
    await supa.from("enquiries").upsert(
      {
        id: enquiry.id,
        reference: enquiry.reference,
        status: enquiry.status,
        payload: enquiry,
        created_at: enquiry.createdAt,
        updated_at: enquiry.updatedAt,
      },
      { onConflict: "id" },
    );
  } catch {
    // Non-fatal: local JSON remains source of truth until Supabase is fully wired
  }
}

export async function syncEnquiryUpdateToSupabase(enquiry: Enquiry): Promise<void> {
  await syncEnquiryToSupabase(enquiry);
}
