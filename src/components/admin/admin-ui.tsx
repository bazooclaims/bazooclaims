import type { ReactNode } from "react";
import Link from "next/link";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <div className="mt-2 max-w-2xl text-sm text-[var(--color-ink-muted)]">{description}</div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function AdminButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const cls =
    variant === "primary"
      ? "bg-[var(--color-surface)] text-white hover:bg-[var(--color-surface-2)]"
      : "border border-[var(--color-surface)]/15 bg-white text-[var(--color-ink)] hover:bg-[var(--color-band)]";
  return (
    <Link
      href={href}
      className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${cls}`}
    >
      {children}
    </Link>
  );
}

export const inputClass =
  "mt-1 w-full rounded-lg border border-[var(--color-surface)]/15 bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/25";

export const labelClass = "block text-xs font-medium text-[var(--color-ink-muted)]";
