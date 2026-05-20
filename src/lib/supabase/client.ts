/**
 * Admin login uses server-side Supabase (`signInWithPassword` in API routes), not a browser SDK.
 * Use this module only if you add client-side Supabase features later.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && key);
}
