const items = [
  {
    title: "It’s completely free (non-fault)",
    body: "Where another party is liable, their insurer meets eligible costs — you are not asked to fund the core service.",
  },
  {
    title: "Save money and stress",
    body: "Structured processes reduce excess exposure and policy friction compared with going it alone.",
  },
  {
    title: "Fast turnaround",
    body: "We prioritise mobility: assessment, storage, repair coordination, and like-for-like replacement where appropriate.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section className="border-b border-[var(--color-surface)]/10 bg-[var(--color-page-elevated)] py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl lg:text-4xl">
          Following an accident, many drivers contact their insurer first. We help you take a
          clearer, calmer path.
        </h2>
        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[var(--color-surface)]/10 bg-gradient-to-b from-[var(--color-band)]/80 to-[var(--color-page-elevated)] p-5 shadow-sm sm:p-6"
            >
              <h3 className="text-lg font-semibold text-[var(--color-surface)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-[0.9375rem]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
