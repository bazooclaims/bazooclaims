const faqs = [
  {
    q: "How do I file a claim?",
    a: "Use the secure claim form, or the chat shortcut in the bottom-right corner when enabled. A UK-based handler will collect the facts, explain eligibility, and outline the next steps — including what we need from you and any third parties.",
  },
  {
    q: "How quickly can I get a replacement vehicle?",
    a: "We target like-for-like or the closest practical match as soon as liability and cover position allow — often within 24 hours for eligible non-fault cases.",
  },
  {
    q: "Are there any upfront costs?",
    a: "For eligible non-fault claims, core service costs are recovered from the at-fault insurer. We explain any exceptions before you proceed.",
  },
  {
    q: "Will this affect my no-claims bonus?",
    a: "In many non-fault scenarios, the claim is pursued against the third party rather than your own policy — but every case differs. We review your position before you commit.",
  },
  {
    q: "Should I contact my own insurer first?",
    a: "Speak to us first where possible. Early insurer notification can sometimes complicate credit hire or repair routing — we will advise based on your facts.",
  },
  {
    q: "What if the at-fault driver is uninsured?",
    a: "We can guide you through MIB routes and evidence requirements where applicable.",
  },
] as const;

export function FaqSection() {
  return (
    <section className="border-b border-[var(--color-surface)]/10 bg-[var(--color-page-elevated)] py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl lg:text-4xl">
          Questions we answer every day
        </h2>
        <div className="mt-8 divide-y divide-[var(--color-surface)]/10 rounded-2xl border border-[var(--color-surface)]/10 bg-[var(--color-page)] shadow-sm sm:mt-10">
          {faqs.map((item) => (
            <details key={item.q} className="group px-4 py-3 sm:px-6 sm:py-4">
              <summary className="flex min-h-12 cursor-pointer list-none items-center text-left text-sm font-semibold text-[var(--color-ink)] marker:content-none [&::-webkit-details-marker]:hidden touch-manipulation">
                <span className="flex flex-1 items-start justify-between gap-3 pr-1">
                  <span className="pt-0.5">{item.q}</span>
                  <span className="shrink-0 text-lg leading-none text-[var(--color-accent)] transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 pb-1 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-[0.9375rem]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
