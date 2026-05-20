import Link from "next/link";

import { navLinks, siteConfig } from "@/config/site";

const legal = [
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/cookie-policy", label: "Cookie policy" },
  { href: "/terms", label: "Terms & conditions" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[var(--color-surface)] text-[var(--color-foreground)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-semibold text-white">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/75">
            {siteConfig.description}
          </p>
          <Link
            href="/start-your-claim"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-accent-soft)] underline-offset-2 hover:underline touch-manipulation"
          >
            Start your claim
          </Link>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
            Useful links
          </p>
          <ul className="mt-4 space-y-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-10 items-center text-sm text-white/80 hover:text-white touch-manipulation"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/55">Legal</p>
          <ul className="mt-4 space-y-2">
            {legal.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-10 items-center text-sm text-white/80 hover:text-white touch-manipulation"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs leading-relaxed text-white/50 sm:px-6">
        © {year} {siteConfig.name}. {siteConfig.tagline}. All rights reserved.
      </div>
    </footer>
  );
}
