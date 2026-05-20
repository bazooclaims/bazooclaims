import type { ChecklistItem } from "@/types/admin";

export const DEFAULT_CHECKLIST_LABELS = [
  "First contact logged",
  "Safety & scene confirmed",
  "Photos / damage documented",
  "Police reference obtained (if applicable)",
  "Third-party details captured",
  "Witness details captured",
  "Insurance notified (position agreed)",
  "Liability position recorded",
  "Recovery arranged (if needed)",
  "Vehicle inspection booked",
  "Repair plan authorised",
  "Courtesy / hire vehicle supplied",
  "Hire agreement & T&Cs signed",
  "Insurer correspondence chased",
  "Case ready for settlement / closure",
] as const;

export function createDefaultChecklist(): ChecklistItem[] {
  return DEFAULT_CHECKLIST_LABELS.map((label, i) => ({
    id: `chk-${i + 1}`,
    label,
    done: false,
    skipped: false,
  }));
}
