import { NextResponse } from "next/server";

import { getSession } from "@/lib/admin/auth";
import { bootstrapAdminIfNeeded, readDb } from "@/lib/admin/store";

export async function GET() {
  await bootstrapAdminIfNeeded();
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const db = await readDb();
  const staff = db.staff.find((s) => s.id === session.staffId && s.active);
  if (!staff) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    staff: { id: staff.id, name: staff.name, email: staff.email, role: staff.role },
  });
}
