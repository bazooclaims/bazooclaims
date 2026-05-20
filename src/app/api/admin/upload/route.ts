import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/admin/api-auth";
import { savePublicUpload, validateImageUpload } from "@/lib/upload/save-file";

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });
  }
  const folderRaw = (form.get("folder") as string) ?? "admin";
  const folder =
    folderRaw === "company" ? "company" : folderRaw === "claims" ? "claims" : "admin";
  const err = validateImageUpload({ type: file.type, size: file.size, name: file.name });
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const url = await savePublicUpload(buf, file.type, folder);
  return NextResponse.json({ ok: true, url });
}
