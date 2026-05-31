import { SESSION_COOKIE } from "@/lib/admin/constants";
import { getSessionSecret, verifySession, type SessionPayload } from "@/lib/admin/crypto";

/** Validate admin session token (edge-safe — no DB). */
export function sessionFromCookieValue(token: string | undefined): SessionPayload | null {
  if (!token?.includes(".")) return null;
  try {
    return verifySession(token, getSessionSecret());
  } catch {
    return null;
  }
}

export function clearSessionCookieOnResponse(response: Response): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}
