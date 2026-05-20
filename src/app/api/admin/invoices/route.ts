import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { newId } from "@/lib/admin/crypto";
import { paginate, parsePageParams } from "@/lib/admin/pagination";
import { filterAssignedStaffId, filterKnownVendorIds, logActivity, nextInvoiceNumber, readDb, writeDb } from "@/lib/admin/store";
import type { Invoice, InvoiceLine } from "@/types/admin";

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, pageSize, q } = parsePageParams(searchParams);
  const claimId = searchParams.get("claimId");

  const db = await readDb();
  let list = [...db.invoices].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  if (claimId) list = list.filter((i) => i.claimId === claimId);
  if (q) {
    const qq = q.toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    list = list.filter((i) => {
      const textMatch =
        i.number.toLowerCase().includes(qq) ||
        i.clientName.toLowerCase().includes(qq) ||
        (i.clientEmail?.toLowerCase().includes(qq) ?? false);
      const phoneMatch =
        qDigits.length >= 3 && (i.clientPhone?.replace(/\D/g, "").includes(qDigits) ?? false);
      return textMatch || phoneMatch;
    });
  }

  return NextResponse.json({ ok: true, ...paginate(list, page, pageSize) });
}

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;

  const body = (await request.json()) as Partial<Invoice> & { lines?: Partial<InvoiceLine>[] };
  if (!body.clientName?.trim()) {
    return NextResponse.json({ ok: false, error: "Client name required" }, { status: 422 });
  }

  const db = await readDb();
  const now = new Date().toISOString();
  const lines: InvoiceLine[] = (body.lines ?? []).map((l) => ({
    id: newId("line"),
    description: String(l.description ?? "Line item"),
    quantity: Number(l.quantity) || 1,
    unitPrice: Number(l.unitPrice) || 0,
  }));
  if (lines.length === 0) {
    lines.push({ id: newId("line"), description: "Service", quantity: 1, unitPrice: 0 });
  }

  const linkedVendorIds = filterKnownVendorIds(db, body.linkedVendorIds);
  const invoice: Invoice = {
    id: newId("inv"),
    number: body.number?.trim() || nextInvoiceNumber(db),
    claimId: body.claimId,
    status: body.status ?? "draft",
    clientName: body.clientName.trim(),
    clientEmail: body.clientEmail?.trim(),
    clientPhone: body.clientPhone?.trim() || undefined,
    clientAddress: body.clientAddress?.trim(),
    issueDate: body.issueDate ?? now.slice(0, 10),
    dueDate: body.dueDate ?? now.slice(0, 10),
    lines,
    notes: body.notes?.trim(),
    taxRate: Number(body.taxRate) || 20,
    documentTitle: (() => {
      const t = typeof body.documentTitle === "string" ? body.documentTitle.trim().slice(0, 64) : "";
      return t.length ? t : undefined;
    })(),
    showTaxOnPdf: body.showTaxOnPdf !== false,
    linkedVendorIds: linkedVendorIds.length ? linkedVendorIds : undefined,
    showLinkedVendorsOnPdf: Boolean(body.showLinkedVendorsOnPdf),
    assignedStaffId: filterAssignedStaffId(db, body.assignedStaffId),
    showStaffOnPdf: Boolean(body.showStaffOnPdf && filterAssignedStaffId(db, body.assignedStaffId)),
    createdAt: now,
    updatedAt: now,
    createdById: auth.session!.staffId,
  };

  await writeDb((d) => {
    d.invoices.push(invoice);
    if (invoice.claimId) {
      const claim = d.claims.find((c) => c.id === invoice.claimId);
      if (claim && !claim.invoiceIds.includes(invoice.id)) claim.invoiceIds.push(invoice.id);
    }
  });
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Created invoice",
    entityType: "invoice",
    entityId: invoice.id,
    detail: invoice.number,
  });

  return NextResponse.json({ ok: true, invoice }, { status: 201 });
}
