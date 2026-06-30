"use server";

import { cookies } from "next/headers";

import {
  LOCALE_COOKIE_NAME,
  parseLocale,
  type Locale,
} from "@/lib/i18n/locale";

export async function setLocaleAction(locale: Locale) {
  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE_NAME, parseLocale(locale), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
