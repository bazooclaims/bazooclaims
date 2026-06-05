/** Official CallMeBot WhatsApp bot — https://www.callmebot.com/blog/free-api-whatsapp-messages/ */
export const CALLMEBOT_BOT_E164 = "34611048748";

export const CALLMEBOT_ACTIVATION_MESSAGE = "I allow callmebot to send me messages";

export function callMeBotActivationUrl(): string {
  return `https://wa.me/${CALLMEBOT_BOT_E164}?text=${encodeURIComponent(CALLMEBOT_ACTIVATION_MESSAGE)}`;
}

export function normalizeNotifyPhone(raw: string | undefined | null): string | null {
  if (!raw?.trim()) return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length >= 10 && digits.length <= 11) {
    digits = `44${digits.slice(1)}`;
  }
  return digits.length >= 10 ? digits : null;
}

/** CallMeBot expects +countrycode in the phone query param. */
export function callMeBotPhoneParam(e164Digits: string): string {
  return e164Digits.startsWith("+") ? e164Digits : `+${e164Digits}`;
}

export async function sendCallMeBotWhatsApp(
  phoneE164Digits: string,
  text: string,
  apiKey: string,
): Promise<{ ok: boolean; detail?: string }> {
  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", callMeBotPhoneParam(phoneE164Digits));
  url.searchParams.set("text", text.length > 1400 ? `${text.slice(0, 1399)}…` : text);
  url.searchParams.set("apikey", apiKey);

  try {
    const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    const body = await res.text();
    if (res.ok) return { ok: true };
    return { ok: false, detail: body.slice(0, 200) || `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "Network error" };
  }
}
