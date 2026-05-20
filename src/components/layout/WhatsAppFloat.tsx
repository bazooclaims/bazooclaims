"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

import { getWhatsAppUrl, siteConfig } from "@/config/site";

const fabPosition: CSSProperties = {
  right: "max(1rem, env(safe-area-inset-right, 0px))",
  bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
};

const fabBase =
  "whatsapp-float group fixed left-auto top-auto z-[9999] flex size-[3.75rem] cursor-pointer items-center justify-center rounded-full text-white ring-[3px] ring-white/95 transition will-change-transform hover:scale-[1.08] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-surface)] motion-reduce:transition-none motion-reduce:hover:scale-100 touch-manipulation sm:size-16 [@media(max-height:500px)]:bottom-3 [@media(max-height:500px)]:right-3";

/** Official-style WhatsApp mark (white on brand green). */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      />
    </svg>
  );
}

/**
 * Bottom-right FAB: WhatsApp (brand green + glyph) when configured, otherwise start claim.
 */
export function WhatsAppFloat() {
  const wa = getWhatsAppUrl(
    `Hi ${siteConfig.name}, I need help starting a motor claim.`,
  );

  if (wa) {
    return (
      <a
        href={wa}
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        aria-label="Open WhatsApp chat"
        className={`${fabBase} bg-[#25D366] shadow-[0_10px_34px_rgba(37,211,102,0.55),0_2px_14px_rgba(0,0,0,0.22)] hover:shadow-[0_14px_40px_rgba(37,211,102,0.65),0_4px_18px_rgba(0,0,0,0.28)] motion-reduce:hover:shadow-none`}
        style={fabPosition}
      >
        <WhatsAppGlyph className="pointer-events-none size-[1.85rem] shrink-0 text-white drop-shadow-sm sm:size-9" />
      </a>
    );
  }

  return (
    <Link
      href="/start-your-claim"
      title="Start an enquiry — add NEXT_PUBLIC_WHATSAPP_E164 to .env.local to open WhatsApp from here instead"
      aria-label="Start an enquiry"
      className={`${fabBase} bg-[var(--color-surface)] shadow-[0_10px_30px_rgba(0,59,73,0.35),0_2px_12px_rgba(0,0,0,0.18)] hover:shadow-[0_14px_36px_rgba(0,59,73,0.4),0_4px_16px_rgba(0,0,0,0.22)] motion-reduce:hover:shadow-none`}
      style={fabPosition}
    >
      <span className="pointer-events-none text-center text-[11px] font-bold leading-tight tracking-tight text-white sm:text-xs">
        Start
        <br />
        enquiry
      </span>
    </Link>
  );
}
