import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { newId } from "@/lib/admin/crypto";
import { filterAssignedStaffId, filterKnownVendorIds, logActivity, readDb, writeDb } from "@/lib/admin/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const db = await readDb();
  const invoice = db.invoices.find((i) => i.id === id);
  if (!invoice) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const claim = invoice.claimId ? db.claims.find((c) => c.id === invoice.claimId) : undefined;
  return NextResponse.json({ ok: true, invoice, claim });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const patch = await request.json();

  let found = false;
  await writeDb((db) => {
    const invoice = db.invoices.find((i) => i.id === id);
    if (!invoice) return;
    found = true;
    const prevClaimId = invoice.claimId;
    const fields = [
      "number",
      "claimId",
      "status",
      "clientName",
      "clientEmail",
      "clientPhone",
      "clientAddress",
      "issueDate",
      "dueDate",
      "lines",
      "notes",
      "taxRate",
      "showLinkedVendorsOnPdf",
      "showTaxOnPdf",
      "showStaffOnPdf",
    ] as const;
    for (const f of fields) {
      if (patch[f] !== undefined) {
        if (f === "lines" && Array.isArray(patch.lines)) {
          invoice.lines = patch.lines.map(
            (l: { id?: string; description: string; quantity: number; unitPrice: number }) => ({
              id: l.id ?? newId("line"),
              description: l.description,
              quantity: Number(l.quantity) || 1,
              unitPrice: Number(l.unitPrice) || 0,
            }),
          );
        } else if (f === "clientAddress") {
          const v = patch.clientAddress;
          if (v == null || v === "") {
            invoice.clientAddress = undefined;
          } else if (typeof v === "string") {
            const t = v.trim();
            invoice.clientAddress = t.length > 0 ? t : undefined;
          }
        } else if (f === "clientEmail") {
          const v = patch.clientEmail;
          if (v == null || v === "") {
            invoice.clientEmail = undefined;
          } else if (typeof v === "string") {
            const t = v.trim();
            invoice.clientEmail = t.length > 0 ? t : undefined;
          }
        } else if (f === "clientPhone") {
          const v = patch.clientPhone;
          if (v == null || v === "") {
            invoice.clientPhone = undefined;
          } else if (typeof v === "string") {
            const t = v.trim();
            invoice.clientPhone = t.length > 0 ? t : undefined;
          }
        } else if (f === "showTaxOnPdf") {
          invoice.showTaxOnPdf = Boolean(patch.showTaxOnPdf);
        } else {
          (invoice as Record<string, unknown>)[f] = patch[f];
        }
      }
    }
    if ("documentTitle" in patch) {
      const v = patch.documentTitle;
      if (v == null || v === "") {
        invoice.documentTitle = undefined;
      } else if (typeof v === "string") {
        const t = v.trim().slice(0, 64);
        invoice.documentTitle = t.length ? t : undefined;
      }
    }
    if (patch.linkedVendorIds !== undefined) {
      const ids = filterKnownVendorIds(db, patch.linkedVendorIds);
      invoice.linkedVendorIds = ids.length ? ids : undefined;
    }
    if ("assignedStaffId" in patch) {
      const id = filterAssignedStaffId(db, patch.assignedStaffId);
      invoice.assignedStaffId = id;
      if (!id) invoice.showStaffOnPdf = false;
    }
    if (patch.showStaffOnPdf !== undefined) {
      invoice.showStaffOnPdf = Boolean(patch.showStaffOnPdf && invoice.assignedStaffId);
    }
    invoice.updatedAt = new Date().toISOString();

    if (prevClaimId && prevClaimId !== invoice.claimId) {
      const old = db.claims.find((c) => c.id === prevClaimId);
      if (old) old.invoiceIds = old.invoiceIds.filter((x) => x !== id);
    }
    if (invoice.claimId) {
      const claim = db.claims.find((c) => c.id === invoice.claimId);
      if (claim && !claim.invoiceIds.includes(id)) claim.invoiceIds.push(id);
    }
  });

  if (!found) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const db = await readDb();
  return NextResponse.json({ ok: true, invoice: db.invoices.find((i) => i.id === id) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  let num = "";
  await writeDb((db) => {
    const idx = db.invoices.findIndex((i) => i.id === id);
    if (idx === -1) return;
    num = db.invoices[idx]!.number;
    const claimId = db.invoices[idx]!.claimId;
    db.invoices.splice(idx, 1);
    if (claimId) {
      const claim = db.claims.find((c) => c.id === claimId);
      if (claim) claim.invoiceIds = claim.invoiceIds.filter((x) => x !== id);
    }
  });
  if (!num) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Deleted invoice",
    entityType: "invoice",
    entityId: id,
    detail: num,
  });
  return NextResponse.json({ ok: true });
}
