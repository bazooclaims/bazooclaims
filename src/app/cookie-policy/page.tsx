import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: `How ${siteConfig.name} uses cookies and similar technologies on this website.`,
};

const LAST_UPDATED = "20 May 2026";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie policy" lastUpdated={LAST_UPDATED}>
      <p>
        This cookie policy explains how <strong>{siteConfig.name}</strong> uses cookies and similar
        technologies when you visit our website. It should be read alongside our{" "}
        <Link href="/privacy-policy" className="font-medium text-[var(--color-surface)] underline">
          privacy policy
        </Link>
        .
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">1. What are cookies?</h2>
      <p>
        Cookies are small text files placed on your device when you visit a website. They help the
        site work, remember preferences, or (with your consent) support analytics and marketing.
        Similar technologies include local storage and session storage in your browser.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">2. How we use cookies</h2>
      <p>
        We aim to keep cookie use minimal. At present this website uses{" "}
        <strong>strictly necessary</strong> cookies and storage only — we do not use non-essential
        analytics or advertising cookies unless we update this policy and, where required, ask for
        your consent first.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">3. Cookies we use</h2>
      <div className="-mx-4 overflow-x-auto sm:mx-0">
        <table className="mt-2 w-full min-w-[20rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-surface)]/15">
              <th className="py-2 pr-4 font-semibold text-[var(--color-ink)]">Name / storage</th>
              <th className="py-2 pr-4 font-semibold text-[var(--color-ink)]">Purpose</th>
              <th className="py-2 font-semibold text-[var(--color-ink)]">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-surface)]/10">
            <tr>
              <td className="py-3 pr-4 font-mono text-xs">bazoo_cookie_ack</td>
              <td className="py-3 pr-4">
                Remembers that you dismissed the cookie notice (local storage, not sent to our
                servers).
              </td>
              <td className="py-3">Until cleared</td>
            </tr>
            <tr>
              <td className="py-3 pr-4 font-mono text-xs">bazoo_admin_session</td>
              <td className="py-3 pr-4">
                Authenticates staff in the admin CRM area only — not set for public visitors unless
                you log in to /admin.
              </td>
              <td className="py-3">Session / as configured</td>
            </tr>
            <tr>
              <td className="py-3 pr-4 font-mono text-xs">Next.js / hosting</td>
              <td className="py-3 pr-4">
                Essential technical cookies from our hosting platform for security and load
                balancing.
              </td>
              <td className="py-3">Varies</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">4. Third-party cookies</h2>
      <p>
        If you follow a link to WhatsApp (wa.me), Meta may set cookies under its own policies. We
        do not control third-party cookies. Review WhatsApp&apos;s and Meta&apos;s privacy notices
        before using those services.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">5. Managing cookies</h2>
      <p>
        You can block or delete cookies through your browser settings. Blocking strictly necessary
        cookies may prevent parts of the site (such as admin login) from working correctly.
      </p>
      <p>Popular browser help pages:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            className="font-medium text-[var(--color-surface)] underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
            className="font-medium text-[var(--color-surface)] underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
            className="font-medium text-[var(--color-surface)] underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Firefox
          </a>
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">6. Future analytics</h2>
      <p>
        If we add analytics (for example to understand how visitors use the enquiry form), we will
        update this page, implement a consent mechanism where required under PECR, and only enable
        non-essential cookies after you agree.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">7. Contact</h2>
      <p>
        Questions about cookies:{" "}
        <a
          href={`mailto:${siteConfig.supportEmail}`}
          className="font-medium text-[var(--color-surface)] underline"
        >
          {siteConfig.supportEmail}
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
