import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/admin/constants";
import { clearSessionCookieOnResponse, sessionFromCookieValue } from "@/lib/admin/session-cookie";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/register"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionFromCookieValue(token);
  const hasInvalidCookie = Boolean(token && !session);

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (hasInvalidCookie) {
      const res = NextResponse.next();
      clearSessionCookieOnResponse(res);
      return res;
    }
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") {
      login.searchParams.set("next", pathname);
    }
    const res = NextResponse.redirect(login);
    if (hasInvalidCookie) clearSessionCookieOnResponse(res);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
