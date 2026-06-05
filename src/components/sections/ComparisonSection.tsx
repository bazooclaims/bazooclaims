import { siteConfig } from "@/config/site";

const rows = [
  "Calls answered quickly — minimal hold time.",
  "No-claims position protected where the route allows.",
  "Claim not recorded on your own policy where appropriate.",
  "Strong focus on correct vehicle valuation on total loss.",
] as const;

export function ComparisonSection() {
  return (
    <section className="bg-[var(--color-band)] py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="max-w-3xl text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl lg:text-4xl">
          {siteConfig.name} vs going direct to your insurer — the enterprise difference
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
          {siteConfig.name} is built for clarity, speed, and accountability — so you always know what
          happens next, who is acting for you, and how your no-claims position may be protected
          where the facts and law allow.
        </p>

        <div className="mt-8 -mx-4 flex justify-center px-4 sm:mx-0 sm:px-0 sm:mt-10">
          <div className="w-full max-w-4xl overflow-x-auto overscroll-x-contain rounded-2xl border border-[var(--color-surface)]/10 bg-[var(--color-page-elevated)] shadow-md [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[20rem] text-left text-sm sm:min-w-0">
              <thead className="border-b border-[var(--color-surface)]/10 bg-[var(--color-band)]">
                <tr>
                  <th className="px-3 py-3 text-xs font-semibold text-[var(--color-ink)] sm:px-4 sm:text-sm">
                    What clients care about
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-[var(--color-surface)] sm:px-4 sm:text-sm">
                    {siteConfig.name}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-[var(--color-ink-muted)] sm:px-4 sm:text-sm">
                    Typical direct insurer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface)]/8">
                {rows.map((label) => (
                  <tr key={label}>
                    <td className="max-w-[12rem] px-3 py-3.5 text-xs leading-snug text-[var(--color-ink)] sm:max-w-none sm:px-4 sm:py-4 sm:text-sm">
                      {label}
                    </td>
                    <td className="px-3 py-3.5 text-center text-base font-semibold text-emerald-600 sm:px-4 sm:py-4">
                      ✓
                    </td>
                    <td className="px-3 py-3.5 text-center text-xs text-[var(--color-ink-muted)] sm:px-4 sm:py-4 sm:text-sm">
                      Varies
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
