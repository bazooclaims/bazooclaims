import Link from "next/link";

import { siteConfig } from "@/config/site";

export function HeroSection() {
  return (
    <section
      className="hero-motion relative overflow-hidden border-b border-white/10 bg-[var(--color-surface)] text-center text-white lg:text-left"
      aria-labelledby="hero-heading"
    >
      {/* Depth: vignette + cyan glow + subtle structure */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% -20%, rgba(0, 210, 255, 0.35), transparent 55%),
            radial-gradient(ellipse 70% 55% at 100% 60%, rgba(0, 210, 255, 0.12), transparent 50%),
            radial-gradient(ellipse 55% 45% at 0% 80%, rgba(255, 255, 255, 0.08), transparent 45%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 28%, rgba(0, 0, 0, 0.35) 100%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -18deg,
            transparent,
            transparent 48px,
            rgba(255, 255, 255, 0.03) 48px,
            rgba(255, 255, 255, 0.03) 49px
          )`,
        }}
      />

      <div className="hero-inner relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent-soft)] sm:text-xs">
          {siteConfig.name} · Motor claims · UK
        </p>

        <h1
          id="hero-heading"
          className="mx-auto mt-4 max-w-[22rem] text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.45)] sm:mt-5 sm:max-w-3xl sm:text-4xl sm:leading-[1.1] lg:mx-0 lg:text-5xl lg:leading-[1.08]"
        >
          Keep your insurance policy in perfect order after an accident
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg lg:mx-0">
          <span className="text-white/95">
            {siteConfig.tagline} — a structured, enterprise-grade accident management service:
          </span>{" "}
          replacement vehicles, approved repairs, recovery, and claims handling — with clear
          communication at every step.
        </p>

        <div className="mx-auto mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-12 sm:max-w-xl sm:flex-row sm:flex-wrap sm:justify-center lg:mx-0 lg:max-w-none lg:justify-start">
          <Link
            href="/start-your-claim"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-b from-[var(--color-accent)] to-[#00b8e6] px-8 py-3.5 text-base font-bold tracking-tight text-[#002a35] shadow-[0_12px_40px_-8px_rgba(0,210,255,0.55)] ring-1 ring-white/25 transition hover:brightness-110 hover:ring-white/40 active:scale-[0.99] touch-manipulation sm:w-auto sm:min-w-[12rem]"
          >
            Start an enquiry
          </Link>
          <Link
            href="/why-its-free"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl px-4 py-3 text-base font-semibold text-white underline decoration-white/40 decoration-2 underline-offset-[6px] transition hover:decoration-white hover:underline-offset-[8px] touch-manipulation sm:w-auto"
          >
            Why it’s free
          </Link>
        </div>

        <dl className="mx-auto mt-14 grid max-w-2xl gap-4 text-left sm:mt-16 sm:max-w-none sm:grid-cols-3 sm:gap-5 lg:mx-0">
          {[
            { k: "Replacement", v: "Like-for-like priority, typically within 24 hours." },
            { k: "No insurer games", v: "We represent you — clear advice, documented steps." },
            { k: "100% free (non-fault)", v: "Costs recovered from the at-fault insurer where applicable." },
          ].map((item) => (
            <div
              key={item.k}
              className="rounded-2xl border border-white/20 bg-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition hover:border-white/30 hover:bg-white/[0.11] sm:p-5"
            >
              <dt className="text-sm font-semibold tracking-wide text-white">{item.k}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-white/80">{item.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
