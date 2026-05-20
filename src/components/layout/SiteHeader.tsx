import Image from "next/image";
import Link from "next/link";

import { navLinks, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  variant?: "solid" | "transparent";
};

export function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[var(--color-surface)]/10 bg-[var(--color-page-elevated)]/95 shadow-sm backdrop-blur-md",
        variant === "transparent" && "bg-[var(--color-page-elevated)]/90",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-h-11 min-w-0 shrink-0 items-center touch-manipulation"
        >
          <span className="inline-flex overflow-hidden rounded-xl bg-[var(--color-surface)] shadow-[0_2px_12px_rgba(0,59,73,0.22)] ring-1 ring-[var(--color-surface)]/30">
            <Image
              src="/logo-bazoo.png"
              alt={`${siteConfig.name} — ${siteConfig.tagline}`}
              width={280}
              height={88}
              className="block h-9 w-auto max-w-[min(100%,11.5rem)] object-contain object-center sm:h-11 sm:max-w-[13.5rem]"
              priority
              sizes="(max-width: 640px) 11.5rem, 13.5rem"
            />
          </span>
        </Link>

        <nav
          className="hidden flex-1 justify-center px-2 md:flex"
          aria-label="Primary"
        >
          <div className="flex flex-wrap items-center justify-center gap-0.5">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-band)] hover:text-[var(--color-surface)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/start-your-claim"
            className="inline-flex min-h-11 max-w-[11rem] shrink-0 items-center justify-center truncate rounded-md border border-[var(--color-surface)]/15 bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-surface-2)] touch-manipulation sm:max-w-none"
          >
            Start claim
          </Link>
        </div>
      </div>

      <nav
        className="flex gap-2 overflow-x-auto overscroll-x-contain border-t border-[var(--color-surface)]/8 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
        aria-label="Primary mobile"
      >
        {navLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 touch-manipulation rounded-full border border-[var(--color-surface)]/10 bg-[var(--color-band)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] active:bg-[var(--color-accent)]/25"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
