import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/admin/constants";
import {
  getSessionSecret,
  signSession,
  verifySession,
  type SessionPayload,
} from "@/lib/admin/crypto";
import { bootstrapAdminIfNeeded, readDb } from "@/lib/admin/store";

export { SESSION_COOKIE };

export async function createSessionCookie(staffId: string): Promise<string> {
  await bootstrapAdminIfNeeded();
  const db = await readDb();
  const staff = db.staff.find((s) => s.id === staffId && s.active);
  if (!staff) throw new Error("Staff not found");
  return signSession(
    { staffId: staff.id, email: staff.email, name: staff.name, role: staff.role },
    getSessionSecret(),
  );
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token, getSessionSecret());
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export function setSessionCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${secure}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
