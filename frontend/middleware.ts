import { NextResponse, type NextRequest } from "next/server";

import { refreshTokens } from "./src/lib/auth/auth-api";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  clearSessionCookies,
  persistSessionCookies,
} from "./src/lib/auth/session-cookies";
import { isProtectedPath } from "./src/lib/navigation/app-navigation";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = isProtectedPath(pathname);
  const isLoginRoute = pathname === "/login";
  const isRootRoute = pathname === "/";

  if (!isProtectedRoute && !isLoginRoute && !isRootRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (hasUsableAccessToken(accessToken)) {
    if (isLoginRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (!refreshToken) {
    if (isProtectedRoute) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      clearSessionCookies(response.cookies);
      return response;
    }

    const response = NextResponse.next();
    clearSessionCookies(response.cookies);
    return response;
  }

  const refreshResult = await refreshTokens(refreshToken);

  if (!refreshResult.ok) {
    if (isProtectedRoute) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      clearSessionCookies(response.cookies);
      return response;
    }

    const response = NextResponse.next();
    clearSessionCookies(response.cookies);
    return response;
  }

  const response = isLoginRoute
    ? NextResponse.redirect(new URL("/dashboard", request.url))
    : NextResponse.next();

  persistSessionCookies(response.cookies, refreshResult.data);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

function hasUsableAccessToken(token?: string) {
  if (!token) {
    return false;
  }

  const payload = readJwtPayload(token);

  if (!payload || typeof payload.exp !== "number") {
    return false;
  }

  return payload.exp * 1000 > Date.now() + 15_000;
}

function readJwtPayload(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
}
