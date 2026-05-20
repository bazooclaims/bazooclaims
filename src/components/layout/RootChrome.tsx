"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { getWhatsAppE164 } from "@/config/site";

function showWhatsAppSetupHint() {
  return process.env.NODE_ENV === "development" && getWhatsAppE164() === null;
}

function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const path = pathname.split("?")[0] ?? pathname;
  return path === "/admin" || path.startsWith("/admin/");
}

/** Public marketing chrome only — admin routes stay clean (no main nav / footer / FAB). */
export function RootChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = isAdminPath(pathname);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {showWhatsAppSetupHint() ? (
        <div
          role="status"
          className="border-b border-amber-200/80 bg-amber-50 px-4 py-2.5 text-center text-xs leading-snug text-amber-950 sm:text-sm"
        >
          Bottom-right FAB opens <strong>Start an enquiry</strong> until you set{" "}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] sm:text-xs">
            NEXT_PUBLIC_WHATSAPP_E164
          </code>{" "}
          (or <code className="font-mono text-[11px] sm:text-xs">NUMBER</code> /{" "}
          <code className="font-mono text-[11px] sm:text-xs">WHATSAPP</code>) in{" "}
          <code className="font-mono text-[11px] sm:text-xs">.env.local</code> — then it opens
          WhatsApp. See <code className="font-mono text-[11px] sm:text-xs">.env.example</code>.
        </div>
      ) : null}
      <main className="min-w-0 flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
