import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { paginate, parsePageParams } from "@/lib/admin/pagination";
import { readDb } from "@/lib/admin/store";

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { searchParams } = new URL(request.url);
  const { page, pageSize } = parsePageParams(searchParams, 15);
  const db = await readDb();
  return NextResponse.json({ ok: true, ...paginate(db.activity, page, pageSize) });
}
