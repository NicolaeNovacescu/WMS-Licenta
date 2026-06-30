"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { useSession } from "@/features/auth/session-provider";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatRoleLabels,
  getVisibleNavigation,
} from "@/lib/navigation/app-navigation";

type SidebarNavProps = {
  onNavigate: () => void;
};

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useSession();
  const { locale, messages } = useLocaleContext();
  const sections = getVisibleNavigation(user.roles, locale);
  const roleLabels = formatRoleLabels(user.roles, locale);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[30px] border border-line bg-white/90 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
          {messages.common.appName}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          {messages.shell.sidebar.title}
        </h1>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {roleLabels.map((role) => (
          <span
            key={role}
            className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent"
          >
            {role}
          </span>
        ))}
      </div>

      <nav className="mt-8 flex-1 space-y-6 overflow-y-auto pr-1">
        {sections.map((section) => (
          <div key={section.id}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              {section.label}
            </p>
            <div className="mt-3 space-y-2">
              {section.items.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`block rounded-2xl border px-4 py-3 transition ${
                      active
                        ? "border-accent bg-accent text-white shadow-[0_16px_36px_rgba(13,118,110,0.22)]"
                        : "border-line bg-white text-ink hover:border-accent hover:bg-accent-soft/50"
                    }`}
                  >
                    <span className="text-sm font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 rounded-2xl border border-line bg-surface px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {messages.shell.sidebar.signedInAs}
        </p>
        <p className="mt-1 text-sm font-semibold text-ink">{user.userName}</p>
      </div>

      <div className="mt-4">
        <LogoutButton />
      </div>
    </div>
  );
}
