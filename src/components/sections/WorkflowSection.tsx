import { useId } from "react";

const phases = [
  {
    n: 1,
    title: "First contact",
    body: "Form, phone, or the site chat shortcut — we capture your details, the vehicle, and a short factual summary.",
  },
  {
    n: 2,
    title: "Triage & safety",
    body: "We confirm everyone is safe, whether the scene is cleared, and what photos or references (police, witnesses) to keep.",
  },
  {
    n: 3,
    title: "Eligibility & route",
    body: "We explain which services may apply (hire, repair, storage) and what depends on fault, policy, and insurer appetite.",
  },
  {
    n: 4,
    title: "Liability map",
    body: "Third parties, insurers, and evidence are logged so decisions are defensible if liability is disputed later.",
  },
  {
    n: 5,
    title: "Recovery & storage",
    body: "If the car is undriveable, we coordinate approved recovery and custody so charges stay controlled.",
  },
  {
    n: 6,
    title: "Inspection & repair plan",
    body: "Approved assessors scope repairs or total loss; you see a written plan before major costs are committed.",
  },
  {
    n: 7,
    title: "Mobility window",
    body: "Where eligible, we pursue like-for-like or closest practical replacement while repairs run — subject to hire terms.",
  },
  {
    n: 8,
    title: "Insurer correspondence",
    body: "Structured letters and calls to fault and own insurers, chasing decisions and protecting your NCB where the route allows.",
  },
  {
    n: 9,
    title: "Settlement & closure",
    body: "Repairs signed off or total loss agreed, hire stopped cleanly, file summarised. We stay available for follow-up questions.",
  },
] as const;

/** Serpentine offsets: subtle on mobile, wider swirl from md up */
const swirlClass = [
  "translate-x-0 rotate-0",
  "translate-x-2 rotate-[0.9deg] md:translate-x-14 md:rotate-[1.15deg]",
  "-translate-x-1.5 -rotate-[0.75deg] md:-translate-x-12 md:-rotate-[0.95deg]",
  "translate-x-3 rotate-[1deg] md:translate-x-[4.5rem] md:rotate-[1.25deg]",
  "-translate-x-2.5 -rotate-[0.85deg] md:-translate-x-[4rem] md:-rotate-[1.05deg]",
  "translate-x-3.5 rotate-[0.95deg] md:translate-x-[5.25rem] md:rotate-[1.1deg]",
  "-translate-x-2 -rotate-[0.9deg] md:-translate-x-[3.75rem] md:-rotate-[1deg]",
  "translate-x-2.5 rotate-[0.7deg] md:translate-x-10 md:rotate-[0.85deg]",
  "translate-x-0 rotate-0",
] as const;

export function WorkflowSection() {
  const swirlUid = useId().replace(/:/g, "");

  return (
    <section
      className="workflow-swirl relative overflow-x-hidden border-b border-[var(--color-surface)]/10 py-14 sm:py-20 lg:py-24"
      aria-labelledby="workflow-heading"
    >
      {/* Ambient swirl mesh */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.9]"
        style={{
          background: `
            radial-gradient(ellipse 85% 55% at 50% -10%, rgba(0, 210, 255, 0.22), transparent 52%),
            radial-gradient(ellipse 70% 45% at 100% 40%, rgba(0, 59, 73, 0.06), transparent 50%),
            radial-gradient(ellipse 65% 50% at 0% 70%, rgba(0, 210, 255, 0.1), transparent 48%),
            linear-gradient(180deg, var(--color-page-elevated) 0%, var(--color-band) 38%, #eef8fb 100%)
          `,
        }}
      />
      <div
        className="workflow-swirl-rotate pointer-events-none absolute -left-1/4 top-1/4 size-[min(140vw,52rem)] rounded-full opacity-[0.14] blur-3xl"
        style={{
          background: "conic-gradient(from 210deg, var(--color-accent), transparent 40%, var(--color-surface) 55%, transparent 75%)",
        }}
        aria-hidden
      />

      {/* Decorative ribbon path */}
      <svg
        className="pointer-events-none absolute left-1/2 top-32 -z-0 hidden h-[calc(100%-8rem)] w-24 -translate-x-1/2 md:block lg:w-32"
        viewBox="0 0 120 1600"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${swirlUid}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.55" />
            <stop offset="45%" stopColor="var(--color-surface)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          className="workflow-swirl-path"
          d="M60 0 C 118 120, 2 240, 60 360 C 118 480, 2 600, 60 720 C 118 840, 2 960, 60 1080 C 118 1200, 2 1320, 60 1440 C 90 1520, 30 1580, 60 1600"
          stroke={`url(#${swirlUid}-stroke)`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="10 14"
        />
      </svg>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-surface)]/70 sm:text-xs">
            Nine phases · one accountable team
          </p>
          <h2
            id="workflow-heading"
            className="mt-3 text-balance text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl lg:text-4xl"
          >
            How the BAZOOCLAIMS workflow runs
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
            One accountable UK team from first call to closure. Real cases can overlap steps; this
            is the sequence we aim to follow — shown here as a flowing path, not a rigid grid.
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl md:mt-16 lg:max-w-4xl">
          {/* Soft spine */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-[var(--color-accent)]/50 via-[var(--color-surface)]/15 to-[var(--color-accent)]/40 md:block md:h-full"
            aria-hidden
          />

          <ol className="relative flex list-none flex-col gap-7 p-0 sm:gap-8 md:gap-10">
            {phases.map((phase, i) => (
              <li
                key={phase.n}
                className={`workflow-swirl-card relative mx-auto w-full max-w-xl transition-shadow duration-300 ease-out md:max-w-lg md:hover:shadow-[0_22px_55px_-20px_rgba(0,59,73,0.38)] ${swirlClass[i]}`}
              >
                <div className="relative overflow-hidden rounded-3xl border border-[var(--color-surface)]/12 bg-[var(--color-page-elevated)]/95 p-5 shadow-[0_18px_50px_-24px_rgba(0,59,73,0.35)] ring-1 ring-[var(--color-accent)]/15 backdrop-blur-sm sm:p-6">
                  <div
                    className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full bg-[var(--color-accent)]/10 blur-2xl"
                    aria-hidden
                  />
                  <div className="relative flex gap-4 sm:gap-5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-surface)] to-[#002a35] text-sm font-bold text-white shadow-inner ring-1 ring-white/15 sm:size-12 sm:text-base">
                      {phase.n}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <h3 className="font-semibold tracking-tight text-[var(--color-surface)] sm:text-lg">
                        {phase.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-[0.9375rem]">
                        {phase.body}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
