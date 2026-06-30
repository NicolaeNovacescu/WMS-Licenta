import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelShipmentAction,
  completeShipmentAction,
  createShipmentAction,
  startShipmentAction,
} from "@/features/shipment/shipment-actions";
import { ShipmentsPage } from "@/features/shipment/shipments-page";
import { listPickingTasks } from "@/lib/api/picking-api";
import { listShipments } from "@/lib/api/shipment-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { PickingTask } from "@/types/picking";
import type { Shipment } from "@/types/shipment";

type ShipmentsRoutePageProps = {
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function ShipmentsRoutePage({
  searchParams,
}: ShipmentsRoutePageProps) {
  const resolvedSearchParams = await searchParams;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/shipments");

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

  const [shipmentsResult, pickingTasksResult] = await Promise.all([
    listShipments(),
    canCreate ? listPickingTasks() : Promise.resolve(null),
  ]);

  if (!shipmentsResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.shipments.route.listUnavailableTitle}
        message={shipmentsResult.message}
        fallbackMessage={messages.shipments.route.listUnavailableFallback}
      />
    );
  }

  let pickingTasks: PickingTask[] = [];
  let createDataError: string | null = null;

  if (pickingTasksResult && !pickingTasksResult.ok) {
    createDataError =
      pickingTasksResult.message ??
      messages.shipments.route.createPickingTasksFallback;
  } else if (pickingTasksResult?.ok) {
    pickingTasks = [...pickingTasksResult.data].sort((left, right) =>
      (right.completedAtUtc ?? right.createdAtUtc).localeCompare(
        left.completedAtUtc ?? left.createdAtUtc,
      ),
    );
  }

  return (
    <ShipmentsPage
      currentRoles={access.currentRoles}
      shipments={shipmentsResult.data}
      pickingTasks={pickingTasks}
      openAllocatedQuantitiesByPickingTaskLineId={buildOpenAllocationMap(
        shipmentsResult.data,
      )}
      completedShippedQuantitiesByPickingTaskLineId={buildCompletedShipmentMap(
        shipmentsResult.data,
      )}
      canCreate={canCreate}
      canExecute={canExecute}
      createAction={createShipmentAction}
      startAction={startShipmentAction}
      completeAction={completeShipmentAction}
      cancelAction={cancelShipmentAction}
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

function buildOpenAllocationMap(shipments: readonly Shipment[]) {
  const allocations: Record<string, number> = {};

  for (const shipment of shipments) {
    if (shipment.status !== "Pending" && shipment.status !== "InProgress") {
      continue;
    }

    for (const line of shipment.lines) {
      allocations[line.pickingTaskLineId] =
        (allocations[line.pickingTaskLineId] ?? 0) + line.quantityToShip;
    }
  }

  return allocations;
}

function buildCompletedShipmentMap(shipments: readonly Shipment[]) {
  const shipped: Record<string, number> = {};

  for (const shipment of shipments) {
    if (shipment.status !== "Completed") {
      continue;
    }

    for (const line of shipment.lines) {
      shipped[line.pickingTaskLineId] =
        (shipped[line.pickingTaskLineId] ?? 0) + line.shippedQuantity;
    }
  }

  return shipped;
}

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}
