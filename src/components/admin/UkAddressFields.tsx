import { inputClass, labelClass } from "@/components/admin/admin-ui";
import { formatUkAddressMultiline, parseUkAddressMultiline, type UkAddressLines } from "@/lib/admin/uk-address";

type Props = {
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  /** Grid column span for the whole block (Tailwind class). */
  gridClass?: string;
  /** Section title (default: client-facing wording). */
  heading?: string;
};

export function UkAddressFields({
  value,
  onChange,
  gridClass = "sm:col-span-2",
  heading = "Client address (UK)",
}: Props) {
  const p = parseUkAddressMultiline(value);

  function patch(part: keyof UkAddressLines, next: string) {
    const merged: UkAddressLines = { ...p, [part]: next };
    onChange(formatUkAddressMultiline(merged));
  }

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      <div>
        <p className="text-sm font-semibold text-[var(--color-ink)]">{heading}</p>
        <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
          Use Royal Mail style lines — postcode on its own line where possible.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={`${labelClass} sm:col-span-2`}>
          Address line 1
          <input
            className={inputClass}
            autoComplete="address-line1"
            placeholder="e.g. 12 High Street"
            value={p.line1}
            onChange={(e) => patch("line1", e.target.value)}
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Address line 2 <span className="font-normal text-[var(--color-ink-muted)]">(optional)</span>
          <input
            className={inputClass}
            autoComplete="address-line2"
            placeholder="Flat, building, district…"
            value={p.line2}
            onChange={(e) => patch("line2", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          Town / city
          <input
            className={inputClass}
            autoComplete="address-level2"
            placeholder="e.g. Manchester"
            value={p.town}
            onChange={(e) => patch("town", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          County <span className="font-normal text-[var(--color-ink-muted)]">(optional)</span>
          <input
            className={inputClass}
            autoComplete="address-level1"
            placeholder="e.g. Greater Manchester"
            value={p.county}
            onChange={(e) => patch("county", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          Postcode
          <input
            className={`${inputClass} uppercase tracking-wide`}
            autoComplete="postal-code"
            placeholder="e.g. M1 1AA"
            value={p.postcode}
            onChange={(e) => patch("postcode", e.target.value.toUpperCase())}
          />
        </label>
      </div>
    </div>
  );
}
