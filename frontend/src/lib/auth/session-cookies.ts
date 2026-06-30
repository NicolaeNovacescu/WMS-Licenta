import type { AuthResponse } from "@/types/auth";

export const ACCESS_TOKEN_COOKIE_NAME = "wms_access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "wms_refresh_token";

type CookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  expires: Date;
};

type CookieTarget = {
  set(name: string, value: string, options: CookieOptions): unknown;
};

export function persistSessionCookies(target: CookieTarget, session: AuthResponse) {
  target.set(
    ACCESS_TOKEN_COOKIE_NAME,
    session.accessToken,
    createCookieOptions(session.accessTokenExpiresAtUtc),
  );
  target.set(
    REFRESH_TOKEN_COOKIE_NAME,
    session.refreshToken,
    createCookieOptions(session.refreshTokenExpiresAtUtc),
  );
}

export function clearSessionCookies(target: CookieTarget) {
  target.set(ACCESS_TOKEN_COOKIE_NAME, "", createExpiredCookieOptions());
  target.set(REFRESH_TOKEN_COOKIE_NAME, "", createExpiredCookieOptions());
}

function createCookieOptions(expiresAt: string | Date): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  };
}

function createExpiredCookieOptions(): CookieOptions {
  return createCookieOptions(new Date(0));
}
