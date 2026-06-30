import "server-only";

import { requireSession } from "@/lib/auth/session";
import {
  canAccessPath,
  getNavigationItem,
} from "@/lib/navigation/app-navigation";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import type { AppRole } from "@/types/auth";

export async function getPageAccess(pathname: string) {
  const session = await requireSession();
  const locale = await getRequestLocale();
  const page = getNavigationItem(pathname, locale);

  if (!page) {
    return null;
  }

  return {
    locale,
    session,
    page,
    allowedRoles: page.roles,
    currentRoles: session.user.roles,
    canAccess: canAccessPath(session.user.roles, pathname),
  };
}

export function hasRole(roles: readonly string[], targetRole: AppRole) {
  return roles.some((role) => role.trim().toLowerCase() === targetRole.toLowerCase());
}
