import { getWhatsAppUrl } from "@/config/site";
import { invoicePdfTotals } from "@/lib/admin/invoice-math";
import type { AdminClaim, Invoice } from "@/types/admin";

/** UK 0… or international digits → E.164-style digits for wa.me (no + prefix). */
export function normalizePhoneForWhatsApp(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  if (digits.startsWith("0") && digits.length >= 10 && digits.length <= 11) {
    digits = `44${digits.slice(1)}`;
  }
  return digits;
}

/** Opens WhatsApp to *this* number (e.g. client mobile) with optional prefilled message. */
export function getWhatsAppUrlToNumber(phone: string, prefill?: string): string | null {
  const digits = normalizePhoneForWhatsApp(phone.trim());
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  if (!prefill) return base;
  return `${base}?text=${encodeURIComponent(prefill)}`;
}

export function invoiceWhatsAppToClientMessage(invoice: Invoice): string {
  const t = invoicePdfTotals(invoice);
  const totalLine =
    t.showTaxOnPdf === false
      ? `Total: £${t.total.toFixed(2)} (net; PDF export hides VAT).`
      : `Total inc VAT: £${t.total.toFixed(2)}.`;
  return [
    `Hi ${invoice.clientName},`,
    `Re invoice ${invoice.number} (issued ${invoice.issueDate}, due ${invoice.dueDate}).`,
    totalLine,
    `Please reply if you need a PDF copy or have any questions.`,
  ].join("\n");
}

export function claimWhatsAppUrl(claim: AdminClaim): string | null {
  const prefill = [
    `Hi, regarding claim ${claim.reference}.`,
    `Client: ${claim.fullName}`,
    `Vehicle: ${claim.vehicleRegistration}`,
    claim.vehicleMakeModel ? `Make & model: ${claim.vehicleMakeModel}` : "",
    claim.message ? `Notes: ${claim.message.slice(0, 200)}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return getWhatsAppUrl(prefill);
}
