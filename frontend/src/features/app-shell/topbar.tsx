"use client";

import { usePathname } from "next/navigation";

import { useSession } from "@/features/auth/session-provider";
import { LanguageSwitcher } from "@/features/i18n/language-switcher";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatRoleLabels,
  getNavigationItem,
} from "@/lib/navigation/app-navigation";

type TopbarProps = {
  onMenuToggle: () => void;
};

export function Topbar({ onMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const { user } = useSession();
  const { locale, messages } = useLocaleContext();
  const currentItem = getNavigationItem(pathname, locale);
  const roleLabels = formatRoleLabels(user.roles, locale);

  return (
    <header className="rounded-[28px] border border-line bg-white/78 px-5 py-4 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-white text-ink transition hover:border-accent hover:text-accent lg:hidden"
            aria-label={messages.shell.topbar.toggleNavigation}
          >
            <span className="text-lg font-semibold">≡</span>
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent">
              {messages.shell.topbar.defaultLabel}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              {currentItem?.label ?? messages.shell.topbar.defaultSummary}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:items-end">
          <LanguageSwitcher className="self-start lg:self-auto" />
          <p className="text-sm font-medium text-muted">{user.userName}</p>
          <div className="flex flex-wrap gap-2">
            {roleLabels.map((role) => (
              <span
                key={role}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
