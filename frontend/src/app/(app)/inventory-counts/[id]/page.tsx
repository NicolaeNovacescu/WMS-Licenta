import { notFound } from "next/navigation";

import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelInventoryCountAction,
  completeInventoryCountAction,
  startInventoryCountAction,
} from "@/features/inventory-count/inventory-count-actions";
import { InventoryCountDetailPage } from "@/features/inventory-count/inventory-count-detail-page";
import { getInventoryCount } from "@/lib/api/inventory-count-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";

type InventoryCountDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function InventoryCountDetailRoute({
  params,
  searchParams,
}: InventoryCountDetailRouteProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess(`/inventory-counts/${id}`);

  if (!access) {
    return null;
  }

  if (!access.canAccess) {
    return (
      <AccessDenied
        title={access.page.label}
        allowedRoles={access.allowedRoles}
        currentRoles={access.currentRoles}
      />
    );
  }

  const inventoryCountResult = await getInventoryCount(id);

  if (!inventoryCountResult.ok) {
    if (inventoryCountResult.status === 404) {
      notFound();
    }

    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.inventoryCounts.route.detailUnavailableTitle}
        message={inventoryCountResult.message}
        fallbackMessage={messages.inventoryCounts.route.detailUnavailableFallback}
      />
    );
  }

  return (
    <InventoryCountDetailPage
      inventoryCount={inventoryCountResult.data}
      canExecute={hasRole(access.session.user.roles, "Warehouse")}
      actionError={readSearchParam(resolvedSearchParams.actionError)}
      startAction={startInventoryCountAction}
      completeAction={completeInventoryCountAction}
      cancelAction={cancelInventoryCountAction}
    />
  );
}

function ApiErrorState({
  eyebrow,
  title,
  message,
  fallbackMessage,
}: {
  eyebrow: string;
  title: string;
  message: string | null;
  fallbackMessage: string;
}) {
  return (
    <section className="rounded-[32px] border border-amber-300 bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warning">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        {message ?? fallbackMessage}
      </p>
    </section>
  );
}

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}
