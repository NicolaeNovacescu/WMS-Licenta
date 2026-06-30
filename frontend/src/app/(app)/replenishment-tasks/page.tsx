import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelReplenishmentTaskAction,
  completeReplenishmentTaskAction,
  createReplenishmentTaskAction,
  startReplenishmentTaskAction,
} from "@/features/replenishment/replenishment-task-actions";
import { ReplenishmentTasksPage } from "@/features/replenishment/replenishment-tasks-page";
import { listInventoryBalances } from "@/lib/api/inventory-api";
import {
  listReplenishmentRules,
  listReplenishmentTasks,
} from "@/lib/api/replenishment-api";
import { listLocations } from "@/lib/api/warehouse-structure-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { InventoryBalance } from "@/types/inventory";
import type { ReplenishmentRule } from "@/types/replenishment";
import type { Location } from "@/types/warehouse-structure";

type ReplenishmentTasksRoutePageProps = {
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function ReplenishmentTasksRoutePage({
  searchParams,
}: ReplenishmentTasksRoutePageProps) {
  const resolvedSearchParams = await searchParams;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/replenishment-tasks");

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

  const replenishmentTasksResult = await listReplenishmentTasks();

  if (!replenishmentTasksResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.replenishmentTasks.route.listUnavailableTitle}
        message={replenishmentTasksResult.message}
        fallbackMessage={messages.replenishmentTasks.route.listUnavailableFallback}
      />
    );
  }

  const canCreate =
    hasRole(access.session.user.roles, "Admin") ||
    hasRole(access.session.user.roles, "Warehouse");
  const canExecute = hasRole(access.session.user.roles, "Warehouse");
  const canReadRules = hasRole(access.session.user.roles, "Admin");

  let inventoryBalances: InventoryBalance[] = [];
  let sourceBalances: InventoryBalance[] = [];
  let targetLocations: Location[] = [];
  let replenishmentRules: ReplenishmentRule[] = [];
  let createDataError: string | null = null;
  let ruleDataWarning: string | null = null;

  if (canCreate) {
    const [balancesResult, locationsResult, rulesResult] = await Promise.all([
      listInventoryBalances(),
      listLocations(),
      canReadRules ? listReplenishmentRules() : Promise.resolve(null),
    ]);

    if (!balancesResult.ok) {
      createDataError =
        balancesResult.message ??
        messages.replenishmentTasks.route.createBalancesFallback;
    } else if (!locationsResult.ok) {
      createDataError =
        locationsResult.message ??
        messages.replenishmentTasks.route.createLocationsFallback;
    } else {
      inventoryBalances = balancesResult.data;
      sourceBalances = balancesResult.data
        .filter(
          (balance) =>
            balance.availableQuantity > 0 && balance.locationIsActive,
        )
        .sort((left, right) => {
          const productOrder = left.productSku.localeCompare(right.productSku);

          if (productOrder !== 0) {
            return productOrder;
          }

          const warehouseOrder = left.warehouseCode.localeCompare(right.warehouseCode);

          if (warehouseOrder !== 0) {
            return warehouseOrder;
          }

          const zoneOrder = left.zoneCode.localeCompare(right.zoneCode);

          if (zoneOrder !== 0) {
            return zoneOrder;
          }

          return left.locationCode.localeCompare(right.locationCode);
        });
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

      if (rulesResult && !rulesResult.ok) {
        ruleDataWarning =
          rulesResult.message ??
          messages.replenishmentTasks.route.ruleDataWarning;
      } else if (rulesResult?.ok) {
        replenishmentRules = rulesResult.data;
      }
    }
  }

  return (
    <ReplenishmentTasksPage
      currentRoles={access.currentRoles}
      replenishmentTasks={replenishmentTasksResult.data}
      replenishmentRules={replenishmentRules}
      canCreate={canCreate}
      canExecute={canExecute}
      canReadRules={canReadRules}
      sourceBalances={sourceBalances}
      inventoryBalances={inventoryBalances}
      targetLocations={targetLocations}
      createAction={createReplenishmentTaskAction}
      startAction={startReplenishmentTaskAction}
      completeAction={completeReplenishmentTaskAction}
      cancelAction={cancelReplenishmentTaskAction}
      createDataError={createDataError}
      actionError={readSearchParam(resolvedSearchParams.actionError)}
      ruleDataWarning={ruleDataWarning}
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
