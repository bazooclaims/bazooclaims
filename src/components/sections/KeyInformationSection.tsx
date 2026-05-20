/** Fifteen practical UK motor-claim facts — informational, not legal advice. */
const facts = [
  {
    title: "Fault vs non-fault",
    body: "Non-fault usually means another party’s insurer meets eligible costs; fault or split-fault routes differ and we explain yours before you commit.",
  },
  {
    title: "No-claims bonus (NCB)",
    body: "Many non-fault credit-hire routes aim to keep the claim off your own policy, but every case differs — we review your position early.",
  },
  {
    title: "Police reference",
    body: "If police attended, the reference number and officer details help insurers and engineers align facts quickly.",
  },
  {
    title: "Dashcam & CCTV",
    body: "Preserve original files with timestamps. We tell you what to upload securely and what not to delete.",
  },
  {
    title: "Third-party details",
    body: "Name, insurer, policy where known, registration, and contact numbers reduce delays when opening the third-party leg.",
  },
  {
    title: "Witnesses",
    body: "Independent witnesses strengthen disputed liability. We template short statements so they stay factual.",
  },
  {
    title: "Hire duration",
    body: "Replacement periods should track repair timelines. We monitor slippage so hire does not run open-ended without cause.",
  },
  {
    title: "Storage charges",
    body: "Custody and daily storage should be agreed in writing where possible. We challenge unreasonable warehousing early.",
  },
  {
    title: "Engineer reports",
    body: "Structural or hidden damage often needs a second look. We coordinate insurer-approved engineers.",
  },
  {
    title: "Total loss",
    body: "Market valuations and category decisions affect settlement speed. We push for transparent methodology.",
  },
  {
    title: "Excess & policy",
    body: "Your own excess may still matter on some routes. We spell out when you might be asked to fund and when you should not.",
  },
  {
    title: "Medical & PI",
    body: "Where injuries exist, we can introduce regulated firms. You stay in control of whether to instruct solicitors.",
  },
  {
    title: "MIB & uninsured",
    body: "If the at-fault driver is uninsured or untraced, MIB routes have strict time limits — we flag deadlines immediately.",
  },
  {
    title: "Data protection",
    body: "We process personal data under UK GDPR for claim handling. You can ask for access, correction, or erasure subject to legal retention needs.",
  },
  {
    title: "Complaints",
    body: "If service falls short, we follow an internal escalation path first, then any applicable ombudsman or regulator route we publish in your client pack.",
  },
] as const;

export function KeyInformationSection() {
  return (
    <section className="border-b border-[var(--color-surface)]/10 bg-[var(--color-band)] py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl lg:text-4xl">
          15 things worth knowing
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
          Plain-language pointers for UK drivers. They are not a substitute for regulated advice on
          your specific facts.
        </p>
        <ul className="mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {facts.map((item, i) => (
            <li
              key={item.title}
              className="rounded-2xl border border-[var(--color-surface)]/10 bg-[var(--color-page-elevated)] p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-semibold text-[var(--color-surface)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
