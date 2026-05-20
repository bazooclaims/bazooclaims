/** Built-in admin slug — grants full admin API access when role matches (case-insensitive). */
export const ADMIN_ROLE_SLUG = "admin";

export const DEFAULT_STAFF_ROLE_SUGGESTIONS = [
  "admin",
  "handler",
  "Claims handler",
  "Account manager",
  "Office manager",
  "Director",
] as const;

/** Normalise a free-text role label (1–48 chars). */
export function normalizeStaffRole(raw: unknown, fallback = "handler"): string {
  if (typeof raw !== "string") return fallback;
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return fallback;
  return t.slice(0, 48);
}

export function isAdminRole(role: string): boolean {
  return normalizeStaffRole(role).toLowerCase() === ADMIN_ROLE_SLUG;
}

export function roleSuggestionsFromStaff(roles: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of [...DEFAULT_STAFF_ROLE_SUGGESTIONS, ...roles]) {
    const n = normalizeStaffRole(r, "");
    if (!n || seen.has(n.toLowerCase())) continue;
    seen.add(n.toLowerCase());
    out.push(n);
  }
  return out;
}
