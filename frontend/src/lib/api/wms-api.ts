import "server-only";

import { clearSession, getSessionTokens, storeSession } from "@/lib/auth/session";
import { refreshTokens } from "@/lib/auth/auth-api";

type ApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

type ApiFailure = {
  ok: false;
  status: number;
  message: string | null;
};

export type WmsApiResult<T> = ApiSuccess<T> | ApiFailure;

const apiBaseUrl =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

export async function getWmsJson<T>(path: string) {
  const { accessToken } = await getSessionTokens();
  return requestJson<T>(path, { method: "GET" }, accessToken);
}

export async function mutateWmsJson<T>(path: string, init: RequestInit) {
  const { accessToken, refreshToken } = await getSessionTokens();
  let bearerToken = accessToken;

  let result = await requestJson<T>(path, init, bearerToken);

  if (!result.ok && result.status === 401 && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);

    if (!refreshed.ok) {
      await clearSession();
      return result;
    }

    await storeSession(refreshed.data);
    bearerToken = refreshed.data.accessToken;
    result = await requestJson<T>(path, init, bearerToken);
  }

  return result;
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  accessToken?: string | null,
): Promise<WmsApiResult<T>> {
  try {
    const response = await fetch(buildUrl(path), {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init.method && init.method !== "GET"
          ? { "Content-Type": "application/json" }
          : {}),
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
        ...(init.headers ?? {}),
      },
    });

    if (response.status === 204) {
      return {
        ok: true,
        status: response.status,
        data: undefined as T,
      };
    }

    const payload = await readJson<T | Record<string, unknown>>(response);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: extractErrorMessage(payload),
      };
    }

    if (payload === null) {
      return {
        ok: false,
        status: response.status,
        message: "The backend returned an empty response.",
      };
    }

    return {
      ok: true,
      status: response.status,
      data: payload as T,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Unable to reach the backend service.",
    };
  }
}

function buildUrl(path: string) {
  return new URL(path, apiBaseUrl).toString();
}

async function readJson<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function extractErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    title?: unknown;
    message?: unknown;
    errors?: Record<string, unknown>;
  };

  if (candidate.errors) {
    for (const value of Object.values(candidate.errors)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        return value[0];
      }
    }
  }

  if (typeof candidate.message === "string") {
    return candidate.message;
  }

  return typeof candidate.title === "string" ? candidate.title : null;
}
