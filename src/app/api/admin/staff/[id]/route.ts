import { NextResponse } from "next/server";

import { requireAdminSession, requireApiSession } from "@/lib/admin/api-auth";
import { hashPassword, verifyPassword } from "@/lib/admin/crypto";
import { isAdminRole, normalizeStaffRole } from "@/lib/admin/staff-role";
import { logActivity, readDb, writeDb } from "@/lib/admin/store";
import type { StaffMember } from "@/types/admin";

type Params = { params: Promise<{ id: string }> };

function safeStaff(s: StaffMember) {
  const { passwordHash: _, ...rest } = s;
  return rest;
}

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const isAdmin = isAdminRole(auth.session!.role);
  const isSelf = auth.session!.staffId === id;
  if (!isAdmin && !isSelf) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const db = await readDb();
  const staff = db.staff.find((s) => s.id === id);
  if (!staff) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, staff: safeStaff(staff) });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { id } = await params;
  const isAdmin = isAdminRole(auth.session!.role);
  const isSelf = auth.session!.staffId === id;
  if (!isAdmin && !isSelf) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
    role?: StaffMember["role"];
    active?: boolean;
  };

  const dbBefore = await readDb();
  const target = dbBefore.staff.find((s) => s.id === id);
  if (!target) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ ok: false, error: "Email required" }, { status: 422 });
    }
    if (dbBefore.staff.some((s) => s.email === email && s.id !== id)) {
      return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
    }
  }

  if (body.password !== undefined && body.password !== "") {
    if (body.password.length < 8) {
      return NextResponse.json({ ok: false, error: "Password must be at least 8 characters" }, { status: 422 });
    }
    if (!isAdmin) {
      const cur = body.currentPassword ?? "";
      if (!verifyPassword(cur, target.passwordHash)) {
        return NextResponse.json({ ok: false, error: "Current password incorrect" }, { status: 403 });
      }
    }
  }

  if (!isAdmin && (body.role !== undefined || body.active !== undefined)) {
    return NextResponse.json({ ok: false, error: "Only admins can change role or active status" }, { status: 403 });
  }

  if (isAdmin && body.role !== undefined) {
    const nextRole = normalizeStaffRole(body.role, target.role);
    if (!isAdminRole(auth.session!.role) && isAdminRole(nextRole)) {
      return NextResponse.json({ ok: false, error: "Only admins can assign the admin role" }, { status: 403 });
    }
  }

  if (isAdmin && (body.role !== undefined || body.active === false)) {
    const nextRole =
      body.role !== undefined ? normalizeStaffRole(body.role, target.role) : target.role;
    if (isAdminRole(target.role) && (!isAdminRole(nextRole) || body.active === false)) {
      const otherActiveAdmins = dbBefore.staff.filter(
        (s) => s.id !== id && isAdminRole(s.role) && s.active,
      );
      if (otherActiveAdmins.length === 0) {
        return NextResponse.json(
          { ok: false, error: "Cannot demote or deactivate the last admin" },
          { status: 422 },
        );
      }
    }
  }

  await writeDb((db) => {
    const s = db.staff.find((x) => x.id === id);
    if (!s) return;
    if (typeof body.name === "string" && body.name.trim()) s.name = body.name.trim();
    if (typeof body.email === "string") s.email = body.email.trim().toLowerCase();
    if (body.password && body.password.length >= 8) {
      s.passwordHash = hashPassword(body.password);
    }
    if (isAdmin) {
      if (body.role !== undefined) s.role = normalizeStaffRole(body.role, s.role);
      if (typeof body.active === "boolean") s.active = body.active;
    }
  });

  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: isSelf && !isAdmin ? "Updated own profile" : "Updated staff member",
    entityType: "staff",
    entityId: id,
  });

  const db = await readDb();
  const staff = db.staff.find((s) => s.id === id);
  return NextResponse.json({ ok: true, staff: staff ? safeStaff(staff) : null });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminSession();
  if (auth.error) return auth.error;
  const { id } = await params;

  if (auth.session!.staffId === id) {
    return NextResponse.json({ ok: false, error: "You cannot delete your own account" }, { status: 422 });
  }

  const dbBefore = await readDb();
  const target = dbBefore.staff.find((s) => s.id === id);
  if (!target) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  if (isAdminRole(target.role)) {
    const otherAdmins = dbBefore.staff.filter((s) => isAdminRole(s.role) && s.id !== id && s.active);
    if (otherAdmins.length === 0) {
      return NextResponse.json({ ok: false, error: "Cannot remove the last admin" }, { status: 422 });
    }
  }

  await writeDb((db) => {
    const idx = db.staff.findIndex((s) => s.id === id);
    if (idx !== -1) db.staff.splice(idx, 1);
    for (const c of db.claims) {
      if (c.assignedToId === id) c.assignedToId = undefined;
    }
  });

  await logActivity({
    actorId: auth.session!.staffId,
    actorName: auth.session!.name,
    action: "Removed staff member",
    entityType: "staff",
    entityId: id,
    detail: target.email,
  });

  return NextResponse.json({ ok: true });
}
