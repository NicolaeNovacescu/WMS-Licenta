"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import {
  formatExecutionStatusLabel,
  formatSalesOrderStatusLabel,
} from "@/lib/format/workflow-status";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { SalesOrderStatus } from "@/types/sales";
import type { Shipment, ShipmentStatus } from "@/types/shipment";

type ShipmentDetailPageProps = {
  shipment: Shipment;
  canExecute: boolean;
  actionError: string | null;
  startAction: (formData: FormData) => Promise<void>;
  completeAction: (formData: FormData) => Promise<void>;
  cancelAction: (formData: FormData) => Promise<void>;
};

const knownSalesOrderStatuses: readonly SalesOrderStatus[] = [
  "Draft",
  "Confirmed",
  "PartiallyReserved",
  "FullyReserved",
  "Cancelled",
];

export function ShipmentDetailPage({
  shipment,
  canExecute,
  actionError,
  startAction,
  completeAction,
  cancelAction,
}: ShipmentDetailPageProps) {
  const { locale, messages } = useLocaleContext();
  const shipmentMessages = messages.shipments;
  const canStart = canExecute && shipment.status === "Pending";
  const canComplete = canExecute && shipment.status === "InProgress";
  const canCancel =
    canExecute &&
    (shipment.status === "Pending" || shipment.status === "InProgress");

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {interpolateMessage(shipmentMessages.detail.orderBadgeTemplate, {
                  id: shipment.salesOrderId.slice(0, 8),
                })}
              </span>
              <StatusBadge status={shipment.status} />
              <SalesOrderStatusBadge status={shipment.salesOrderStatus} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {interpolateMessage(shipmentMessages.detail.titleTemplate, {
                id: shipment.id.slice(0, 8),
              })}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              {shipmentMessages.detail.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/sales-orders/${shipment.salesOrderId}`}
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {shipmentMessages.detail.viewSalesOrder}
            </Link>
            <Link
              href="/shipments"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {shipmentMessages.detail.backToList}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric
            label={shipmentMessages.detail.metrics.lines}
            value={String(shipment.lines.length)}
          />
          <Metric
            label={shipmentMessages.detail.metrics.toShip}
            value={formatQuantity(sumQuantityToShip(shipment), locale)}
          />
          <Metric
            label={shipmentMessages.detail.metrics.shipped}
            value={formatQuantity(sumShippedQuantity(shipment), locale)}
          />
          <Metric
            label={shipmentMessages.detail.metrics.created}
            value={formatTimestamp(shipment.createdAtUtc, locale)}
          />
          <Metric
            label={shipmentMessages.detail.metrics.completed}
            value={
              shipment.completedAtUtc
                ? formatTimestamp(shipment.completedAtUtc, locale)
                : shipmentMessages.detail.notCompleted
            }
          />
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {shipmentMessages.detail.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {shipmentMessages.detail.workflowActionsEyebrow}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {shipmentMessages.detail.workflowActionsDescription}
            </p>

            {canStart || canComplete || canCancel ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {canStart ? (
                  <WorkflowForm
                    action={startAction}
                    shipmentId={shipment.id}
                    redirectTo={`/shipments/${shipment.id}`}
                    label={shipmentMessages.detail.start}
                    tone="secondary"
                  />
                ) : null}

                {canComplete ? (
                  <WorkflowForm
                    action={completeAction}
                    shipmentId={shipment.id}
                    redirectTo={`/shipments/${shipment.id}`}
                    label={shipmentMessages.detail.complete}
                    tone="primary"
                  />
                ) : null}

                {canCancel ? (
                  <WorkflowForm
                    action={cancelAction}
                    shipmentId={shipment.id}
                    redirectTo={`/shipments/${shipment.id}`}
                    label={shipmentMessages.detail.cancel}
                    tone="muted"
                  />
                ) : null}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-muted">
                {shipmentMessages.detail.noFurtherAction}
              </p>
            )}
          </section>

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {shipmentMessages.detail.summaryEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow
                label={shipmentMessages.detail.shipmentId}
                value={shipment.id}
                mono
              />
              <DetailRow
                label={shipmentMessages.detail.salesOrderId}
                value={shipment.salesOrderId}
                mono
              />
              <DetailRow
                label={shipmentMessages.detail.pickingTasks}
                value={summarizePickingTasks(shipment, shipmentMessages.list.moreTemplate)}
              />
              <DetailRow
                label={shipmentMessages.detail.started}
                value={
                  shipment.startedAtUtc
                    ? formatTimestamp(shipment.startedAtUtc, locale)
                    : shipmentMessages.detail.notStarted
                }
              />
              <DetailRow
                label={shipmentMessages.detail.cancelled}
                value={
                  shipment.cancelledAtUtc
                    ? formatTimestamp(shipment.cancelledAtUtc, locale)
                    : shipmentMessages.detail.notCancelled
                }
              />
            </div>
          </section>
        </div>

        <section className="space-y-4">
          {shipment.lines.map((line) => (
            <article
              key={line.id}
              className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  {line.productSku}
                </span>
                <StateBadge
                  label={formatLocationTypeLabel(
                    line.sourceLocationType,
                    messages.warehouseSetup.forms.locationTypes,
                  )}
                  tone="muted"
                />
                <StateBadge
                  label={
                    line.sourceLocationIsActive
                      ? messages.common.states.active
                      : messages.common.states.inactive
                  }
                  tone={line.sourceLocationIsActive ? "ok" : "muted"}
                />
                <StateBadge
                  label={
                    line.sourceLocationIsBlocked
                      ? messages.common.states.blocked
                      : messages.common.states.unblocked
                  }
                  tone={line.sourceLocationIsBlocked ? "danger" : "ok"}
                />
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                {line.productName}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {interpolateMessage(shipmentMessages.detail.sourceTemplate, {
                  path: `${line.sourceWarehouseCode} / ${line.sourceZoneCode} / ${line.sourceLocationCode}`,
                  name: line.sourceLocationName,
                })}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {shipmentMessages.detail.lineWorkflowBoundary}
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric
                  label={shipmentMessages.detail.lineMetrics.toShip}
                  value={formatQuantity(line.quantityToShip, locale)}
                />
                <Metric
                  label={shipmentMessages.detail.lineMetrics.shipped}
                  value={formatQuantity(line.shippedQuantity, locale)}
                />
                <Metric
                  label={shipmentMessages.detail.lineMetrics.pickingTask}
                  value={truncateId(line.pickingTaskId)}
                />
                <Metric
                  label={shipmentMessages.detail.lineMetrics.pickingLine}
                  value={truncateId(line.pickingTaskLineId)}
                />
              </div>

              <div className="mt-5 grid gap-3">
                <DetailRow
                  label={shipmentMessages.detail.pickingTaskId}
                  value={line.pickingTaskId}
                  mono
                />
                <DetailRow
                  label={shipmentMessages.detail.pickingTaskLineId}
                  value={line.pickingTaskLineId}
                  mono
                />
                <DetailRow
                  label={shipmentMessages.detail.reservationId}
                  value={line.salesOrderReservationId}
                  mono
                />
                <DetailRow
                  label={shipmentMessages.detail.inventoryBalanceId}
                  value={line.inventoryBalanceId}
                  mono
                />
              </div>
            </article>
          ))}
        </section>
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

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className={`mt-3 text-sm text-ink ${mono ? "break-all font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function StateBadge({
  label,
  tone,
}: {
  label: string;
  tone: "ok" | "muted" | "danger";
}) {
  const toneClass =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "danger"
        ? "bg-rose-50 text-rose-700"
        : "bg-stone-100 text-stone-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
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

function sumQuantityToShip(shipment: Shipment) {
  return shipment.lines.reduce((total, line) => total + line.quantityToShip, 0);
}

function sumShippedQuantity(shipment: Shipment) {
  return shipment.lines.reduce((total, line) => total + line.shippedQuantity, 0);
}

function summarizePickingTasks(shipment: Shipment, moreTemplate: string) {
  const uniquePickingTaskIds = Array.from(
    new Set(shipment.lines.map((line) => line.pickingTaskId)),
  );
  const preview = uniquePickingTaskIds.slice(0, 3).map(truncateId);

  if (uniquePickingTaskIds.length <= 3) {
    return preview.join(", ");
  }

  return interpolateMessage(moreTemplate, {
    preview: preview.join(", "),
    count: uniquePickingTaskIds.length - 3,
  });
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

function truncateId(value: string) {
  return value.slice(0, 8);
}

function formatSalesOrderStatusText(status: string, locale: Locale) {
  if (knownSalesOrderStatuses.includes(status as SalesOrderStatus)) {
    return formatSalesOrderStatusLabel(status as SalesOrderStatus, locale);
  }

  return status;
}

function formatLocationTypeLabel(
  locationType: string,
  labels: Messages["warehouseSetup"]["forms"]["locationTypes"],
) {
  return labels[locationType as keyof typeof labels] ?? locationType;
}
