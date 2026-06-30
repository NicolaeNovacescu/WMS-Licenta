"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { AppSession } from "@/types/auth";

const SessionContext = createContext<AppSession | null>(null);

type SessionProviderProps = {
  children: ReactNode;
  initialSession: AppSession;
};

export function SessionProvider({
  children,
  initialSession,
}: SessionProviderProps) {
  return (
    <SessionContext.Provider value={initialSession}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error("useSession must be used inside SessionProvider.");
  }

  return session;
}
