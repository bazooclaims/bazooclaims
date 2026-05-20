import { NextResponse } from "next/server";

import { savePublicUpload, validateImageUpload } from "@/lib/upload/save-file";

export async function POST(request: Request) {
  const form = await request.formData();
  const files = form.getAll("files") as File[];
  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: "No files" }, { status: 400 });
  }
  if (files.length > 8) {
    return NextResponse.json({ ok: false, error: "Maximum 8 images per submission" }, { status: 400 });
  }

  const urls: string[] = [];
  for (const file of files) {
    const err = validateImageUpload({ type: file.type, size: file.size, name: file.name });
    if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    const url = await savePublicUpload(buf, file.type, "claims");
    urls.push(url);
  }

  return NextResponse.json({ ok: true, urls });
}
