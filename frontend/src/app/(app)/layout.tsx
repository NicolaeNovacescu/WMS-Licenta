import type { ReactNode } from "react";

import { SessionProvider } from "@/features/auth/session-provider";
import { AppShell } from "@/features/app-shell/app-shell";
import { requireSession } from "@/lib/auth/session";

type ProtectedAppLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAppLayout({
  children,
}: ProtectedAppLayoutProps) {
  const session = await requireSession();

  return (
    <SessionProvider initialSession={session}>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
