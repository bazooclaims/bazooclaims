import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { paginate, parsePageParams } from "@/lib/admin/pagination";
import { readDb } from "@/lib/admin/store";

export async function GET(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams(searchParams);
  const { page, pageSize, q } = parsePageParams(params);
  const status = searchParams.get("status");

  const db = await readDb();
  let list = [...db.enquiries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (status) list = list.filter((e) => e.status === status);
  if (q) {
    const qq = q.toLowerCase();
    list = list.filter(
      (e) =>
        e.reference.toLowerCase().includes(qq) ||
        e.fullName.toLowerCase().includes(qq) ||
        e.email.toLowerCase().includes(qq) ||
        e.vehicleRegistration.toLowerCase().includes(qq),
    );
  }
  return NextResponse.json({ ok: true, ...paginate(list, page, pageSize) });
}
