import { en } from "@/lib/i18n/messages/en";
import { ro } from "@/lib/i18n/messages/ro";
import type { Locale } from "@/lib/i18n/locale";

export type Messages = typeof en;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly string[]
    ? readonly string[]
    : T[K] extends string
      ? string
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export type DeepPartialMessages = DeepPartial<Messages>;

const localeOverrides: Record<Locale, DeepPartialMessages> = {
  en,
  ro,
};

export function getMessages(locale: Locale): Messages {
  return mergeMessages(en, localeOverrides[locale]);
}

export function interpolateMessage(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? ""),
  );
}

function mergeMessages<T>(base: T, overrides: DeepPartial<T>): T {
  if (Array.isArray(base)) {
    return ((overrides as T | undefined) ?? base) as T;
  }

  if (base && typeof base === "object") {
    const merged: Record<string, unknown> = { ...(base as Record<string, unknown>) };

    for (const key of Object.keys(overrides ?? {})) {
      const baseValue = (base as Record<string, unknown>)[key];
      const overrideValue = (overrides as Record<string, unknown>)[key];

      if (
        baseValue &&
        overrideValue &&
        typeof baseValue === "object" &&
        typeof overrideValue === "object" &&
        !Array.isArray(baseValue) &&
        !Array.isArray(overrideValue)
      ) {
        merged[key] = mergeMessages(
          baseValue as Record<string, unknown>,
          overrideValue as Record<string, unknown>,
        );
      } else if (overrideValue !== undefined) {
        merged[key] = overrideValue;
      }
    }

    return merged as T;
  }

  return ((overrides as T | undefined) ?? base) as T;
}
