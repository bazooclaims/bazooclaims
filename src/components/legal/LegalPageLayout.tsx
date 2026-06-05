import Link from "next/link";

type LegalPageLayoutProps = {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
};

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-ink-muted)]">
        <Link href="/" className="font-medium text-[var(--color-surface)] hover:underline">
          Home
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span>{title}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {title}
      </h1>
      {lastUpdated ? (
        <p className="mt-3 text-xs text-[var(--color-ink-muted)]">Last updated: {lastUpdated}</p>
      ) : null}
      <div className="legal-prose mt-8 space-y-6 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
        {children}
      </div>
    </div>
  );
}
