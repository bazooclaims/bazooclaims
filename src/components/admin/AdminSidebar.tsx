"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  Icon: () => ReactElement;
};

function IconDash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className="size-5">
      <path d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z" strokeLinejoin="round" />
    </svg>
  );
}
function IconInbox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className="size-5">
      <path d="M4 6h16v10H4V6z" strokeLinejoin="round" />
      <path d="M4 10l3 3h10l3-3" strokeLinejoin="round" />
    </svg>
  );
}
function IconClaim() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className="size-5">
      <path d="M8 4h12v16H8V4z" strokeLinejoin="round" />
      <path d="M4 8h4v12H4V8z" strokeLinejoin="round" />
    </svg>
  );
}
function IconInvoice() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className="size-5">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className="size-5">
      <path d="M12 3l9 5-9 5-9-5 9-5z" strokeLinejoin="round" />
      <path d="M3 12l9 5 9-5M3 17l9 5 9-5" strokeLinejoin="round" />
    </svg>
  );
}
function IconHandshake() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className="size-5">
      <path d="M8 11V8a2 2 0 012-2h1l4 4v3" strokeLinejoin="round" />
      <path d="M10 18l-2-2 3-3 2 2" strokeLinejoin="round" />
      <path d="M14 8l4 4v5a2 2 0 01-2 2h-1" strokeLinejoin="round" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className="size-5">
      <path d="M4 21h16M6 21V8l6-4 6 4v13M9 21v-4h2v4M13 21v-4h2v4" strokeLinejoin="round" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className="size-5">
      <path d="M12 12a3 3 0 100-6 3 3 0 000 6zM4 21v-1a4 4 0 014-4h8a4 4 0 014 4v1" strokeLinejoin="round" />
    </svg>
  );
}
function IconHomePub() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className="size-5">
      <path d="M4 10l8-6 8 6v10a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1V10z" strokeLinejoin="round" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className="size-5">
      <path d="M10 17l-1-1 3-3-3-3 1-1M14 8h5v8h-5M4 12h11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const nav: { section: string; items: NavItem[] }[] = [
  {
    section: "Operations",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", Icon: IconDash },
      { href: "/admin/enquiries", label: "Enquiries", Icon: IconInbox },
      { href: "/admin/claims", label: "Claims", Icon: IconClaim },
    ],
  },
  {
    section: "Finance",
    items: [
      { href: "/admin/invoices", label: "Invoices", Icon: IconInvoice },
      { href: "/admin/invoices/templates", label: "Templates", Icon: IconLayers },
    ],
  },
  {
    section: "Network",
    items: [{ href: "/admin/vendors", label: "Partners & vendors", Icon: IconHandshake }],
  },
  {
    section: "Organisation",
    items: [
      { href: "/admin/settings", label: "Company & VAT", Icon: IconBuilding },
      { href: "/admin/staff", label: "Staff", Icon: IconUsers },
    ],
  },
];

export function AdminSidebar({
  staffName,
  role,
  collapsed,
  onToggleCollapse,
}: {
  staffName: string;
  role: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/auth/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      aria-label="Admin navigation"
      className={`flex w-full min-w-0 shrink-0 flex-col overflow-x-hidden border-b border-white/10 bg-gradient-to-b from-[#00151c] via-[#002f3b] to-[#0a3d4a] text-white shadow-xl md:h-full md:min-h-0 md:max-h-full md:border-b-0 md:border-r ${
        collapsed ? "md:items-stretch" : ""
      }`}
    >
      <div
        className={`relative border-b border-white/10 ${collapsed ? "px-2 py-4 md:px-2 md:pb-3 md:pt-10" : "px-4 py-5"}`}
      >
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div
            className={`min-w-0 overflow-hidden ${collapsed ? "w-full md:px-0.5 md:text-center" : "flex-1 pr-1"}`}
          >
            <p
              className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-soft)] ${
                collapsed ? "truncate md:hidden" : "truncate"
              }`}
            >
              BAZOOCLAIMS
            </p>
            {collapsed ? (
              <p
                className="mt-1 hidden text-[11px] font-bold uppercase tracking-[0.18em] text-teal-100/95 md:block"
                aria-hidden
              >
                BZ
              </p>
            ) : null}
            {!collapsed ? (
              <>
                <p className="mt-2 truncate text-sm font-semibold leading-tight">{staffName}</p>
                <p className="mt-0.5 text-xs capitalize text-white/55">{role}</p>
              </>
            ) : (
              <p
                className="mt-2 truncate text-center text-[11px] font-bold text-white/90 md:mt-1.5"
                title={staffName}
              >
                {staffName
                  .split(/\s+/)
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`shrink-0 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/15 md:z-20 ${
              collapsed ? "md:absolute md:right-1.5 md:top-2" : ""
            } hidden md:block`}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>
      </div>
      <nav
        className={`flex max-h-[50vh] min-h-0 flex-1 flex-row gap-1 overflow-y-auto overflow-x-auto p-2 md:min-h-0 md:max-h-none md:flex-col ${
          collapsed ? "md:px-1.5 md:py-3" : "md:px-3 md:py-4"
        }`}
      >
        {nav.map(({ section, items }) => (
          <div key={section} className="min-w-[10rem] md:min-w-0 md:mb-3">
            <p
              className={`hidden pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 md:block ${
                collapsed ? "sr-only" : "px-2"
              }`}
            >
              {section}
            </p>
            <ul className="flex list-none flex-col gap-0.5 p-0">
              {items.map((l) => {
                const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
                const Icon = l.Icon;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      title={l.label}
                      className={`flex items-center gap-2.5 rounded-lg font-medium transition md:gap-3 md:py-2 ${
                        collapsed ? "px-2 py-2.5 md:justify-center md:px-2" : "px-3 py-2.5 text-sm"
                      } ${
                        active
                          ? "bg-[var(--color-accent)]/30 text-white shadow-inner ring-1 ring-[var(--color-accent)]/45"
                          : "text-white/88 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="shrink-0 text-teal-100/95 [&_svg]:drop-shadow-sm">
                        <Icon />
                      </span>
                      <span className={`min-w-0 truncate ${collapsed ? "md:sr-only" : ""}`}>{l.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className={`mt-auto hidden border-t border-white/10 md:block ${collapsed ? "p-2" : "p-3"}`}>
        <Link
          href="/"
          title="Public website"
          className={`mb-2 flex items-center gap-2 rounded-lg text-xs text-white/60 transition hover:bg-white/10 hover:text-white ${
            collapsed ? "justify-center px-2 py-2" : "px-2 py-2"
          }`}
        >
          <IconHomePub />
          <span className={collapsed ? "md:sr-only" : ""}>Public website</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          title="Sign out"
          className={`flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 font-medium text-white/95 transition hover:bg-white/10 ${
            collapsed ? "py-2 text-xs" : "py-2.5 text-sm"
          }`}
        >
          <IconLogout />
          <span className={collapsed ? "md:sr-only" : ""}>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
