const services = [
  {
    title: "Roadside recovery",
    body: "Secure recovery and storage arrangements with approved partners.",
  },
  {
    title: "Replacement vehicle",
    body: "Like-for-like or closest practical match, subject to eligibility and availability.",
  },
  {
    title: "Claim management",
    body: "End-to-end coordination: liability, repairs, total loss, and insurer correspondence.",
  },
  {
    title: "Accident repairs",
    body: "Insurance-approved repair networks and quality-checked completion standards.",
  },
  {
    title: "Injury introduction",
    body: "Where appropriate, introductions to regulated legal specialists in our network.",
  },
  {
    title: "Fault and non-fault",
    body: "We assess your position and explain realistic outcomes before you commit.",
  },
] as const;

export function ServicesSection() {
  return (
    <section className="border-b border-[var(--color-surface)]/10 bg-[var(--color-band)] py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl lg:text-4xl">
          Core services after a road traffic accident
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
          Everything is delivered through a single accountable team — similar in scope to how
          leading UK accident management providers structure their client journey.
        </p>
        <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {services.map((s) => (
            <li
              key={s.title}
              className="flex flex-col rounded-xl border border-[var(--color-surface)]/10 bg-[var(--color-page-elevated)] p-5 shadow-sm sm:p-6"
            >
              <h3 className="text-base font-semibold text-[var(--color-surface)]">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                {s.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
