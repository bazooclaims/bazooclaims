/** UK-style address stored as newline-separated lines (max 5) for PDFs and legacy data. */

export type UkAddressLines = {
  line1: string;
  line2: string;
  town: string;
  county: string;
  postcode: string;
};

const KEYS: (keyof UkAddressLines)[] = ["line1", "line2", "town", "county", "postcode"];

export function parseUkAddressMultiline(raw?: string): UkAddressLines {
  const lines = (raw ?? "").replace(/\r\n/g, "\n").split("\n");
  const next: UkAddressLines = {
    line1: "",
    line2: "",
    town: "",
    county: "",
    postcode: "",
  };
  for (let i = 0; i < KEYS.length; i++) {
    const k = KEYS[i]!;
    next[k] = (lines[i] ?? "").trim();
  }
  return next;
}

/** Serialises UK parts; trims leading/trailing empty lines; keeps intentional gaps in the middle. */
export function formatUkAddressMultiline(p: UkAddressLines): string | undefined {
  const parts = KEYS.map((k) => p[k].trim());
  let start = 0;
  while (start < parts.length && parts[start] === "") start++;
  const rest = parts.slice(start);
  while (rest.length > 0 && rest[rest.length - 1] === "") rest.pop();
  if (rest.length === 0) return undefined;
  return rest.join("\n");
}
