import { getWhatsAppUrl, siteConfig } from "@/config/site";
import type { ClaimIntakePayload } from "@/types/claim";

const FAULT_LABELS: Record<ClaimIntakePayload["faultStatus"], string> = {
  non_fault: "Non-fault",
  fault: "My fault / split",
  unknown: "Not sure yet",
};

export type EnquiryWhatsAppInput = ClaimIntakePayload & {
  reference: string;
};

/** Formats a website enquiry for WhatsApp (wa.me prefill to the business number). */
export function enquiryIntakeWhatsAppMessage(data: EnquiryWhatsAppInput): string {
  const reg = data.vehicleRegistration.trim().toUpperCase().replace(/\s/g, "");
  const lines: string[] = [
    `New enquiry — ${siteConfig.name}`,
    `Enquiry ref: ${data.reference}`,
  ];

  if (data.clientReference?.trim()) {
    lines.push(`Client ref: ${data.clientReference.trim()}`);
  }

  lines.push(
    "",
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Vehicle: ${reg}`,
    `Incident date: ${data.incidentDate}`,
    `Fault: ${FAULT_LABELS[data.faultStatus]}`,
    "",
    "What happened:",
    data.message.trim().slice(0, 1200),
  );

  const urls = data.attachmentUrls?.filter(Boolean) ?? [];
  if (urls.length > 0) {
    lines.push("", "Photo links:");
    for (const url of urls.slice(0, 8)) {
      lines.push(url);
    }
  }

  return lines.join("\n");
}

/** Opens WhatsApp to the configured business number with enquiry details prefilled. */
export function enquiryWhatsAppUrl(data: EnquiryWhatsAppInput): string | null {
  return getWhatsAppUrl(enquiryIntakeWhatsAppMessage(data));
}
