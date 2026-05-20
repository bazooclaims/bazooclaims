import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { normalizeSupabaseUrl } from "@/lib/supabase/normalize-url";

/** Service-role client for trusted server writes. Returns null if env is not configured. */
export function getSupabaseServiceRole(): SupabaseClient | null {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Browser-safe anon client (optional). */
export function getSupabaseServerAnon(): SupabaseClient | null {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
