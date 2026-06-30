import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelTransferTaskAction,
  completeTransferTaskAction,
  createTransferTaskAction,
  startTransferTaskAction,
} from "@/features/transfer/transfer-actions";
import { TransferTasksPage } from "@/features/transfer/transfer-tasks-page";
import { listInventoryBalances } from "@/lib/api/inventory-api";
import { listTransferTasks } from "@/lib/api/transfer-api";
import { listLocations } from "@/lib/api/warehouse-structure-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { InventoryBalance } from "@/types/inventory";
import type { Location } from "@/types/warehouse-structure";

type TransferTasksRoutePageProps = {
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function TransferTasksRoutePage({
  searchParams,
}: TransferTasksRoutePageProps) {
  const resolvedSearchParams = await searchParams;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/transfer-tasks");

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

  const transferTasksResult = await listTransferTasks();

  if (!transferTasksResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.transferTasks.route.listUnavailableTitle}
        message={transferTasksResult.message}
        fallbackMessage={messages.transferTasks.route.listUnavailableFallback}
      />
    );
  }

  const canCreate =
    hasRole(access.session.user.roles, "Admin") ||
    hasRole(access.session.user.roles, "Warehouse");
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
        messages.transferTasks.route.createBalancesFallback;
    } else if (!locationsResult.ok) {
      createDataError =
        locationsResult.message ??
        messages.transferTasks.route.createDestinationsFallback;
    } else {
      sourceBalances = balancesResult.data
        .filter(
          (balance) =>
            balance.availableQuantity > 0 &&
            balance.locationIsActive &&
            balance.locationType.toUpperCase() !== "RECEIVING",
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
    <TransferTasksPage
      currentRoles={access.currentRoles}
      transferTasks={transferTasksResult.data}
      canCreate={canCreate}
      canExecute={canExecute}
      sourceBalances={sourceBalances}
      destinationLocations={destinationLocations}
      createAction={createTransferTaskAction}
      startAction={startTransferTaskAction}
      completeAction={completeTransferTaskAction}
      cancelAction={cancelTransferTaskAction}
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
