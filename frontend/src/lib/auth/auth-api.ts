import type { AuthResponse, CurrentUser, LoginCredentials } from "@/types/auth";

type AuthApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

type AuthApiFailure = {
  ok: false;
  status: number;
  message: string | null;
};

export type AuthApiResult<T> = AuthApiSuccess<T> | AuthApiFailure;

const apiBaseUrl =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

export async function login(credentials: LoginCredentials) {
  return requestJson<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function refreshTokens(refreshToken: string) {
  return requestJson<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logoutSession(accessToken: string, refreshToken: string) {
  return requestJson<void>("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function getCurrentUser(accessToken: string) {
  return requestJson<CurrentUser>("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
): Promise<AuthApiResult<T>> {
  try {
    const response = await fetch(buildUrl(path), {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init.method && init.method !== "GET"
          ? { "Content-Type": "application/json" }
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
        message: "Authentication service returned an empty response.",
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
      message: "Unable to reach the authentication service.",
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
    errors?: Record<string, unknown>;
  };

  if (candidate.errors) {
    for (const value of Object.values(candidate.errors)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        return value[0];
      }
    }
  }

  return typeof candidate.title === "string" ? candidate.title : null;
}
