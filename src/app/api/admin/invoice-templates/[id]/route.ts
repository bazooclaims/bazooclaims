import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { newId } from "@/lib/admin/crypto";
import { readDb, writeDb } from "@/lib/admin/store";
import type { InvoiceLine } from "@/types/admin";

type Params = { params: Promise<{ id: string }> };

function normalizeLines(raw: unknown): InvoiceLine[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [{ id: newId("line"), description: "Line item", quantity: 1, unitPrice: 0 }];
  }
  return raw.map((l: { id?: string; description?: string; quantity?: number; unitPrice?: number }) => ({
    id: typeof l.id === "string" && l.id.length > 0 ? l.id : newId("line"),
    description: String(l.description ?? "Line item"),
    quantity: Number(l.quantity) || 1,
    unitPrice: Number(l.unitPrice) || 0,
  }));
}

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const db = await readDb();
  const template = db.invoiceTemplates.find((t) => t.id === id);
  if (!template) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, template });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const patch = (await request.json()) as Partial<{
    name: string;
    description: string;
    taxRate: number;
    lines: unknown;
  }>;

  if (patch.name !== undefined && !String(patch.name).trim()) {
    return NextResponse.json({ ok: false, error: "Name cannot be empty" }, { status: 422 });
  }

  let found = false;
  await writeDb((db) => {
    const template = db.invoiceTemplates.find((t) => t.id === id);
    if (!template) return;
    found = true;
    if (patch.name !== undefined) {
      template.name = String(patch.name).trim();
    }
    if (patch.description !== undefined) {
      const d = String(patch.description).trim();
      template.description = d.length > 0 ? d : undefined;
    }
    if (patch.taxRate !== undefined) {
      template.taxRate = Number(patch.taxRate) || 20;
    }
    if (patch.lines !== undefined) {
      template.lines = normalizeLines(patch.lines);
    }
    template.updatedAt = new Date().toISOString();
  });

  if (!found) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const db = await readDb();
  return NextResponse.json({ ok: true, template: db.invoiceTemplates.find((t) => t.id === id) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  let ok = false;
  await writeDb((db) => {
    const idx = db.invoiceTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return;
    db.invoiceTemplates.splice(idx, 1);
    ok = true;
  });
  if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
