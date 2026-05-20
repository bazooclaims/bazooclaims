import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { newId } from "@/lib/admin/crypto";
import { readDb, seedInvoiceTemplatesIfEmpty, writeDb } from "@/lib/admin/store";

export async function GET() {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  await seedInvoiceTemplatesIfEmpty();
  const db = await readDb();
  return NextResponse.json({ ok: true, templates: db.invoiceTemplates });
}

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const body = await request.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ ok: false, error: "Name required" }, { status: 422 });
  }
  const template = {
    id: newId("tpl"),
    name: body.name.trim(),
    description: body.description?.trim(),
    taxRate: Number(body.taxRate) || 20,
    lines: (body.lines ?? [{ description: "Line item", quantity: 1, unitPrice: 0 }]).map(
      (l: { description: string; quantity: number; unitPrice: number }) => ({
        id: newId("line"),
        description: l.description,
        quantity: Number(l.quantity) || 1,
        unitPrice: Number(l.unitPrice) || 0,
      }),
    ),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await writeDb((db) => {
    db.invoiceTemplates.push(template);
  });
  return NextResponse.json({ ok: true, template }, { status: 201 });
}
