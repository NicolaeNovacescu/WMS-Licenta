import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelPickingTaskAction,
  completePickingTaskAction,
  createPickingTaskAction,
  startPickingTaskAction,
} from "@/features/picking/picking-actions";
import { PickingTasksPage } from "@/features/picking/picking-tasks-page";
import { listPickingTasks } from "@/lib/api/picking-api";
import { listSalesOrders } from "@/lib/api/sales-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { PickingTask } from "@/types/picking";
import type { SalesOrder } from "@/types/sales";

type PickingTasksRoutePageProps = {
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function PickingTasksRoutePage({
  searchParams,
}: PickingTasksRoutePageProps) {
  const resolvedSearchParams = await searchParams;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/picking-tasks");

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

  const canCreate =
    hasRole(access.session.user.roles, "Admin") ||
    hasRole(access.session.user.roles, "Warehouse");
  const canExecute = hasRole(access.session.user.roles, "Warehouse");

  const [pickingTasksResult, salesOrdersResult] = await Promise.all([
    listPickingTasks(),
    canCreate ? listSalesOrders() : Promise.resolve(null),
  ]);

  if (!pickingTasksResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.pickingTasks.route.listUnavailableTitle}
        message={pickingTasksResult.message}
        fallbackMessage={messages.pickingTasks.route.listUnavailableFallback}
      />
    );
  }

  let salesOrders: SalesOrder[] = [];
  let createDataError: string | null = null;

  if (salesOrdersResult && !salesOrdersResult.ok) {
    createDataError =
      salesOrdersResult.message ??
      messages.pickingTasks.route.createSalesOrdersFallback;
  } else if (salesOrdersResult?.ok) {
    salesOrders = [...salesOrdersResult.data].sort((left, right) =>
      right.updatedAtUtc.localeCompare(left.updatedAtUtc),
    );
  }

  return (
    <PickingTasksPage
      currentRoles={access.currentRoles}
      pickingTasks={pickingTasksResult.data}
      salesOrders={salesOrders}
      openAllocatedQuantitiesByReservationId={buildOpenAllocationMap(
        pickingTasksResult.data,
      )}
      canCreate={canCreate}
      canExecute={canExecute}
      createAction={createPickingTaskAction}
      startAction={startPickingTaskAction}
      completeAction={completePickingTaskAction}
      cancelAction={cancelPickingTaskAction}
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

function buildOpenAllocationMap(pickingTasks: readonly PickingTask[]) {
  const allocations: Record<string, number> = {};

  for (const task of pickingTasks) {
    if (task.status !== "Pending" && task.status !== "InProgress") {
      continue;
    }

    for (const line of task.lines) {
      allocations[line.salesOrderReservationId] =
        (allocations[line.salesOrderReservationId] ?? 0) + line.quantityToPick;
    }
  }

  return allocations;
}

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}
