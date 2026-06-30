"use server";

import { redirect } from "next/navigation";

import {
  login,
  logoutSession,
  refreshTokens,
} from "@/lib/auth/auth-api";
import {
  clearSession,
  getSessionTokens,
  storeSession,
} from "@/lib/auth/session";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import type { LoginFormState } from "@/types/auth";

export async function loginAction(
  _: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const userName = String(formData.get("userName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  if (!userName || !password) {
    return {
      error: messages.auth.errors.requiredFields,
    };
  }

  const result = await login({ userName, password });

  if (!result.ok) {
    if (result.status === 401) {
      return {
        error: messages.auth.errors.invalidCredentials,
      };
    }

    return {
      error: result.message ?? messages.auth.errors.generic,
    };
  }

  await storeSession(result.data);
  redirect("/dashboard");
}

export async function logoutAction() {
  const { accessToken, refreshToken } = await getSessionTokens();

  if (accessToken && refreshToken) {
    let bearerToken = accessToken;
    let activeRefreshToken = refreshToken;
    let logoutResult = await logoutSession(bearerToken, activeRefreshToken);

    if (!logoutResult.ok && logoutResult.status === 401) {
      const refreshResult = await refreshTokens(activeRefreshToken);

      if (refreshResult.ok) {
        await storeSession(refreshResult.data);
        bearerToken = refreshResult.data.accessToken;
        activeRefreshToken = refreshResult.data.refreshToken;
        logoutResult = await logoutSession(bearerToken, activeRefreshToken);
      }
    }

    void logoutResult;
  }

  await clearSession();
  redirect("/login");
}
