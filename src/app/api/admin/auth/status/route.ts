import { NextResponse } from "next/server";

import { getAdminAuthConfigStatus } from "@/lib/admin/auth-config";

/** Public config check for deploy debugging (no secrets returned). */
export async function GET() {
  const status = getAdminAuthConfigStatus();
  return NextResponse.json({
    ok: status.ready,
    ...status,
  });
}
