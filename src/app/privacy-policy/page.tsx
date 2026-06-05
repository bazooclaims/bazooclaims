import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${siteConfig.name} collects, uses, and protects your personal data under UK GDPR.`,
};

const LAST_UPDATED = "20 May 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy policy" lastUpdated={LAST_UPDATED}>
      <p>
        This privacy policy explains how <strong>{siteConfig.tagline}</strong> trading as{" "}
        <strong>{siteConfig.name}</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) uses
        personal data when you visit {siteConfig.url.replace(/^https?:\/\//, "")}, submit an
        enquiry, or communicate with us about a motor incident.
      </p>
      <p>
        We process personal data in accordance with the UK General Data Protection Regulation (UK
        GDPR), the Data Protection Act 2018, and the Privacy and Electronic Communications
        Regulations (PECR) where applicable.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">1. Who we are</h2>
      <p>
        <strong>Data controller:</strong> {siteConfig.tagline} ({siteConfig.name})
        <br />
        <strong>Contact:</strong>{" "}
        <a
          href={`mailto:${siteConfig.supportEmail}`}
          className="font-medium text-[var(--color-surface)] underline"
        >
          {siteConfig.supportEmail}
        </a>
        <br />
        <strong>Phone:</strong> {siteConfig.phoneDisplay}
      </p>
      <p>
        Registered office and company registration details are published in our admin settings and
        on correspondence we send you. If you need our full postal address, email us and we will
        provide it promptly.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">2. What data we collect</h2>
      <p>Depending on how you interact with us, we may collect:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Identity and contact data</strong> — name, email address, telephone number.
        </li>
        <li>
          <strong>Incident and vehicle data</strong> — vehicle registration, incident date, fault
          status, description of what happened, optional photos, and any reference you choose to
          provide.
        </li>
        <li>
          <strong>Claim and case data</strong> — if we progress your matter, notes, insurer
          references, repair or hire details, and documents you supply.
        </li>
        <li>
          <strong>Technical data</strong> — IP address, browser type, device information, and
          essential cookies (see our{" "}
          <Link href="/cookie-policy" className="font-medium text-[var(--color-surface)] underline">
            cookie policy
          </Link>
          ).
        </li>
        <li>
          <strong>Communications</strong> — emails, WhatsApp messages, and call notes where you
          contact us.
        </li>
      </ul>
      <p>
        We do not intentionally collect special category data (such as health information) through
        the website enquiry form. If you include health-related details in free text, we will
        treat them carefully and only use them where necessary for your case.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">3. How we collect data</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Directly from you — enquiry wizard, email, phone, or WhatsApp.</li>
        <li>From third parties — insurers, repairers, credit-hire partners, or brokers where relevant to your case.</li>
        <li>Automatically — limited technical logs from our hosting provider.</li>
      </ul>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">4. Lawful bases for processing</h2>
      <p>We rely on the following lawful bases under UK GDPR:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Consent</strong> — when you tick the consent box on the enquiry form and agree we
          may contact you about your incident.
        </li>
        <li>
          <strong>Contract / steps prior to contract</strong> — to assess and, if appropriate,
          provide accident management services you request.
        </li>
        <li>
          <strong>Legitimate interests</strong> — to operate our business, prevent fraud, improve
          our service, and follow up on enquiries, balanced against your rights.
        </li>
        <li>
          <strong>Legal obligation</strong> — where we must retain records for regulatory, tax, or
          court purposes.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">5. How we use your data</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Review and respond to enquiries submitted via the website.</li>
        <li>Manage claims, repairs, vehicle replacement, recovery, and related services.</li>
        <li>Communicate with you, insurers, and approved suppliers about your case.</li>
        <li>Maintain internal records in our CRM (customer relationship management) system.</li>
        <li>Send your enquiry summary via WhatsApp when you choose to use that channel after submitting the form.</li>
        <li>Meet legal, regulatory, and accounting requirements.</li>
      </ul>
      <p>We do not sell your personal data.</p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">6. WhatsApp</h2>
      <p>
        If you use WhatsApp to contact us or send a copy of your enquiry after submitting the form,
        your message is processed by Meta Platforms Ireland Ltd under WhatsApp&apos;s own privacy
        policy. We receive the content you send to our business number and store it with your
        enquiry or claim file where relevant.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">7. Sharing your data</h2>
      <p>We may share personal data with:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Insurers and their representatives involved in your claim.</li>
        <li>Approved repairers, vehicle hire providers, recovery agents, and legal advisers.</li>
        <li>
          Service providers who host our website and CRM (for example cloud database and hosting
          providers), under appropriate contracts.
        </li>
        <li>Regulators, courts, or law enforcement when required by law.</li>
      </ul>
      <p>We require processors to protect data and only use it as we instruct.</p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">8. International transfers</h2>
      <p>
        Some service providers may store or process data outside the UK. Where this occurs, we
        ensure appropriate safeguards are in place (such as UK adequacy regulations or standard
        contractual clauses approved for UK GDPR).
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">9. Retention</h2>
      <p>
        We keep personal data only as long as needed for the purposes above, including while a
        claim or enquiry is active and for a reasonable period afterwards to meet legal and
        insurance requirements (typically up to six years for contract-related records, or longer
        where law requires). Enquiries we do not take forward are usually deleted or anonymised
        within twelve months unless you ask us to retain them.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">10. Your rights</h2>
      <p>Under UK GDPR you have the right to:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Request erasure in certain circumstances.</li>
        <li>Restrict or object to processing in certain circumstances.</li>
        <li>Data portability where processing is based on consent or contract and automated.</li>
        <li>Withdraw consent at any time (without affecting prior lawful processing).</li>
      </ul>
      <p>
        To exercise these rights, email{" "}
        <a
          href={`mailto:${siteConfig.supportEmail}`}
          className="font-medium text-[var(--color-surface)] underline"
        >
          {siteConfig.supportEmail}
        </a>
        . We may need to verify your identity before responding.
      </p>
      <p>
        You may also complain to the Information Commissioner&apos;s Office (ICO):{" "}
        <a
          href="https://ico.org.uk/make-a-complaint/"
          className="font-medium text-[var(--color-surface)] underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          ico.org.uk/make-a-complaint
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">11. Security</h2>
      <p>
        We use appropriate technical and organisational measures to protect personal data,
        including encrypted connections (HTTPS), access controls on our admin systems, and secure
        hosting. No method of transmission over the internet is completely secure; please avoid
        sending highly sensitive documents unless we provide a secure channel.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">12. Children</h2>
      <p>
        Our services are not directed at children under 18. If you believe a child has submitted
        personal data to us, contact us and we will delete it where appropriate.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-ink)]">13. Changes</h2>
      <p>
        We may update this policy from time to time. The &quot;Last updated&quot; date at the top
        will change when we do. Material changes will be highlighted on this page.
      </p>
    </LegalPageLayout>
  );
}
