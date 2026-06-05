import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { readDb, writeDb } from "@/lib/admin/store";
import { sendCallMeBotWhatsApp } from "@/lib/callmebot";
import { siteConfig } from "@/config/site";

export async function POST() {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;

  const db = await readDb();
  const apiKey =
    db.companyProfile.callMeBotApiKey?.trim() ||
    process.env.WHATSAPP_CALLMEBOT_API_KEY?.trim();
  const phone =
    db.companyProfile.whatsAppNotifyE164?.replace(/\D/g, "") ||
    process.env.WHATSAPP_NOTIFY_E164?.replace(/\D/g, "") ||
    process.env.NEXT_PUBLIC_WHATSAPP_E164?.replace(/\D/g, "");

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "No CallMeBot API key saved. Complete activation and paste your key first." },
      { status: 422 },
    );
  }
  if (!phone) {
    return NextResponse.json(
      { ok: false, error: "No notify phone number set." },
      { status: 422 },
    );
  }

  const text = [
    `${siteConfig.name} — CallMeBot test`,
    "If you received this on WhatsApp, enquiry auto-alerts are working.",
    `Time: ${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}`,
  ].join("\n");

  const result = await sendCallMeBotWhatsApp(phone, text, apiKey);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.detail ?? "CallMeBot rejected the request. Check your API key and activation." },
      { status: 502 },
    );
  }

  await writeDb((d) => {
    d.companyProfile = { ...d.companyProfile, callMeBotApiKey: apiKey, whatsAppNotifyE164: phone };
  });

  return NextResponse.json({ ok: true, message: "Test message sent — check WhatsApp on your business phone." });
}
