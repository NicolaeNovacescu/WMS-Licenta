"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { Locale } from "@/lib/i18n/locale";
import type { Messages } from "@/lib/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  children: ReactNode;
  locale: Locale;
  messages: Messages;
};

export function LocaleProvider({
  children,
  locale,
  messages,
}: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale, messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocaleContext must be used inside LocaleProvider.");
  }

  return context;
}
