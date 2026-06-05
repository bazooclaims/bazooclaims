import { siteConfig } from "@/config/site";
import { enquiryIntakeWhatsAppMessage, type EnquiryWhatsAppInput } from "@/lib/enquiry-whatsapp";
import { normalizeNotifyPhone, sendCallMeBotWhatsApp } from "@/lib/callmebot";

export type EnquiryNotifyResult = {
  whatsapp: boolean;
  email: boolean;
  webhook: boolean;
  telegram: boolean;
  ntfy: boolean;
  /** Human-readable summary for the confirmation screen. */
  summary: string;
};

export type EnquiryNotifyCredentials = {
  callMeBotApiKey?: string;
  whatsAppNotifyE164?: string;
};

function resolveNotifyPhone(credentials?: EnquiryNotifyCredentials): string | null {
  return (
    normalizeNotifyPhone(credentials?.whatsAppNotifyE164) ||
    normalizeNotifyPhone(process.env.WHATSAPP_NOTIFY_E164) ||
    normalizeNotifyPhone(process.env.NEXT_PUBLIC_WHATSAPP_E164) ||
    normalizeNotifyPhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)
  );
}

function resolveCallMeBotKey(credentials?: EnquiryNotifyCredentials): string | undefined {
  return (
    credentials?.callMeBotApiKey?.trim() ||
    process.env.WHATSAPP_CALLMEBOT_API_KEY?.trim() ||
    undefined
  );
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

/** Resend — free tier email (resend.com). */
async function sendResendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ENQUIRY_NOTIFY_FROM?.trim() || `${siteConfig.name} <onboarding@resend.dev>`;
  if (!apiKey) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  return res.ok;
}

/** Generic webhook — Zapier, Make, n8n, Discord, Slack, etc. */
async function sendWebhook(payload: Record<string, unknown>): Promise<boolean> {
  const url = process.env.ENQUIRY_NOTIFY_WEBHOOK_URL?.trim();
  if (!url) return false;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

/** Telegram Bot API — free instant alerts. */
async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return false;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: truncate(text, 4000) }),
  });
  return res.ok;
}

/** ntfy.sh — free push to the ntfy phone app (no WhatsApp, instant). */
async function sendNtfy(text: string, reference: string): Promise<boolean> {
  const topic = process.env.NTFY_TOPIC?.trim();
  if (!topic) return false;

  const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: "POST",
    headers: {
      Title: `New enquiry ${reference}`,
      Tags: "car,moneybag",
      Priority: "high",
    },
    body: truncate(text, 4000),
  });
  return res.ok;
}

function buildSummary(channels: Omit<EnquiryNotifyResult, "summary">): string {
  const sent: string[] = [];
  if (channels.whatsapp) sent.push("WhatsApp");
  if (channels.email) sent.push("email");
  if (channels.telegram) sent.push("Telegram");
  if (channels.ntfy) sent.push("phone alert");
  if (channels.webhook) sent.push("webhook");
  if (sent.length === 0) {
    return "Saved in our CRM — we will contact you shortly.";
  }
  return `Saved in our CRM and sent to our team via ${sent.join(", ")}.`;
}

/**
 * Notify the business about a new enquiry. Tries every configured free channel in parallel.
 * Non-fatal: CRM save already succeeded before this runs.
 */
export async function notifyEnquirySubmitted(
  data: EnquiryWhatsAppInput,
  credentials?: EnquiryNotifyCredentials,
): Promise<EnquiryNotifyResult> {
  const text = enquiryIntakeWhatsAppMessage(data);
  const phone = resolveNotifyPhone(credentials);
  const callMeBotKey = resolveCallMeBotKey(credentials);
  const notifyEmail =
    process.env.ENQUIRY_NOTIFY_EMAIL?.trim() || siteConfig.supportEmail;

  const payload = {
    type: "enquiry",
    site: siteConfig.name,
    ...data,
    messageText: text,
  };

  const [whatsapp, email, webhook, telegram, ntfy] = await Promise.all([
    phone && callMeBotKey
      ? sendCallMeBotWhatsApp(phone, text, callMeBotKey)
          .then((r) => r.ok)
          .catch(() => false)
      : Promise.resolve(false),
    sendResendEmail(
      notifyEmail,
      `[${siteConfig.name}] New enquiry ${data.reference}`,
      text,
    ).catch(() => false),
    sendWebhook(payload).catch(() => false),
    sendTelegram(text).catch(() => false),
    sendNtfy(text, data.reference).catch(() => false),
  ]);

  const result = { whatsapp, email, webhook, telegram, ntfy };
  return { ...result, summary: buildSummary(result) };
}
