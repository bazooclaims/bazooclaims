import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { readDb } from "@/lib/admin/store";

export async function GET() {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;

  const db = await readDb();
  const openStatuses = new Set(["new", "triage", "active", "awaiting_insurer", "mobility", "repair", "settlement"]);
  const openClaims = db.claims.filter((c) => openStatuses.has(c.status)).length;
  const courtesyActive = db.claims.filter((c) => c.courtesyCar.supplied).length;
  const draftInvoices = db.invoices.filter((i) => i.status === "draft").length;
  const unpaidInvoices = db.invoices.filter((i) => i.status === "sent").length;

  return NextResponse.json({
    ok: true,
    stats: {
      totalClaims: db.claims.length,
      openClaims,
      courtesyActive,
      totalInvoices: db.invoices.length,
      draftInvoices,
      unpaidInvoices,
      staffCount: db.staff.filter((s) => s.active).length,
      templatesCount: db.invoiceTemplates.length,
    },
  });
}
