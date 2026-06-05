"use client";

import { useState } from "react";

import { inputClass, labelClass } from "@/components/admin/admin-ui";
import {
  CALLMEBOT_ACTIVATION_MESSAGE,
  CALLMEBOT_BOT_E164,
  callMeBotActivationUrl,
} from "@/lib/callmebot";
import type { CompanyProfile } from "@/types/admin";

type Props = {
  initial: Pick<CompanyProfile, "callMeBotApiKey" | "whatsAppNotifyE164">;
  defaultPhone: string;
};

export function CallMeBotSetupPanel({ initial, defaultPhone }: Props) {
  const [apiKey, setApiKey] = useState(initial.callMeBotApiKey ?? "");
  const [notifyPhone, setNotifyPhone] = useState(
    initial.whatsAppNotifyE164 ?? defaultPhone.replace(/\D/g, ""),
  );
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    const res = await fetch("/api/admin/company-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callMeBotApiKey: apiKey.trim() || undefined,
        whatsAppNotifyE164: notifyPhone.replace(/\D/g, "") || undefined,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string; profile?: CompanyProfile };
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    if (data.profile?.callMeBotApiKey) setApiKey(data.profile.callMeBotApiKey);
    setMessage("CallMeBot settings saved.");
  }

  async function testAlert() {
    setTesting(true);
    setMessage(null);
    setError(null);
    await save();
    const res = await fetch("/api/admin/callmebot-test", { method: "POST" });
    const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
    setTesting(false);
    if (!res.ok) {
      setError(data.error ?? "Test failed");
      return;
    }
    setMessage(data.message ?? "Test sent — check WhatsApp.");
  }

  const activationUrl = callMeBotActivationUrl();
  const configured = apiKey.trim().length > 0;

  return (
    <section className="mt-10 rounded-xl border border-[var(--color-surface)]/15 bg-[var(--color-page-elevated)] p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">WhatsApp enquiry alerts (CallMeBot)</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        When someone submits the website enquiry form, a copy is sent automatically to your WhatsApp.
        Free for personal/business use — one-time activation on your phone.
      </p>

      <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm text-[var(--color-ink-muted)]">
        <li>
          On the phone that receives alerts (<strong className="text-[var(--color-ink)]">+{notifyPhone || "…"}</strong>
          ), open WhatsApp and tap:
          <a
            href={activationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-105 touch-manipulation"
          >
            Activate CallMeBot on WhatsApp
          </a>
          <span className="mt-2 block text-xs">
            Or add <strong>+{CALLMEBOT_BOT_E164}</strong> and send:{" "}
            <code className="rounded bg-[var(--color-band)] px-1 py-0.5 text-[11px]">
              {CALLMEBOT_ACTIVATION_MESSAGE}
            </code>
          </span>
        </li>
        <li>CallMeBot replies with your API key (usually within 2 minutes).</li>
        <li>Paste the key below, save, then click <strong className="text-[var(--color-ink)]">Send test</strong>.</li>
      </ol>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="callmebot-key" className={labelClass}>
            CallMeBot API key
          </label>
          <input
            id="callmebot-key"
            type="password"
            autoComplete="off"
            className={inputClass}
            placeholder={configured ? "•••••••• (saved — enter new key to replace)" : "Paste key from CallMeBot WhatsApp reply"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="notify-phone" className={labelClass}>
            Alert phone (E.164 digits)
          </label>
          <input
            id="notify-phone"
            type="tel"
            className={inputClass}
            placeholder="447798982626"
            value={notifyPhone}
            onChange={(e) => setNotifyPhone(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="flex items-end">
          <p className="text-xs text-[var(--color-ink-muted)]">
            Must match the WhatsApp number you used for activation.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950" role="status">
          {message}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving || testing}
          onClick={() => void save()}
          className="inline-flex min-h-11 items-center rounded-md bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-surface-2)] disabled:opacity-60 touch-manipulation"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={testing || saving || !apiKey.trim()}
          onClick={() => void testAlert()}
          className="inline-flex min-h-11 items-center rounded-md border border-[var(--color-surface)]/25 px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-band)] disabled:opacity-60 touch-manipulation"
        >
          {testing ? "Sending test…" : "Send test to WhatsApp"}
        </button>
      </div>

      {configured ? (
        <p className="mt-4 text-xs text-emerald-800">
          API key saved — new website enquiries will auto-notify this WhatsApp when the form is submitted.
        </p>
      ) : (
        <p className="mt-4 text-xs text-amber-900">
          Not active yet — complete step 1 on your phone, then paste the API key here.
        </p>
      )}
    </section>
  );
}
