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
import type { PickingTask, PickingTaskStatus } from "@/types/picking";
import type { SalesOrderStatus } from "@/types/sales";

type PickingTaskDetailPageProps = {
  pickingTask: PickingTask;
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

export function PickingTaskDetailPage({
  pickingTask,
  canExecute,
  actionError,
  startAction,
  completeAction,
  cancelAction,
}: PickingTaskDetailPageProps) {
  const { locale, messages } = useLocaleContext();
  const pickingMessages = messages.pickingTasks;
  const canStart = canExecute && pickingTask.status === "Pending";
  const canComplete = canExecute && pickingTask.status === "InProgress";
  const canCancel =
    canExecute &&
    (pickingTask.status === "Pending" || pickingTask.status === "InProgress");

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {interpolateMessage(pickingMessages.detail.orderBadgeTemplate, {
                  id: pickingTask.salesOrderId.slice(0, 8),
                })}
              </span>
              <StatusBadge status={pickingTask.status} />
              <SalesOrderStatusBadge status={pickingTask.salesOrderStatus} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {interpolateMessage(pickingMessages.detail.titleTemplate, {
                id: pickingTask.id.slice(0, 8),
              })}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              {pickingMessages.detail.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/sales-orders/${pickingTask.salesOrderId}`}
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {pickingMessages.detail.viewSalesOrder}
            </Link>
            <Link
              href="/picking-tasks"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {pickingMessages.detail.backToList}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric
            label={pickingMessages.detail.metrics.lines}
            value={String(pickingTask.lines.length)}
          />
          <Metric
            label={pickingMessages.detail.metrics.toPick}
            value={formatQuantity(sumQuantityToPick(pickingTask), locale)}
          />
          <Metric
            label={pickingMessages.detail.metrics.picked}
            value={formatQuantity(sumPickedQuantity(pickingTask), locale)}
          />
          <Metric
            label={pickingMessages.detail.metrics.created}
            value={formatTimestamp(pickingTask.createdAtUtc, locale)}
          />
          <Metric
            label={pickingMessages.detail.metrics.completed}
            value={
              pickingTask.completedAtUtc
                ? formatTimestamp(pickingTask.completedAtUtc, locale)
                : pickingMessages.detail.notCompleted
            }
          />
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {pickingMessages.detail.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {pickingMessages.detail.workflowActionsEyebrow}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {pickingMessages.detail.workflowActionsDescription}
            </p>

            {canStart || canComplete || canCancel ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {canStart ? (
                  <WorkflowForm
                    action={startAction}
                    pickingTaskId={pickingTask.id}
                    redirectTo={`/picking-tasks/${pickingTask.id}`}
                    label={pickingMessages.detail.start}
                    tone="secondary"
                  />
                ) : null}

                {canComplete ? (
                  <WorkflowForm
                    action={completeAction}
                    pickingTaskId={pickingTask.id}
                    redirectTo={`/picking-tasks/${pickingTask.id}`}
                    label={pickingMessages.detail.complete}
                    tone="primary"
                  />
                ) : null}

                {canCancel ? (
                  <WorkflowForm
                    action={cancelAction}
                    pickingTaskId={pickingTask.id}
                    redirectTo={`/picking-tasks/${pickingTask.id}`}
                    label={pickingMessages.detail.cancel}
                    tone="muted"
                  />
                ) : null}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-muted">
                {pickingMessages.detail.noFurtherAction}
              </p>
            )}
          </section>

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {pickingMessages.detail.summaryEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow
                label={pickingMessages.detail.pickingTaskId}
                value={pickingTask.id}
                mono
              />
              <DetailRow
                label={pickingMessages.detail.salesOrderId}
                value={pickingTask.salesOrderId}
                mono
              />
              <DetailRow
                label={pickingMessages.detail.started}
                value={
                  pickingTask.startedAtUtc
                    ? formatTimestamp(pickingTask.startedAtUtc, locale)
                    : pickingMessages.detail.notStarted
                }
              />
              <DetailRow
                label={pickingMessages.detail.cancelled}
                value={
                  pickingTask.cancelledAtUtc
                    ? formatTimestamp(pickingTask.cancelledAtUtc, locale)
                    : pickingMessages.detail.notCancelled
                }
              />
            </div>
          </section>
        </div>

        <section className="space-y-4">
          {pickingTask.lines.map((line) => (
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
                {interpolateMessage(pickingMessages.detail.sourceTemplate, {
                  path: `${line.sourceWarehouseCode} / ${line.sourceZoneCode} / ${line.sourceLocationCode}`,
                  name: line.sourceLocationName,
                })}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {pickingMessages.detail.lineExecutionBoundary}
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric
                  label={pickingMessages.detail.lineMetrics.toPick}
                  value={formatQuantity(line.quantityToPick, locale)}
                />
                <Metric
                  label={pickingMessages.detail.lineMetrics.picked}
                  value={formatQuantity(line.pickedQuantity, locale)}
                />
                <Metric
                  label={pickingMessages.detail.lineMetrics.reservation}
                  value={truncateId(line.salesOrderReservationId)}
                />
                <Metric
                  label={pickingMessages.detail.lineMetrics.balanceRow}
                  value={truncateId(line.inventoryBalanceId)}
                />
              </div>

              <div className="mt-5 grid gap-3">
                <DetailRow
                  label={pickingMessages.detail.reservationId}
                  value={line.salesOrderReservationId}
                  mono
                />
                <DetailRow
                  label={pickingMessages.detail.inventoryBalanceId}
                  value={line.inventoryBalanceId}
                  mono
                />
                <DetailRow
                  label={pickingMessages.detail.salesOrderLineId}
                  value={line.salesOrderLineId}
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
  pickingTaskId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  pickingTaskId: string;
  redirectTo: string;
  label: string;
  tone: "primary" | "secondary" | "muted";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="pickingTaskId" value={pickingTaskId} />
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

function StatusBadge({ status }: { status: PickingTaskStatus }) {
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

function sumQuantityToPick(task: PickingTask) {
  return task.lines.reduce((total, line) => total + line.quantityToPick, 0);
}

function sumPickedQuantity(task: PickingTask) {
  return task.lines.reduce((total, line) => total + line.pickedQuantity, 0);
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
