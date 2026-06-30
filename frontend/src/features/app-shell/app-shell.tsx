"use client";

import { useState, type ReactNode } from "react";

import { SidebarNav } from "@/features/app-shell/sidebar-nav";
import { Topbar } from "@/features/app-shell/topbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(13,118,110,0.06)_0%,rgba(242,238,228,0)_24%),linear-gradient(180deg,#fbf8f1_0%,#f1ecdf_100%)] text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <div
          aria-hidden={!sidebarOpen}
          className={`fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm transition lg:hidden ${
            sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[288px] border-r border-line bg-white/92 px-4 py-4 shadow-[0_18px_70px_rgba(29,41,56,0.18)] transition-transform lg:static lg:z-auto lg:w-[320px] lg:translate-x-0 lg:bg-transparent lg:px-6 lg:py-6 lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarNav onNavigate={() => setSidebarOpen(false)} />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <Topbar onMenuToggle={() => setSidebarOpen((open) => !open)} />
          <main className="mt-6 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
