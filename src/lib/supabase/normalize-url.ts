/**
 * Supabase-js expects the project URL only (origin). A trailing `/rest/v1`, `/graphql`,
 * or trailing slashes breaks REST requests with "Invalid path specified in request URL".
 */
export function normalizeSupabaseUrl(raw: string | undefined | null): string | null {
  const t = raw?.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.origin;
  } catch {
    const collapsed = t.replace(/\/+$/, "");
    return collapsed.length > 0 ? collapsed : null;
  }
}
