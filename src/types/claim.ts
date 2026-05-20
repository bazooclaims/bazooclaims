export type ClaimIntakePayload = {
  fullName: string;
  email: string;
  phone: string;
  vehicleRegistration: string;
  incidentDate: string;
  faultStatus: "non_fault" | "fault" | "unknown";
  message: string;
  consent: boolean;
  attachmentUrls?: string[];
  /** Optional own label (letters, numbers, spaces, . - / _); max 40 chars. Not the system enquiry number. */
  clientReference?: string;
};

export type ClaimIntakeResponse = {
  ok: boolean;
  /** Assigned system enquiry number (e.g. ENQ-00001). A formal claim file is not created until staff convert it. */
  reference?: string;
  /** Echo of the submitter’s optional reference, if provided. */
  clientReference?: string;
  error?: string;
  persistence?: "none" | "supabase";
};
