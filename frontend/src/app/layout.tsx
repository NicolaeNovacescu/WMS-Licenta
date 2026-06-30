import type { Metadata } from "next";
import "./globals.css";

import { LocaleProvider } from "@/features/i18n/locale-provider";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";

export const metadata: Metadata = {
  title: {
    default: "WMS Licenta",
    template: "%s | WMS Licenta",
  },
  description:
    "Frontend authentication foundation and role-aware app shell for a warehouse management system focused on traceability and operational clarity.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale} messages={messages}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
