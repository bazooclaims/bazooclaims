"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { enquiryWhatsAppUrl, type EnquiryWhatsAppInput } from "@/lib/enquiry-whatsapp";
import { parseClaimIntake, validateClaimWizardStep } from "@/lib/validators/claim-intake";
import type { ClaimIntakePayload } from "@/types/claim";
import { cn } from "@/lib/utils";

const empty: ClaimIntakePayload = {
  fullName: "",
  email: "",
  phone: "",
  vehicleRegistration: "",
  incidentDate: "",
  faultStatus: "unknown",
  message: "",
  consent: false,
  attachmentUrls: [],
  clientReference: undefined,
};

const fieldClass =
  "mt-1 w-full min-h-11 rounded-md border border-[var(--color-surface)]/15 bg-[var(--color-page-elevated)] px-3 py-2.5 text-base text-[var(--color-ink)] outline-none ring-[var(--color-accent)]/30 placeholder:text-[var(--color-ink-muted)]/60 focus:border-[var(--color-accent)] focus:ring-2 sm:text-sm";

const STEPS_META = [
  { title: "Your details", subtitle: "How we can contact you about this enquiry." },
  { title: "Your vehicle", subtitle: "The registration of the vehicle involved." },
  { title: "The incident", subtitle: "When it happened and how fault sits today." },
  { title: "What happened", subtitle: "Describe the incident and optionally attach scene / damage photos." },
  { title: "Agreements", subtitle: "Confirm we may contact you under UK privacy expectations." },
  { title: "Review & submit", subtitle: "Check everything, then send your enquiry to our team." },
] as const;

const faultLabels: Record<ClaimIntakePayload["faultStatus"], string> = {
  non_fault: "Non-fault",
  fault: "My fault / split",
  unknown: "Not sure yet",
};

export function StartClaimForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ClaimIntakePayload>(empty);
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [yourReference, setYourReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [whatsappEnquiry, setWhatsappEnquiry] = useState<EnquiryWhatsAppInput | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const skipInitialScrollRef = useRef(true);

  useEffect(() => {
    if (skipInitialScrollRef.current) {
      skipInitialScrollRef.current = false;
      return;
    }
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [step]);

  function set<K extends keyof ClaimIntakePayload>(key: K, v: ClaimIntakePayload[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setClientError(null);
  }

  function goBack() {
    setClientError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function goNext() {
    const check = validateClaimWizardStep(step, values);
    if (!check.ok) {
      setClientError(check.error);
      return;
    }
    setClientError(null);
    setStep((s) => Math.min(STEPS_META.length - 1, s + 1));
  }

  function goToStep(i: number) {
    if (i < 0 || i > step || i === step) return;
    setClientError(null);
    setStep(i);
  }

  async function submitClaim() {
    const parsed = parseClaimIntake({
      ...values,
      attachmentUrls: values.attachmentUrls?.length ? values.attachmentUrls : undefined,
    });
    if (!parsed.ok) {
      setClientError(parsed.error);
      return;
    }

    setSubmitting(true);
    setServerMessage(null);
    setReference(null);
    setYourReference(null);
    setWhatsappEnquiry(null);
    try {
      let attachmentUrls = [...(parsed.data.attachmentUrls ?? [])];
      if (pendingFiles.length > 0) {
        const fd = new FormData();
        for (const f of pendingFiles) {
          fd.append("files", f);
        }
        const up = await fetch("/api/public/upload", { method: "POST", body: fd });
        const upData = (await up.json()) as { ok?: boolean; urls?: string[]; error?: string };
        if (!up.ok || !upData.ok || !upData.urls) {
          setServerMessage(upData.error ?? "Image upload failed. Try smaller files or fewer images.");
          return;
        }
        attachmentUrls = [...attachmentUrls, ...upData.urls];
      }

      const res = await fetch("/api/claim-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          attachmentUrls: attachmentUrls.length ? attachmentUrls : undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        reference?: string;
        clientReference?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setServerMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setReference(data.reference ?? null);
      setYourReference(data.clientReference?.trim() || null);
      const enquiryRef = data.reference ?? "";
      setWhatsappEnquiry({
        ...parsed.data,
        reference: enquiryRef,
        attachmentUrls: attachmentUrls.length ? attachmentUrls : undefined,
      });
      setServerMessage(
        "Thank you — we have saved your enquiry in our system. " +
          "Please tap the green WhatsApp button below and press Send so our team receives your details straight away. " +
          "No formal claim file is opened yet; if we progress your case you will get a separate claim reference (e.g. BZ-00001). " +
          "Your enquiry number is " +
          enquiryRef +
          ".",
      );
      setValues(empty);
      setPendingFiles([]);
      setStep(0);
    } finally {
      setSubmitting(false);
    }
  }

  function onFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step === STEPS_META.length - 1) {
      void submitClaim();
    } else {
      goNext();
    }
  }

  const meta = STEPS_META[step];
  const whatsappUrl = whatsappEnquiry ? enquiryWhatsAppUrl(whatsappEnquiry) : null;

  return (
    <form
      onSubmit={onFormSubmit}
      className="mx-auto max-w-2xl rounded-2xl border border-[var(--color-surface)]/10 bg-[var(--color-page-elevated)] shadow-lg"
      noValidate
      aria-label="Motor enquiry — 6 steps"
    >
      <div className="border-b border-[var(--color-surface)]/10 px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
            Enquiry wizard
          </p>
          <p className="text-sm font-medium text-[var(--color-surface)]" aria-live="polite">
            Step {step + 1} of {STEPS_META.length}
          </p>
        </div>
        <ol className="mt-4 flex list-none gap-2 p-0" aria-label="Progress">
          {STEPS_META.map((s, i) => (
            <li key={s.title} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={i > step}
                onClick={() => goToStep(i)}
                className={cn(
                  "group flex w-full touch-manipulation flex-col gap-1.5 rounded-md py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:pointer-events-none sm:py-1.5",
                  i > step && "opacity-55",
                )}
                aria-current={i === step ? "step" : undefined}
              >
                <span
                  className={cn(
                    "h-2.5 w-full rounded-full sm:h-2",
                    i < step && "bg-[var(--color-surface)]/45 group-hover:bg-[var(--color-surface)]/60",
                    i === step && "bg-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/35",
                    i > step && "bg-[var(--color-surface)]/15",
                  )}
                  aria-hidden
                />
                <span className="sr-only">
                  Step {i + 1}: {s.title}
                  {i < step ? " — completed, tap to go back" : i === step ? " — current" : " — not yet available"}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-2xl">
          {meta.title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">{meta.subtitle}</p>
      </div>

      <div ref={panelRef} className="px-5 py-6 sm:px-8 sm:py-8">
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-[var(--color-ink)]">
                Full name
              </label>
              <input
                id="fullName"
                autoComplete="name"
                className={fieldClass}
                placeholder="As shown on your driving licence"
                value={values.fullName}
                onChange={(e) => set("fullName", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-ink)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={fieldClass}
                placeholder="you@example.com"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-ink)]">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                className={fieldClass}
                placeholder="+44…"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="clientReference" className="block text-sm font-medium text-[var(--color-ink)]">
                Your own reference <span className="font-normal text-[var(--color-ink-muted)]">(optional)</span>
              </label>
              <input
                id="clientReference"
                autoComplete="off"
                className={fieldClass}
                placeholder="e.g. policy number, broker ref — not your enquiry number from us"
                value={values.clientReference ?? ""}
                onChange={(e) =>
                  set("clientReference", e.target.value === "" ? undefined : e.target.value)
                }
                maxLength={40}
              />
              <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
                We assign an <strong className="text-[var(--color-ink)]">enquiry number</strong> (starts with ENQ-) when
                you submit. Use this field only if you want your own label on our reply — letters, numbers, spaces, or{" "}
                <span className="font-mono">. - / _</span> only, max 40 characters.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <label
              htmlFor="vehicleRegistration"
              className="block text-sm font-medium text-[var(--color-ink)]"
            >
              Vehicle registration
            </label>
            <input
              id="vehicleRegistration"
              autoComplete="off"
              className={cn(fieldClass, "uppercase tracking-wide")}
              placeholder="AB12 CDE"
              value={values.vehicleRegistration}
              onChange={(e) => set("vehicleRegistration", e.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
              UK registration format. Spaces are fine — we normalise before sending.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <div>
              <label
                htmlFor="incidentDate"
                className="block text-sm font-medium text-[var(--color-ink)]"
              >
                Incident date
              </label>
              <input
                id="incidentDate"
                type="date"
                className={fieldClass}
                value={values.incidentDate}
                onChange={(e) => set("incidentDate", e.target.value)}
              />
            </div>
            <div>
              <span className="block text-sm font-medium text-[var(--color-ink)]">Fault status</span>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                {(
                  [
                    ["non_fault", "Non-fault"],
                    ["fault", "My fault / split"],
                    ["unknown", "Not sure yet"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-transparent px-1 py-1 text-sm text-[var(--color-ink)] touch-manipulation has-[:checked]:border-[var(--color-accent)]/40 has-[:checked]:bg-[var(--color-band)]"
                  >
                    <input
                      type="radio"
                      name="faultStatus"
                      value={value}
                      checked={values.faultStatus === value}
                      className="size-5 accent-[var(--color-surface)] sm:size-4"
                      onChange={() => set("faultStatus", value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[var(--color-ink)]">
                What happened?
              </label>
              <textarea
                id="message"
                rows={6}
                className={cn(fieldClass, "min-h-[10rem] resize-y")}
                placeholder="Location, other parties, police reference, injuries, photos available…"
                value={values.message}
                onChange={(e) => set("message", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)]">
                Photos (optional, max 8, JPEG/PNG/WebP, 5MB each)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                multiple
                className="mt-2 block w-full text-sm text-[var(--color-ink-muted)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-surface)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  setPendingFiles((prev) => {
                    const next = [...prev, ...picked].slice(0, 8);
                    return next;
                  });
                }}
              />
              {pendingFiles.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-[var(--color-ink-muted)]">
                  {pendingFiles.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        className="shrink-0 text-[var(--color-surface)] underline"
                        onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-xl border border-[var(--color-surface)]/10 bg-[var(--color-band)]/50 p-4 sm:p-5">
            <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">
              We use your details only to assess and progress this incident. You can request
              erasure or access under UK GDPR; see our{" "}
              <Link href="/privacy-policy" className="font-medium text-[var(--color-surface)] underline">
                privacy policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="font-medium text-[var(--color-surface)] underline">
                terms &amp; conditions
              </Link>
              .
            </p>
            <label className="mt-5 flex min-h-11 cursor-pointer items-start gap-3 text-sm text-[var(--color-ink)] touch-manipulation">
              <input
                type="checkbox"
                className="mt-1 size-5 shrink-0 rounded border-[var(--color-surface)]/25 accent-[var(--color-surface)] sm:size-4"
                checked={values.consent}
                onChange={(e) => set("consent", e.target.checked)}
              />
              <span className="leading-snug">
                I agree to {siteConfig.name} contacting me about this incident using the details I
                have provided in this wizard.
              </span>
            </label>
          </div>
        )}

        {step === 5 && (
          <dl className="space-y-4 text-sm">
            <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-page)] p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                  Contact
                </dt>
                <dd className="mt-1 text-[var(--color-ink)]">
                  {values.fullName}
                  <br />
                  {values.email}
                  <br />
                  {values.phone}
                </dd>
              </div>
              <button
                type="button"
                onClick={() => goToStep(0)}
                className="shrink-0 text-sm font-medium text-[var(--color-surface)] underline touch-manipulation"
              >
                Change
              </button>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-page)] p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                  Your reference
                </dt>
                <dd className="mt-1 text-[var(--color-ink)]">
                  {values.clientReference?.trim() ? values.clientReference.trim() : "—"}
                </dd>
              </div>
              <button
                type="button"
                onClick={() => goToStep(0)}
                className="shrink-0 text-sm font-medium text-[var(--color-surface)] underline touch-manipulation"
              >
                Change
              </button>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-page)] p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                  Vehicle
                </dt>
                <dd className="mt-1 font-mono text-base text-[var(--color-ink)]">
                  {values.vehicleRegistration.trim().toUpperCase().replace(/\s/g, "") || "—"}
                </dd>
              </div>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="shrink-0 text-sm font-medium text-[var(--color-surface)] underline touch-manipulation"
              >
                Change
              </button>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-page)] p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                  Incident
                </dt>
                <dd className="mt-1 text-[var(--color-ink)]">
                  {values.incidentDate || "—"}
                  <span className="mx-2 text-[var(--color-ink-muted)]">·</span>
                  {faultLabels[values.faultStatus]}
                </dd>
              </div>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="shrink-0 text-sm font-medium text-[var(--color-surface)] underline touch-manipulation"
              >
                Change
              </button>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-page)] p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                  Summary
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-[var(--color-ink)]">{values.message}</dd>
              </div>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="shrink-0 text-sm font-medium text-[var(--color-surface)] underline touch-manipulation"
              >
                Change
              </button>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-surface)]/10 bg-[var(--color-page)] p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                  Photos
                </dt>
                <dd className="mt-1 text-[var(--color-ink)]">
                  {(() => {
                    const attached = values.attachmentUrls ?? [];
                    return (
                      <>
                        {attached.length > 0
                          ? `${attached.length} already attached`
                          : "None attached yet"}
                        {pendingFiles.length > 0
                          ? ` · ${pendingFiles.length} file${pendingFiles.length === 1 ? "" : "s"} will upload when you submit`
                          : null}
                      </>
                    );
                  })()}
                </dd>
              </div>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="shrink-0 text-sm font-medium text-[var(--color-surface)] underline touch-manipulation"
              >
                Change
              </button>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
              <span>Consent recorded — we will only use these details for this enquiry.</span>
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="shrink-0 text-left text-sm font-semibold text-emerald-900 underline touch-manipulation sm:text-right"
              >
                Change consent
              </button>
            </div>
          </dl>
        )}

        {clientError ? (
          <div
            className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="alert"
          >
            {clientError}
          </div>
        ) : null}

        {serverMessage ? (
          <div
            className={cn(
              "mt-6 rounded-md border px-4 py-3 text-sm",
              reference
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-red-200 bg-red-50 text-red-950",
            )}
            role="status"
          >
            {serverMessage}
            {reference ? (
              <p className="mt-1 font-mono text-xs text-emerald-900">Enquiry number (ours): {reference}</p>
            ) : null}
            {yourReference ? (
              <p className="mt-1 font-mono text-xs text-emerald-900">Your reference: {yourReference}</p>
            ) : null}
            {whatsappUrl ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 touch-manipulation"
                >
                  Send to WhatsApp
                </a>
                <p className="text-xs leading-relaxed text-emerald-900/90">
                  Opens WhatsApp with your enquiry details prefilled — tap <strong>Send</strong> to
                  complete.
                </p>
              </div>
            ) : reference ? (
              <p className="mt-3 text-xs leading-relaxed text-emerald-900/90">
                WhatsApp is not configured on this site yet — we still have your enquiry in our CRM
                and will contact you at the email or phone you provided.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--color-surface)]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 || submitting}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--color-surface)]/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-band)] disabled:pointer-events-none disabled:opacity-40 touch-manipulation"
            >
              Back
            </button>
          </div>
          {step < STEPS_META.length - 1 ? (
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[var(--color-surface)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-surface-2)] touch-manipulation sm:w-auto sm:min-w-[10rem]"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[var(--color-surface)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-surface-2)] disabled:opacity-60 touch-manipulation sm:w-auto sm:min-w-[11rem]"
            >
              {submitting ? "Sending…" : "Submit enquiry"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
