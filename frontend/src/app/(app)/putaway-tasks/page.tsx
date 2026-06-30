import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelPutawayTaskAction,
  completePutawayTaskAction,
  createPutawayTaskAction,
  startPutawayTaskAction,
} from "@/features/putaway/putaway-actions";
import { PutawayTasksPage } from "@/features/putaway/putaway-tasks-page";
import { listInventoryBalances } from "@/lib/api/inventory-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { listPutawayTasks } from "@/lib/api/putaway-api";
import { listLocations } from "@/lib/api/warehouse-structure-api";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { InventoryBalance } from "@/types/inventory";
import type { Location } from "@/types/warehouse-structure";

type PutawayTasksRoutePageProps = {
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function PutawayTasksRoutePage({
  searchParams,
}: PutawayTasksRoutePageProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const resolvedSearchParams = await searchParams;
  const access = await getPageAccess("/putaway-tasks");

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

  const putawayTasksResult = await listPutawayTasks();

  if (!putawayTasksResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.putawayTasks.route.listUnavailableTitle}
        message={putawayTasksResult.message}
        fallbackMessage={messages.putawayTasks.route.listUnavailableFallback}
      />
    );
  }

  const canCreate = hasRole(access.session.user.roles, "Admin");
  const canExecute = hasRole(access.session.user.roles, "Warehouse");

  let sourceBalances: InventoryBalance[] = [];
  let destinationLocations: Location[] = [];
  let createDataError: string | null = null;

  if (canCreate) {
    const [balancesResult, locationsResult] = await Promise.all([
      listInventoryBalances(),
      listLocations(),
    ]);

    if (!balancesResult.ok) {
      createDataError =
        balancesResult.message ??
        messages.putawayTasks.route.createBalancesFallback;
    } else if (!locationsResult.ok) {
      createDataError =
        locationsResult.message ??
        messages.putawayTasks.route.createDestinationsFallback;
    } else {
      sourceBalances = balancesResult.data
        .filter(
          (balance) =>
            balance.locationType.toUpperCase() === "RECEIVING" &&
            balance.availableQuantity > 0,
        )
        .sort((left, right) => {
          const productOrder = left.productSku.localeCompare(right.productSku);

          if (productOrder !== 0) {
            return productOrder;
          }

          return left.locationCode.localeCompare(right.locationCode);
        });
      destinationLocations = locationsResult.data
        .filter(
          (location) =>
            location.isActive &&
            !location.isBlocked &&
            location.locationType.toUpperCase() !== "RECEIVING",
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
  }

  return (
    <PutawayTasksPage
      currentRoles={access.currentRoles}
      putawayTasks={putawayTasksResult.data}
      canCreate={canCreate}
      canExecute={canExecute}
      sourceBalances={sourceBalances}
      destinationLocations={destinationLocations}
      createAction={createPutawayTaskAction}
      startAction={startPutawayTaskAction}
      completeAction={completePutawayTaskAction}
      cancelAction={cancelPutawayTaskAction}
      createDataError={createDataError}
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
