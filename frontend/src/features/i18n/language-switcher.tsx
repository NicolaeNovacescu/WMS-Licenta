"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLocaleAction } from "@/features/i18n/locale-actions";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import type { Locale } from "@/lib/i18n/locale";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { locale, messages } = useLocaleContext();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-white/80 p-1 ${
        className ?? ""
      }`.trim()}
      aria-label={messages.localeSwitcher.label}
    >
      <LocaleButton
        active={locale === "en"}
        disabled={pending}
        label={messages.localeSwitcher.englishShort}
        title={messages.localeSwitcher.english}
        onClick={() =>
          switchLocale({
            nextLocale: "en",
            currentLocale: locale,
            router,
            startTransition,
          })
        }
      />
      <LocaleButton
        active={locale === "ro"}
        disabled={pending}
        label={messages.localeSwitcher.romanianShort}
        title={messages.localeSwitcher.romanian}
        onClick={() =>
          switchLocale({
            nextLocale: "ro",
            currentLocale: locale,
            router,
            startTransition,
          })
        }
      />
    </div>
  );
}

function LocaleButton({
  active,
  disabled,
  label,
  title,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-w-11 items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-accent text-white shadow-[0_8px_18px_rgba(13,118,110,0.22)]"
          : "text-ink hover:bg-accent-soft hover:text-accent"
      } disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {label}
    </button>
  );
}

function switchLocale({
  nextLocale,
  currentLocale,
  router,
  startTransition,
}: {
  nextLocale: Locale;
  currentLocale: Locale;
  router: ReturnType<typeof useRouter>;
  startTransition: ReturnType<typeof useTransition>[1];
}) {
  if (nextLocale === currentLocale) {
    return;
  }

  startTransition(async () => {
    await setLocaleAction(nextLocale);
    router.refresh();
  });
}
