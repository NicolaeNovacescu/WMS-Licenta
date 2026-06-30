import { notFound } from "next/navigation";

import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  deactivateReplenishmentRuleAction,
  updateReplenishmentRuleAction,
} from "@/features/replenishment/replenishment-rule-actions";
import { ReplenishmentRuleDetailPage } from "@/features/replenishment/replenishment-rule-detail-page";
import { listProducts } from "@/lib/api/catalog-api";
import { getReplenishmentRule } from "@/lib/api/replenishment-api";
import { listLocations } from "@/lib/api/warehouse-structure-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess } from "@/lib/navigation/route-access";
import type { Product } from "@/types/catalog";
import type { Location } from "@/types/warehouse-structure";

type ReplenishmentRuleDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function ReplenishmentRuleDetailRoute({
  params,
  searchParams,
}: ReplenishmentRuleDetailRouteProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess(`/replenishment-rules/${id}`);

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

  const replenishmentRuleResult = await getReplenishmentRule(id);

  if (!replenishmentRuleResult.ok) {
    if (replenishmentRuleResult.status === 404) {
      notFound();
    }

    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.replenishmentRules.route.detailUnavailableTitle}
        message={replenishmentRuleResult.message}
        fallbackMessage={messages.replenishmentRules.route.detailUnavailableFallback}
      />
    );
  }

  const [productsResult, locationsResult] = await Promise.all([
    listProducts(),
    listLocations(),
  ]);

  let products: Product[] = [];
  let targetLocations: Location[] = [];
  let adminDataError: string | null = null;

  if (!productsResult.ok) {
    adminDataError =
      productsResult.message ??
      messages.replenishmentRules.route.editProductsFallback;
  } else if (!locationsResult.ok) {
    adminDataError =
      locationsResult.message ??
      messages.replenishmentRules.route.editLocationsFallback;
  } else {
    products = [...productsResult.data].sort((left, right) =>
      left.sku.localeCompare(right.sku),
    );
    targetLocations = locationsResult.data
      .filter(
        (location) =>
          location.isActive &&
          !location.isBlocked &&
          location.locationType.toUpperCase() === "PICKING",
      )
      .sort((left, right) => {
        const warehouseOrder = left.warehouseCode.localeCompare(right.warehouseCode);

        if (warehouseOrder !== 0) {
          return warehouseOrder;
        }

        const zoneOrder = left.zoneCode.localeCompare(right.zoneCode);

        if (zoneOrder !== 0) {
          return zoneOrder;
        }

        return left.code.localeCompare(right.code);
      });
  }

  return (
    <ReplenishmentRuleDetailPage
      replenishmentRule={replenishmentRuleResult.data}
      products={products}
      targetLocations={targetLocations}
      adminDataError={adminDataError}
      actionError={readSearchParam(resolvedSearchParams.actionError)}
      updateAction={updateReplenishmentRuleAction.bind(null, id)}
      deactivateAction={deactivateReplenishmentRuleAction.bind(
        null,
        id,
        `/replenishment-rules/${id}`,
      )}
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
