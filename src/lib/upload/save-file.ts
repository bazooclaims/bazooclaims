import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);
const MAX_BYTES = 5 * 1024 * 1024;

export function validateImageUpload(file: { type: string; size: number; name: string }): string | null {
  if (!ALLOWED.has(file.type)) return "Only JPEG, PNG, WebP, or HEIC images are allowed";
  if (file.size > MAX_BYTES) return "Each file must be 5MB or smaller";
  if (file.size < 32) return "File too small";
  return null;
}

export async function savePublicUpload(
  file: Buffer,
  mime: string,
  subfolder: "claims" | "company" | "admin",
): Promise<string> {
  const ext =
    mime === "image/png"
      ? "png"
      : mime === "image/webp"
        ? "webp"
        : mime === "image/heic"
          ? "heic"
          : "jpg";
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, name);
  await writeFile(full, file);
  return `/uploads/${subfolder}/${name}`;
}
