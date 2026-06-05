"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "bazoo_cookie_ack";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[9998] border-t border-[var(--color-surface)]/15 bg-[var(--color-page-elevated)]/98 px-4 py-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md sm:px-6"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p id="cookie-consent-title" className="text-sm font-semibold text-[var(--color-ink)]">
            Cookies on this site
          </p>
          <p id="cookie-consent-desc" className="mt-1 text-xs leading-relaxed text-[var(--color-ink-muted)] sm:text-sm">
            We use essential cookies and local storage so the site works. We do not use analytics
            cookies unless we update our policy and ask for consent.{" "}
            <Link href="/cookie-policy" className="font-medium text-[var(--color-surface)] underline">
              Cookie policy
            </Link>
            {" · "}
            <Link href="/privacy-policy" className="font-medium text-[var(--color-surface)] underline">
              Privacy policy
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-surface-2)] touch-manipulation"
        >
          Accept &amp; continue
        </button>
      </div>
    </div>
  );
}
