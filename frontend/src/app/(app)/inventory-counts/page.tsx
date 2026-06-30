import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelInventoryCountAction,
  createInventoryCountAction,
  startInventoryCountAction,
} from "@/features/inventory-count/inventory-count-actions";
import { InventoryCountsPage } from "@/features/inventory-count/inventory-counts-page";
import { listProducts } from "@/lib/api/catalog-api";
import { listInventoryCounts } from "@/lib/api/inventory-count-api";
import { listInventoryBalances } from "@/lib/api/inventory-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import { listLocations } from "@/lib/api/warehouse-structure-api";
import type { Product } from "@/types/catalog";
import type { InventoryBalance } from "@/types/inventory";
import type { Location } from "@/types/warehouse-structure";

type InventoryCountsRoutePageProps = {
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function InventoryCountsRoutePage({
  searchParams,
}: InventoryCountsRoutePageProps) {
  const resolvedSearchParams = await searchParams;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/inventory-counts");

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

  const inventoryCountsResult = await listInventoryCounts();

  if (!inventoryCountsResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.inventoryCounts.route.listUnavailableTitle}
        message={inventoryCountsResult.message}
        fallbackMessage={messages.inventoryCounts.route.listUnavailableFallback}
      />
    );
  }

  const canCreate =
    hasRole(access.session.user.roles, "Admin") ||
    hasRole(access.session.user.roles, "Warehouse");
  const canExecute = hasRole(access.session.user.roles, "Warehouse");

  let products: Product[] = [];
  let locations: Location[] = [];
  let inventoryBalances: InventoryBalance[] = [];
  let createDataError: string | null = null;
  let expectedPreviewWarning: string | null = null;

  if (canCreate) {
    const [productsResult, locationsResult, balancesResult] = await Promise.all([
      listProducts(),
      listLocations(),
      listInventoryBalances(),
    ]);

    if (!productsResult.ok) {
      createDataError =
        productsResult.message ??
        messages.inventoryCounts.route.createProductsFallback;
    } else if (!locationsResult.ok) {
      createDataError =
        locationsResult.message ??
        messages.inventoryCounts.route.createLocationsFallback;
    } else {
      products = [...productsResult.data].sort((left, right) =>
        left.sku.localeCompare(right.sku),
      );
      locations = [...locationsResult.data].sort((left, right) => {
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

      if (!balancesResult.ok) {
        expectedPreviewWarning =
          balancesResult.message ??
          messages.inventoryCounts.route.expectedPreviewFallback;
      } else {
        inventoryBalances = balancesResult.data;
      }
    }
  }

  return (
    <InventoryCountsPage
      currentRoles={access.currentRoles}
      inventoryCounts={inventoryCountsResult.data}
      products={products}
      locations={locations}
      inventoryBalances={inventoryBalances}
      canCreate={canCreate}
      canExecute={canExecute}
      createAction={createInventoryCountAction}
      startAction={startInventoryCountAction}
      cancelAction={cancelInventoryCountAction}
      createDataError={createDataError}
      expectedPreviewWarning={expectedPreviewWarning}
      actionError={readSearchParam(resolvedSearchParams.actionError)}
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
