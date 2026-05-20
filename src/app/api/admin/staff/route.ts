import { NextResponse } from "next/server";

import { requireAdminSession, requireApiSession } from "@/lib/admin/api-auth";
import { hashPassword, newId } from "@/lib/admin/crypto";
import { paginate, parsePageParams } from "@/lib/admin/pagination";
import { isAdminRole, normalizeStaffRole } from "@/lib/admin/staff-role";
import { logActivity, readDb, writeDb } from "@/lib/admin/store";

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, pageSize } = parsePageParams(searchParams, 20);
  const db = await readDb();
  const list = db.staff.map(({ passwordHash: _, ...safe }) => safe);
  return NextResponse.json({ ok: true, ...paginate(list, page, pageSize) });
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (auth.error) return auth.error;

  const body = await request.json();
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const role = normalizeStaffRole(body.role, "handler");
  if (!isAdminRole(auth.session!.role) && isAdminRole(role)) {
    return NextResponse.json({ ok: false, error: "Only admins can assign the admin role" }, { status: 403 });
  }

  if (!name || !email || password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Name, email, and password (8+ chars) required" },
      { status: 422 },
    );
  }

  const db = await readDb();
  if (db.staff.some((s) => s.email === email)) {
    return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
  }

  const staff = {
    id: newId("staff"),
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    active: true,
    createdAt: new Date().toISOString(),
  };

  await writeDb((d) => {
    d.staff.push(staff);
  });
  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Created staff member",
    entityType: "staff",
    entityId: staff.id,
    detail: email,
  });

  const { passwordHash: _, ...safe } = staff;
  return NextResponse.json({ ok: true, staff: safe }, { status: 201 });
}
