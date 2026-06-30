"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { ShipmentForm } from "@/features/shipment/shipment-form";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import {
  formatExecutionStatusLabel,
  formatSalesOrderStatusLabel,
} from "@/lib/format/workflow-status";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { PickingTask } from "@/types/picking";
import type { SalesOrderStatus } from "@/types/sales";
import type {
  Shipment,
  ShipmentStatus,
  ShipmentWorkflowFormState,
} from "@/types/shipment";

type ShipmentsPageProps = {
  currentRoles: readonly string[];
  shipments: readonly Shipment[];
  pickingTasks: readonly PickingTask[];
  openAllocatedQuantitiesByPickingTaskLineId: Readonly<Record<string, number>>;
  completedShippedQuantitiesByPickingTaskLineId: Readonly<Record<string, number>>;
  canCreate: boolean;
  canExecute: boolean;
  createAction: (
    state: ShipmentWorkflowFormState,
    formData: FormData,
  ) => Promise<ShipmentWorkflowFormState>;
  startAction: (formData: FormData) => Promise<void>;
  completeAction: (formData: FormData) => Promise<void>;
  cancelAction: (formData: FormData) => Promise<void>;
  createDataError: string | null;
  actionError: string | null;
};

type ShipmentStatusFilter = "all" | "open" | ShipmentStatus;

const knownSalesOrderStatuses: readonly SalesOrderStatus[] = [
  "Draft",
  "Confirmed",
  "PartiallyReserved",
  "FullyReserved",
  "Cancelled",
];

export function ShipmentsPage({
  currentRoles,
  shipments,
  pickingTasks,
  openAllocatedQuantitiesByPickingTaskLineId,
  completedShippedQuantitiesByPickingTaskLineId,
  canCreate,
  canExecute,
  createAction,
  startAction,
  completeAction,
  cancelAction,
  createDataError,
  actionError,
}: ShipmentsPageProps) {
  const { locale, messages } = useLocaleContext();
  const shipmentMessages = messages.shipments;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatusFilter>("open");
  const deferredSearch = useDeferredValue(search);

  const filteredShipments = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...shipments]
      .filter((shipment) => {
        const matchesSearch =
          !query ||
          [
            shipment.id,
            shipment.salesOrderId,
            shipment.salesOrderStatus,
            shipment.status,
            ...shipment.lines.flatMap((line) => [
              line.productSku,
              line.productName,
              line.pickingTaskId,
              line.pickingTaskLineId,
              line.sourceWarehouseCode,
              line.sourceZoneCode,
              line.sourceLocationCode,
              line.sourceLocationName,
            ]),
          ].some((value) => value.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "open"
              ? shipment.status === "Pending" || shipment.status === "InProgress"
              : shipment.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => {
        const priority =
          getStatusPriority(left.status) - getStatusPriority(right.status);

        if (priority !== 0) {
          return priority;
        }

        return right.createdAtUtc.localeCompare(left.createdAtUtc);
      });
  }, [deferredSearch, shipments, statusFilter]);

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {shipmentMessages.list.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {shipmentMessages.list.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentRoles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink"
              >
                {messages.roles[role as keyof typeof messages.roles] ?? role}
              </span>
            ))}
          </div>
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {shipmentMessages.list.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.7fr]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {shipmentMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={shipmentMessages.list.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {shipmentMessages.list.statusLabel}
            </span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ShipmentStatusFilter)
              }
              className={inputClassName}
            >
              <option value="open">{shipmentMessages.list.openShipmentsFirst}</option>
              <option value="all">{shipmentMessages.list.allShipments}</option>
              <option value="Pending">
                {formatExecutionStatusLabel("Pending", locale)}
              </option>
              <option value="InProgress">
                {formatExecutionStatusLabel("InProgress", locale)}
              </option>
              <option value="Completed">
                {formatExecutionStatusLabel("Completed", locale)}
              </option>
              <option value="Cancelled">
                {formatExecutionStatusLabel("Cancelled", locale)}
              </option>
            </select>
          </label>

          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {shipmentMessages.list.resultsLabel}
            </p>
            <p className="mt-3 text-sm font-medium text-ink">
              {interpolateMessage(shipmentMessages.list.resultsTemplate, {
                filtered: filteredShipments.length,
                total: shipments.length,
              })}
            </p>
          </div>
        </div>
      </section>

      <div className={`grid gap-6 ${canCreate ? "xl:grid-cols-[1.1fr_0.9fr]" : ""}`}>
        <section className="space-y-4">
          {filteredShipments.length === 0 ? (
            <EmptyState />
          ) : (
            filteredShipments.map((shipment) => {
              const canStart = canExecute && shipment.status === "Pending";
              const canComplete = canExecute && shipment.status === "InProgress";
              const canCancel =
                canExecute &&
                (shipment.status === "Pending" || shipment.status === "InProgress");

              return (
                <article
                  key={shipment.id}
                  className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                          {interpolateMessage(shipmentMessages.list.orderBadgeTemplate, {
                            id: shipment.salesOrderId.slice(0, 8),
                          })}
                        </span>
                        <StatusBadge status={shipment.status} />
                        <SalesOrderStatusBadge status={shipment.salesOrderStatus} />
                      </div>

                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                        {interpolateMessage(shipmentMessages.list.lineCountTemplate, {
                          count: shipment.lines.length,
                          suffix: getLineSuffix(locale, shipment.lines.length),
                        })}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {summarizeProducts(shipment, shipmentMessages.list.moreTemplate)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {interpolateMessage(shipmentMessages.list.pickingTasksTemplate, {
                          tasks: summarizePickingTasks(
                            shipment,
                            shipmentMessages.list.moreTemplate,
                          ),
                        })}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {interpolateMessage(shipmentMessages.list.sourceTemplate, {
                          sources: summarizeSources(
                            shipment,
                            shipmentMessages.list.moreTemplate,
                          ),
                        })}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {shipmentMessages.list.workflowBoundary}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <Link
                        href={`/shipments/${shipment.id}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                      >
                        {shipmentMessages.list.viewDetails}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Metric
                      label={shipmentMessages.list.metrics.toShip}
                      value={formatQuantity(sumQuantityToShip(shipment), locale)}
                    />
                    <Metric
                      label={shipmentMessages.list.metrics.shipped}
                      value={formatQuantity(sumShippedQuantity(shipment), locale)}
                    />
                    <Metric
                      label={shipmentMessages.list.metrics.created}
                      value={formatTimestamp(shipment.createdAtUtc, locale)}
                    />
                    <Metric
                      label={shipmentMessages.list.metrics.started}
                      value={
                        shipment.startedAtUtc
                          ? formatTimestamp(shipment.startedAtUtc, locale)
                          : shipmentMessages.list.notStarted
                      }
                    />
                    <Metric
                      label={shipmentMessages.list.metrics.completed}
                      value={
                        shipment.completedAtUtc
                          ? formatTimestamp(shipment.completedAtUtc, locale)
                          : shipmentMessages.list.notCompleted
                      }
                    />
                  </div>

                  {canStart || canComplete || canCancel ? (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {canStart ? (
                        <WorkflowForm
                          action={startAction}
                          shipmentId={shipment.id}
                          redirectTo="/shipments"
                          label={shipmentMessages.list.start}
                          tone="secondary"
                        />
                      ) : null}

                      {canComplete ? (
                        <WorkflowForm
                          action={completeAction}
                          shipmentId={shipment.id}
                          redirectTo="/shipments"
                          label={shipmentMessages.list.complete}
                          tone="primary"
                        />
                      ) : null}

                      {canCancel ? (
                        <WorkflowForm
                          action={cancelAction}
                          shipmentId={shipment.id}
                          redirectTo="/shipments"
                          label={shipmentMessages.list.cancel}
                          tone="muted"
                        />
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </section>

        {canCreate ? (
          <div className="space-y-6">
            {createDataError ? (
              <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm text-ink">
                {createDataError}
              </div>
            ) : null}

            {!createDataError ? (
              <ShipmentForm
                action={createAction}
                pickingTasks={pickingTasks}
                openAllocatedQuantitiesByPickingTaskLineId={
                  openAllocatedQuantitiesByPickingTaskLineId
                }
                completedShippedQuantitiesByPickingTaskLineId={
                  completedShippedQuantitiesByPickingTaskLineId
                }
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function WorkflowForm({
  action,
  shipmentId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  shipmentId: string;
  redirectTo: string;
  label: string;
  tone: "primary" | "secondary" | "muted";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="shipmentId" value={shipmentId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <WorkflowButton label={label} tone={tone} />
    </form>
  );
}

function WorkflowButton({
  label,
  tone,
}: {
  label: string;
  tone: "primary" | "secondary" | "muted";
}) {
  const { messages } = useLocaleContext();
  const { pending } = useFormStatus();
  const toneClass =
    tone === "primary"
      ? "bg-accent text-white hover:bg-accent/90"
      : tone === "secondary"
        ? "border border-line bg-white text-ink hover:border-accent hover:text-accent"
        : "border border-stone-300 bg-stone-100 text-stone-800 hover:border-stone-400 hover:bg-stone-200";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${toneClass}`}
    >
      {pending ? messages.common.working : label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ShipmentStatus }) {
  const { locale } = useLocaleContext();
  const toneClass =
    status === "Pending"
      ? "bg-stone-100 text-stone-700"
      : status === "InProgress"
        ? "bg-sky-50 text-sky-700"
        : status === "Completed"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {formatExecutionStatusLabel(status, locale)}
    </span>
  );
}

function SalesOrderStatusBadge({ status }: { status: string }) {
  const { locale } = useLocaleContext();
  const toneClass =
    status === "Confirmed"
      ? "bg-sky-50 text-sky-700"
      : status === "PartiallyReserved"
        ? "bg-amber-50 text-amber-700"
        : status === "FullyReserved"
          ? "bg-emerald-50 text-emerald-700"
          : status === "Cancelled"
            ? "bg-rose-50 text-rose-700"
            : "bg-stone-100 text-stone-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {formatSalesOrderStatusText(status, locale)}
    </span>
  );
}

function EmptyState() {
  const { messages } = useLocaleContext();
  const shipmentMessages = messages.shipments;

  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {shipmentMessages.list.emptyEyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        {shipmentMessages.list.emptyMessage}
      </p>
    </div>
  );
}

function getStatusPriority(status: ShipmentStatus) {
  switch (status) {
    case "Pending":
      return 0;
    case "InProgress":
      return 1;
    case "Completed":
      return 2;
    case "Cancelled":
      return 3;
  }
}

function summarizeProducts(shipment: Shipment, moreTemplate: string) {
  const products = Array.from(new Set(shipment.lines.map((line) => line.productSku)));
  const preview = products.slice(0, 3);

  if (products.length <= 3) {
    return preview.join(", ");
  }

  return interpolateMessage(moreTemplate, {
    preview: preview.join(", "),
    count: products.length - 3,
  });
}

function summarizePickingTasks(shipment: Shipment, moreTemplate: string) {
  const pickingTasks = Array.from(
    new Set(shipment.lines.map((line) => line.pickingTaskId.slice(0, 8))),
  );
  const preview = pickingTasks.slice(0, 3);

  if (pickingTasks.length <= 3) {
    return preview.join(", ");
  }

  return interpolateMessage(moreTemplate, {
    preview: preview.join(", "),
    count: pickingTasks.length - 3,
  });
}

function summarizeSources(shipment: Shipment, moreTemplate: string) {
  const sources = Array.from(
    new Set(
      shipment.lines.map(
        (line) =>
          `${line.sourceWarehouseCode} / ${line.sourceZoneCode} / ${line.sourceLocationCode}`,
      ),
    ),
  );
  const preview = sources.slice(0, 2);

  if (sources.length <= 2) {
    return preview.join(", ");
  }

  return interpolateMessage(moreTemplate, {
    preview: preview.join(", "),
    count: sources.length - 2,
  });
}

function sumQuantityToShip(shipment: Shipment) {
  return shipment.lines.reduce((total, line) => total + line.quantityToShip, 0);
}

function sumShippedQuantity(shipment: Shipment) {
  return shipment.lines.reduce((total, line) => total + line.shippedQuantity, 0);
}

function formatTimestamp(value: string, locale: Locale) {
  return formatLocalizedDateTime(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatQuantity(value: number, locale: Locale) {
  return formatLocalizedQuantity(value, locale);
}

function formatSalesOrderStatusText(status: string, locale: Locale) {
  if (knownSalesOrderStatuses.includes(status as SalesOrderStatus)) {
    return formatSalesOrderStatusLabel(status as SalesOrderStatus, locale);
  }

  return status;
}

function getLineSuffix(locale: Locale, count: number) {
  if (count === 1) {
    return "";
  }

  return locale === "ro" ? "i" : "s";
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
