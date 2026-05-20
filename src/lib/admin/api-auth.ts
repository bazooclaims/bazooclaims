import { NextResponse } from "next/server";

import { getSession } from "@/lib/admin/auth";
import { isAdminRole } from "@/lib/admin/staff-role";

export async function requireApiSession() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireAdminSession() {
  const result = await requireApiSession();
  if (result.error) return result;
  if (!isAdminRole(result.session!.role)) {
    return {
      session: null,
      error: NextResponse.json({ ok: false, error: "Admin only" }, { status: 403 }),
    };
  }
  return result;
}
