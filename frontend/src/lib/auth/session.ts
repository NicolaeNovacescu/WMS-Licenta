import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/auth-api";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  clearSessionCookies,
  persistSessionCookies,
} from "@/lib/auth/session-cookies";
import type { AppSession, AuthResponse } from "@/types/auth";

export const getOptionalSession = cache(async (): Promise<AppSession | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken) {
    return null;
  }

  const currentUser = await getCurrentUser(accessToken);

  if (!currentUser.ok) {
    return null;
  }

  return {
    user: currentUser.data,
  };
});

export async function requireSession() {
  const session = await getOptionalSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function storeSession(session: AuthResponse) {
  const cookieStore = await cookies();
  persistSessionCookies(cookieStore, session);
}

export async function clearSession() {
  const cookieStore = await cookies();
  clearSessionCookies(cookieStore);
}

export async function getSessionTokens() {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? null,
  };
}
