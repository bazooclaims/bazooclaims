function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "http://localhost:3000";
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "http://localhost:3000";
    return u.origin;
  } catch {
    return "http://localhost:3000";
  }
}

export const siteConfig = {
  name: "Bazoo Claims",
  tagline: "BAZOO Accident Management",
  description:
    "Enterprise motor claims management: replacement vehicles, repairs, recovery, and end-to-end claim handling — aligned with how leading UK accident management services operate.",
  locale: "en-GB",
  url: resolveSiteUrl(),
  phoneDisplay: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "+44 (0) 20 0000 0000",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@bazooclaims.com",
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/vehicle-replacement", label: "Vehicle replacement" },
  { href: "/why-its-free", label: "Why it’s free" },
  { href: "/start-your-claim", label: "Start an enquiry" },
] as const;

/**
 * Reads the first set value among:
 * - NEXT_PUBLIC_WHATSAPP_E164 (preferred, digits only or with spaces/+)
 * - NEXT_PUBLIC_WHATSAPP_NUMBER
 * - NEXT_PUBLIC_WHATSAPP
 *
 * UK mobiles: if you paste `07700 900123` it becomes `447700900123` for wa.me.
 */
export function getWhatsAppE164(): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_WHATSAPP_E164,
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    process.env.NEXT_PUBLIC_WHATSAPP,
  ];
  let raw: string | undefined;
  for (const c of candidates) {
    const t = c?.trim();
    if (t) {
      raw = t;
      break;
    }
  }
  if (!raw) return null;

  let digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;

  /* UK national mobile / landline starting with 0 → E.164 without + */
  if (digits.startsWith("0") && digits.length >= 10 && digits.length <= 11) {
    digits = `44${digits.slice(1)}`;
  }

  return digits;
}

/** Opens WhatsApp (app or web) with optional prefilled message. */
export function getWhatsAppUrl(prefill?: string): string | null {
  const e164 = getWhatsAppE164();
  if (!e164) return null;
  const base = `https://wa.me/${e164}`;
  if (!prefill) return base;
  return `${base}?text=${encodeURIComponent(prefill)}`;
}
