import type { ClaimIntakePayload } from "@/types/claim";

export type ClaimIntakeFormValues = ClaimIntakePayload;

const phoneOk = (s: string) => /^[\d\s+()-]{10,20}$/.test(s);

const uploadPathOk = (u: string) => /^\/uploads\/(claims|company|admin)\/[a-zA-Z0-9._-]+$/.test(u);

export const ENQUIRY_CLIENT_REF_MAX = 40;

function validEnquiryClientReferenceChars(s: string): boolean {
  return /^[A-Za-z0-9 _./-]+$/.test(s);
}

/** Optional label from the website form — not the system ENQ- number. */
export function parseOptionalEnquiryClientReference(
  value: unknown,
): { ok: true; clientReference?: string } | { ok: false; error: string } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, clientReference: undefined };
  }
  if (typeof value !== "string") {
    return { ok: false, error: "Optional your reference must be text" };
  }
  const t = value.trim().slice(0, ENQUIRY_CLIENT_REF_MAX);
  if (!t.length) return { ok: true, clientReference: undefined };
  if (!validEnquiryClientReferenceChars(t)) {
    return {
      ok: false,
      error: "Your reference may only include letters, numbers, spaces, or these characters: . - / _",
    };
  }
  return { ok: true, clientReference: t };
}

/** Validate wizard steps 0–4 before advancing. Step 5 (review) is validated on submit via {@link parseClaimIntake}. */
export function validateClaimWizardStep(
  step: number,
  v: ClaimIntakePayload,
): { ok: true } | { ok: false; error: string } {
  if (step < 0 || step > 4) {
    return { ok: false, error: "Invalid step" };
  }

  if (step === 0) {
    const fullName = v.fullName.trim();
    if (fullName.length < 2 || fullName.length > 120) {
      return { ok: false, error: "Enter your full name" };
    }
    const email = v.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Enter a valid email" };
    }
    const phone = v.phone.trim();
    if (!phoneOk(phone)) {
      return { ok: false, error: "Enter a UK-style mobile or landline" };
    }
    const cr = parseOptionalEnquiryClientReference(v.clientReference);
    if (!cr.ok) return { ok: false, error: cr.error };
    return { ok: true };
  }

  if (step === 1) {
    const reg = v.vehicleRegistration.trim().toUpperCase().replace(/\s/g, "");
    if (reg.length < 2 || reg.length > 12) {
      return { ok: false, error: "Enter the vehicle registration" };
    }
    return { ok: true };
  }

  if (step === 2) {
    if (!v.incidentDate.trim()) {
      return { ok: false, error: "Select the incident date" };
    }
    if (v.faultStatus !== "non_fault" && v.faultStatus !== "fault" && v.faultStatus !== "unknown") {
      return { ok: false, error: "Select fault status" };
    }
    return { ok: true };
  }

  if (step === 3) {
    const message = v.message.trim();
    if (message.length < 10 || message.length > 4000) {
      return { ok: false, error: "Add a short description (at least 10 characters)" };
    }
    const urls = v.attachmentUrls ?? [];
    if (urls.length > 8) {
      return { ok: false, error: "Maximum 8 images" };
    }
    for (const u of urls) {
      if (typeof u !== "string" || !uploadPathOk(u)) {
        return { ok: false, error: "Invalid attachment path" };
      }
    }
    return { ok: true };
  }

  if (step === 4) {
    if (!v.consent) {
      return { ok: false, error: "Confirm you agree to be contacted" };
    }
    return { ok: true };
  }

  return { ok: false, error: "Invalid step" };
}

export function parseClaimIntake(
  body: unknown,
): { ok: true; data: ClaimIntakePayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }
  const o = body as Record<string, unknown>;

  const fullName = typeof o.fullName === "string" ? o.fullName.trim() : "";
  if (fullName.length < 2 || fullName.length > 120) {
    return { ok: false, error: "Enter your full name" };
  }

  const email = typeof o.email === "string" ? o.email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email" };
  }

  const phone = typeof o.phone === "string" ? o.phone.trim() : "";
  if (!phoneOk(phone)) {
    return { ok: false, error: "Enter a UK-style mobile or landline" };
  }

  const regRaw = typeof o.vehicleRegistration === "string" ? o.vehicleRegistration.trim() : "";
  const vehicleRegistration = regRaw.toUpperCase().replace(/\s/g, "");
  if (vehicleRegistration.length < 2 || vehicleRegistration.length > 12) {
    return { ok: false, error: "Enter the vehicle registration" };
  }

  const incidentDate = typeof o.incidentDate === "string" ? o.incidentDate.trim() : "";
  if (!incidentDate) {
    return { ok: false, error: "Select the incident date" };
  }

  const fault = o.faultStatus;
  if (fault !== "non_fault" && fault !== "fault" && fault !== "unknown") {
    return { ok: false, error: "Select fault status" };
  }

  const message = typeof o.message === "string" ? o.message.trim() : "";
  if (message.length < 10 || message.length > 4000) {
    return { ok: false, error: "Add a short description (at least 10 characters)" };
  }

  if (o.consent !== true) {
    return { ok: false, error: "Confirm you agree to be contacted" };
  }

  const cr = parseOptionalEnquiryClientReference(o.clientReference);
  if (!cr.ok) return { ok: false, error: cr.error };

  let attachmentUrls: string[] | undefined;
  if (Array.isArray(o.attachmentUrls)) {
    const urls = o.attachmentUrls.filter((x): x is string => typeof x === "string");
    if (urls.length > 8) {
      return { ok: false, error: "Maximum 8 images" };
    }
    for (const u of urls) {
      if (!uploadPathOk(u)) {
        return { ok: false, error: "Invalid attachment path" };
      }
    }
    attachmentUrls = urls.length ? urls : undefined;
  }

  return {
    ok: true,
    data: {
      fullName,
      email,
      phone,
      vehicleRegistration,
      incidentDate,
      faultStatus: fault,
      message,
      consent: true,
      attachmentUrls,
      clientReference: cr.clientReference,
    },
  };
}
