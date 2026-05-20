import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { logActivity, readDb, writeDb } from "@/lib/admin/store";
import type { CompanyProfile } from "@/types/admin";

export async function GET() {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const db = await readDb();
  return NextResponse.json({ ok: true, profile: db.companyProfile });
}

export async function PATCH(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const body = (await request.json()) as Partial<CompanyProfile>;

  await writeDb((db) => {
    const cur = db.companyProfile;
    db.companyProfile = {
      legalName: typeof body.legalName === "string" ? body.legalName : cur.legalName,
      tradingName: typeof body.tradingName === "string" ? body.tradingName : cur.tradingName,
      addressLines: Array.isArray(body.addressLines)
        ? body.addressLines.filter((l): l is string => typeof l === "string" && l.trim().length > 0)
        : cur.addressLines,
      city: typeof body.city === "string" ? body.city : cur.city,
      postcode: typeof body.postcode === "string" ? body.postcode : cur.postcode,
      country: typeof body.country === "string" ? body.country : cur.country,
      phone: typeof body.phone === "string" ? body.phone : cur.phone,
      email: typeof body.email === "string" ? body.email : cur.email,
      website: typeof body.website === "string" ? body.website : cur.website,
      vatNumber: typeof body.vatNumber === "string" ? body.vatNumber : cur.vatNumber,
      companyNumber: typeof body.companyNumber === "string" ? body.companyNumber.trim() || undefined : cur.companyNumber,
      logoPath: (() => {
        if (!("logoPath" in body)) return cur.logoPath;
        if (body.logoPath === null || body.logoPath === "") return undefined;
        if (typeof body.logoPath === "string" && body.logoPath.trim()) return body.logoPath.trim();
        return cur.logoPath;
      })(),
    };
  });
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Updated company profile",
    entityType: "system",
  });
  const db = await readDb();
  return NextResponse.json({ ok: true, profile: db.companyProfile });
}
