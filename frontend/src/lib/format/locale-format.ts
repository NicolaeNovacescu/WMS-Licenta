import type { Locale } from "@/lib/i18n/locale";

const intlLocaleByAppLocale: Record<Locale, string> = {
  en: "en-GB",
  ro: "ro-RO",
};

export function getIntlLocale(locale: Locale) {
  return intlLocaleByAppLocale[locale];
}

export function formatLocalizedNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(getIntlLocale(locale), options).format(value);
}

export function formatLocalizedQuantity(value: number, locale: Locale) {
  return formatLocalizedNumber(value, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatLocalizedDateTime(
  value: Date | string | number,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), options).format(
    new Date(value),
  );
}
