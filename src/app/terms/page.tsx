import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: `Terms of use for ${siteConfig.name} website and accident management enquiry services.`,
};

const LAST_UPDATED = "20 May 2026";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms & conditions" lastUpdated={LAST_UPDATED}>
      <p>
        These terms govern your use of the website at {siteConfig.url.replace(/^https?:\/\//, "")}{" "}
        and your submission of enquiries to <strong>{siteConfig.name}</strong> ({siteConfig.tagline}
        ). By using the site or submitting an enquiry, you agree to these terms. If you do not agree,
        please do not use the site.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">1. About our service</h2>
      <p>
        {siteConfig.name} provides motor accident management and claims support services in the
        United Kingdom. This may include coordinating vehicle replacement, repairs, recovery, and
        communication with insurers, subject to eligibility, liability, and the terms of any
        separate agreement we enter with you.
      </p>
      <p>
        Information on this website is general in nature. It does not constitute legal, insurance,
        or financial advice. Outcomes depend on the facts of your incident, policy terms, and
        third-party liability.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">2. Enquiries vs claims</h2>
      <p>
        Submitting the online enquiry wizard creates an <strong>enquiry</strong> in our system (with
        a reference such as ENQ-00001). It does not automatically open a formal <strong>claim</strong>{" "}
        file. We review enquiries and will tell you if we can act for you. A separate claim
        reference (e.g. BZ-00001) is issued only if we proceed.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">3. Your responsibilities</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Provide accurate and complete information to the best of your knowledge.</li>
        <li>Notify us promptly if details change or if liability is disputed.</li>
        <li>Cooperate with reasonable requests for evidence (photos, police references, etc.).</li>
        <li>Not use the site for unlawful, fraudulent, or abusive purposes.</li>
      </ul>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">4. Fees and funding</h2>
      <p>
        For eligible non-fault matters, core managed services are typically funded through recovery
        from the at-fault party&apos;s insurer rather than upfront charges to you — see{" "}
        <Link href="/why-its-free" className="font-medium text-[var(--color-surface)] underline">
          Why it&apos;s free
        </Link>
        . Where fees, excesses, or disputed costs may apply, we will explain them before you
        commit to a service. Nothing on this website guarantees that any particular cost will be
        recoverable.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">5. WhatsApp and communications</h2>
      <p>
        After submitting an enquiry, you may send a prefilled summary to our WhatsApp business
        number. You must tap Send in WhatsApp for us to receive it. Standard messaging or data
        charges from your provider may apply. By contacting us you consent to us replying using the
        contact details you provide.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">6. Intellectual property</h2>
      <p>
        Content on this site (text, branding, layout, images) belongs to {siteConfig.name} or our
        licensors. You may view and print pages for personal use. You must not copy, scrape, or
        republish content for commercial purposes without written permission.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">7. Privacy</h2>
      <p>
        Our use of personal data is described in our{" "}
        <Link href="/privacy-policy" className="font-medium text-[var(--color-surface)] underline">
          privacy policy
        </Link>
        . Submitting an enquiry requires your consent to us contacting you about the incident.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">8. Availability</h2>
      <p>
        We aim to keep the website available but do not guarantee uninterrupted access. Maintenance,
        updates, or events outside our control may cause downtime. Enquiries submitted during
        outages may not be received until service resumes.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">9. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for indirect or consequential
        losses arising from use of this website. Nothing in these terms excludes or limits liability
        for death or personal injury caused by negligence, fraud, or any other liability that
        cannot be excluded under English law.
      </p>
      <p>
        If you rely on website content without a separate written agreement for case handling, our
        liability is limited to £100 except where law requires otherwise.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">10. Complaints</h2>
      <p>
        If you are unhappy with our service, email{" "}
        <a
          href={`mailto:${siteConfig.supportEmail}`}
          className="font-medium text-[var(--color-surface)] underline"
        >
          {siteConfig.supportEmail}
        </a>{" "}
        with your enquiry or claim reference. We will acknowledge complaints promptly and aim to
        resolve them within eight weeks. If you remain dissatisfied, you may refer the matter to
        an applicable ombudsman or regulator depending on the nature of the service — we will
        tell you the correct route when we respond.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">11. Governing law</h2>
      <p>
        These terms are governed by the laws of England and Wales. The courts of England and Wales
        have exclusive jurisdiction, without prejudice to mandatory consumer protections in Scotland
        or Northern Ireland where you live there as a consumer.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">12. Changes</h2>
      <p>
        We may update these terms. The &quot;Last updated&quot; date will change accordingly.
        Continued use of the site after changes constitutes acceptance of the revised terms.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">13. Contact</h2>
      <p>
        {siteConfig.name} — {siteConfig.supportEmail} — {siteConfig.phoneDisplay}
      </p>
    </LegalPageLayout>
  );
}
