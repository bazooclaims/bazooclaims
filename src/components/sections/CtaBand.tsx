import Link from "next/link";

export function CtaBand() {
  return (
    <section className="border-y border-[var(--color-surface)]/10 bg-gradient-to-br from-[var(--color-page-elevated)] via-[var(--color-band)] to-[var(--color-accent)]/15 py-12 sm:py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-stretch justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            Start your claim today
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
            Tell us what happened. We respond quickly with a structured plan through our secure
            claim form.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          <Link
            href="/start-your-claim"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-surface-2)] touch-manipulation sm:w-auto"
          >
            Open claim form
          </Link>
        </div>
      </div>
    </section>
  );
}
