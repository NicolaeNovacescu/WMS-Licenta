"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import { formatInventoryCountStatusLabel } from "@/lib/format/workflow-status";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type {
  InventoryCount,
  InventoryCountLine,
  InventoryCountStatus,
  InventoryCountWorkflowFormState,
} from "@/types/inventory-count";

type InventoryCountDetailPageProps = {
  inventoryCount: InventoryCount;
  canExecute: boolean;
  actionError: string | null;
  startAction: (formData: FormData) => Promise<void>;
  completeAction: (
    state: InventoryCountWorkflowFormState,
    formData: FormData,
  ) => Promise<InventoryCountWorkflowFormState>;
  cancelAction: (formData: FormData) => Promise<void>;
};

const initialState: InventoryCountWorkflowFormState = {
  error: null,
  successMessage: null,
};

export function InventoryCountDetailPage({
  inventoryCount,
  canExecute,
  actionError,
  startAction,
  completeAction,
  cancelAction,
}: InventoryCountDetailPageProps) {
  const { locale, messages } = useLocaleContext();
  const inventoryCountMessages = messages.inventoryCounts;
  const canStart = canExecute && inventoryCount.status === "Draft";
  const canComplete = canExecute && inventoryCount.status === "InProgress";
  const canCancel =
    canExecute &&
    (inventoryCount.status === "Draft" || inventoryCount.status === "InProgress");
  const [state, formAction] = useActionState(completeAction, initialState);
  const [countedValuesByLineId, setCountedValuesByLineId] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      inventoryCount.lines.map((line) => [
        line.id,
        line.countedQuantity === null ? "" : formatInputQuantity(line.countedQuantity),
      ]),
    ),
  );

  const previewTotals = useMemo(() => {
    if (!canComplete) {
      return null;
    }

    let hasMissingValue = false;
    let hasInvalidValue = false;
    let countedTotal = 0;
    let varianceTotal = 0;

    for (const line of inventoryCount.lines) {
      const rawValue = countedValuesByLineId[line.id] ?? "";

      if (rawValue === "") {
        hasMissingValue = true;
        continue;
      }

      const countedQuantity = Number(rawValue);

      if (Number.isNaN(countedQuantity) || countedQuantity < 0) {
        hasInvalidValue = true;
        continue;
      }

      countedTotal += countedQuantity;
      varianceTotal += countedQuantity - line.expectedSystemQuantity;
    }

    return {
      hasMissingValue,
      hasInvalidValue,
      countedTotal,
      varianceTotal,
    };
  }, [canComplete, countedValuesByLineId, inventoryCount.lines]);

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {interpolateMessage(
                  inventoryCountMessages.detail.countBadgeTemplate,
                  {
                    id: inventoryCount.id.slice(0, 8),
                  },
                )}
              </span>
              <StatusBadge status={inventoryCount.status} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {interpolateMessage(
                inventoryCountMessages.detail.titleTemplate,
                {
                  id: inventoryCount.id.slice(0, 8),
                },
              )}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              {inventoryCountMessages.detail.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/inventory-counts"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {inventoryCountMessages.detail.backToList}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric
            label={inventoryCountMessages.detail.metrics.lines}
            value={String(inventoryCount.lines.length)}
          />
          <Metric
            label={inventoryCountMessages.detail.metrics.expected}
            value={formatQuantity(sumExpectedQuantity(inventoryCount), locale)}
          />
          <Metric
            label={inventoryCountMessages.detail.metrics.counted}
            value={formatCountedMetric(
              inventoryCount,
              previewTotals,
              locale,
              inventoryCountMessages,
            )}
          />
          <Metric
            label={inventoryCountMessages.detail.metrics.netVariance}
            value={formatVarianceMetric(
              inventoryCount,
              previewTotals,
              locale,
              inventoryCountMessages,
            )}
          />
          <Metric
            label={inventoryCountMessages.detail.metrics.completed}
            value={
              inventoryCount.completedAtUtc
                ? formatTimestamp(inventoryCount.completedAtUtc, locale)
                : inventoryCountMessages.detail.notCompleted
            }
          />
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {inventoryCountMessages.detail.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {inventoryCountMessages.detail.workflowActionsEyebrow}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {inventoryCountMessages.detail.workflowActionsDescription}
            </p>

            {canStart || canCancel ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {canStart ? (
                  <WorkflowForm
                    action={startAction}
                    inventoryCountId={inventoryCount.id}
                    redirectTo={`/inventory-counts/${inventoryCount.id}`}
                    label={inventoryCountMessages.detail.start}
                    tone="secondary"
                  />
                ) : null}

                {canCancel ? (
                  <WorkflowForm
                    action={cancelAction}
                    inventoryCountId={inventoryCount.id}
                    redirectTo={`/inventory-counts/${inventoryCount.id}`}
                    label={inventoryCountMessages.detail.cancel}
                    tone="muted"
                  />
                ) : null}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-muted">
                {inventoryCountMessages.detail.noFurtherAction}
              </p>
            )}
          </section>

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {inventoryCountMessages.detail.summaryEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow
                label={inventoryCountMessages.detail.inventoryCountId}
                value={inventoryCount.id}
                mono
              />
              <DetailRow
                label={inventoryCountMessages.detail.created}
                value={formatTimestamp(inventoryCount.createdAtUtc, locale)}
              />
              <DetailRow
                label={inventoryCountMessages.detail.started}
                value={
                  inventoryCount.startedAtUtc
                    ? formatTimestamp(inventoryCount.startedAtUtc, locale)
                    : inventoryCountMessages.detail.notStarted
                }
              />
              <DetailRow
                label={inventoryCountMessages.detail.cancelled}
                value={
                  inventoryCount.cancelledAtUtc
                    ? formatTimestamp(inventoryCount.cancelledAtUtc, locale)
                    : inventoryCountMessages.detail.notCancelled
                }
              />
            </div>
          </section>

          {canComplete ? (
            <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
                {inventoryCountMessages.detail.completionGuardEyebrow}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                {inventoryCountMessages.detail.completionGuardDescription}
              </p>
            </section>
          ) : null}
        </div>

        {canComplete ? (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="inventoryCountId" value={inventoryCount.id} />
            <input
              type="hidden"
              name="redirectTo"
              value={`/inventory-counts/${inventoryCount.id}`}
            />

            <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {inventoryCountMessages.detail.countedQuantitiesEyebrow}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {inventoryCountMessages.detail.countedQuantitiesDescription}
                  </p>
                </div>

                <CompleteSubmitButton />
              </div>

              {state.error ? (
                <div className="mt-5 rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
                  {state.error}
                </div>
              ) : null}
            </section>

            {inventoryCount.lines.map((line) => (
              <EditableCountLineCard
                key={line.id}
                line={line}
                countedValue={countedValuesByLineId[line.id] ?? ""}
                onCountedValueChange={(value) =>
                  setCountedValuesByLineId((current) => ({
                    ...current,
                    [line.id]: value,
                  }))
                }
              />
            ))}
          </form>
        ) : (
          <section className="space-y-4">
            {inventoryCount.lines.map((line) => (
              <ReadOnlyCountLineCard key={line.id} line={line} />
            ))}
          </section>
        )}
      </div>
    </section>
  );
}

function EditableCountLineCard({
  line,
  countedValue,
  onCountedValueChange,
}: {
  line: InventoryCountLine;
  countedValue: string;
  onCountedValueChange: (value: string) => void;
}) {
  const { locale, messages } = useLocaleContext();
  const inventoryCountMessages = messages.inventoryCounts;
  const countedQuantity = parseCountedQuantity(countedValue);
  const varianceQuantity =
    countedQuantity === null ? null : countedQuantity - line.expectedSystemQuantity;

  return (
    <article className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <input type="hidden" name="lineInventoryCountLineId" value={line.id} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          {line.productSku}
        </span>
        <StateBadge
          label={formatLocationTypeLabel(
            line.locationType,
            messages.warehouseSetup.forms.locationTypes,
          )}
          tone="muted"
        />
        <StateBadge
          label={
            line.locationIsActive
              ? inventoryCountMessages.detail.locationActive
              : inventoryCountMessages.detail.locationInactive
          }
          tone={line.locationIsActive ? "ok" : "muted"}
        />
        <StateBadge
          label={
            line.locationIsBlocked
              ? inventoryCountMessages.detail.locationBlocked
              : inventoryCountMessages.detail.locationUnblocked
          }
          tone={line.locationIsBlocked ? "danger" : "ok"}
        />
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {line.productName}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        {interpolateMessage(inventoryCountMessages.detail.locationTemplate, {
          path: `${line.warehouseCode} / ${line.zoneCode} / ${line.locationCode}`,
          name: line.locationName,
        })}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">
        {inventoryCountMessages.detail.lineWorkflowBoundary}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={inventoryCountMessages.detail.lineMetrics.expected}
          value={formatQuantity(line.expectedSystemQuantity, locale)}
        />
        <div className="rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {inventoryCountMessages.detail.lineMetrics.countedQuantity}
          </p>
          <input
            name="lineCountedQuantity"
            type="number"
            min="0"
            step="0.01"
            value={countedValue}
            onChange={(event) => onCountedValueChange(event.target.value)}
            placeholder={inventoryCountMessages.detail.countedQuantityPlaceholder}
            className={`${inputClassName} mt-3`}
          />
        </div>
        <Metric
          label={inventoryCountMessages.detail.lineMetrics.variancePreview}
          value={
            varianceQuantity === null
              ? inventoryCountMessages.detail.pendingEntry
              : formatSignedQuantity(varianceQuantity, locale)
          }
        />
        <Metric
          label={inventoryCountMessages.detail.lineMetrics.balanceRow}
          value={
            line.inventoryBalanceId
              ? truncateId(line.inventoryBalanceId)
              : inventoryCountMessages.detail.none
          }
        />
      </div>

      <div className="mt-5 grid gap-3">
        <DetailRow
          label={inventoryCountMessages.detail.countLineId}
          value={line.id}
          mono
        />
        <DetailRow
          label={inventoryCountMessages.detail.inventoryBalanceId}
          value={
            line.inventoryBalanceId ??
            inventoryCountMessages.detail.missingBalanceEditable
          }
          mono={line.inventoryBalanceId !== null}
        />
      </div>
    </article>
  );
}

function ReadOnlyCountLineCard({ line }: { line: InventoryCountLine }) {
  const { locale, messages } = useLocaleContext();
  const inventoryCountMessages = messages.inventoryCounts;

  return (
    <article className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          {line.productSku}
        </span>
        <StateBadge
          label={formatLocationTypeLabel(
            line.locationType,
            messages.warehouseSetup.forms.locationTypes,
          )}
          tone="muted"
        />
        <StateBadge
          label={
            line.locationIsActive
              ? inventoryCountMessages.detail.locationActive
              : inventoryCountMessages.detail.locationInactive
          }
          tone={line.locationIsActive ? "ok" : "muted"}
        />
        <StateBadge
          label={
            line.locationIsBlocked
              ? inventoryCountMessages.detail.locationBlocked
              : inventoryCountMessages.detail.locationUnblocked
          }
          tone={line.locationIsBlocked ? "danger" : "ok"}
        />
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {line.productName}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        {interpolateMessage(inventoryCountMessages.detail.locationTemplate, {
          path: `${line.warehouseCode} / ${line.zoneCode} / ${line.locationCode}`,
          name: line.locationName,
        })}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={inventoryCountMessages.detail.lineMetrics.expected}
          value={formatQuantity(line.expectedSystemQuantity, locale)}
        />
        <Metric
          label={inventoryCountMessages.detail.lineMetrics.counted}
          value={
            line.countedQuantity === null
              ? inventoryCountMessages.detail.notRecorded
              : formatQuantity(line.countedQuantity, locale)
          }
        />
        <Metric
          label={inventoryCountMessages.detail.lineMetrics.variance}
          value={
            line.varianceQuantity === null
              ? inventoryCountMessages.detail.notPosted
              : formatSignedQuantity(line.varianceQuantity, locale)
          }
        />
        <Metric
          label={inventoryCountMessages.detail.lineMetrics.balanceRow}
          value={
            line.inventoryBalanceId
              ? truncateId(line.inventoryBalanceId)
              : inventoryCountMessages.detail.none
          }
        />
      </div>

      <div className="mt-5 grid gap-3">
        <DetailRow
          label={inventoryCountMessages.detail.countLineId}
          value={line.id}
          mono
        />
        <DetailRow
          label={inventoryCountMessages.detail.inventoryBalanceId}
          value={
            line.inventoryBalanceId ??
            inventoryCountMessages.detail.missingBalanceReadonly
          }
          mono={line.inventoryBalanceId !== null}
        />
      </div>
    </article>
  );
}

function WorkflowForm({
  action,
  inventoryCountId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  inventoryCountId: string;
  redirectTo: string;
  label: string;
  tone: "primary" | "secondary" | "muted";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="inventoryCountId" value={inventoryCountId} />
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

function CompleteSubmitButton() {
  const { messages } = useLocaleContext();
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending
        ? messages.inventoryCounts.detail.posting
        : messages.inventoryCounts.detail.completeSubmit}
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

function StatusBadge({ status }: { status: InventoryCountStatus }) {
  const { locale } = useLocaleContext();
  const toneClass =
    status === "Draft"
      ? "bg-stone-100 text-stone-700"
      : status === "InProgress"
        ? "bg-sky-50 text-sky-700"
        : status === "Completed"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {formatInventoryCountStatusLabel(status, locale)}
    </span>
  );
}

function sumExpectedQuantity(inventoryCount: InventoryCount) {
  return inventoryCount.lines.reduce(
    (total, line) => total + line.expectedSystemQuantity,
    0,
  );
}

function formatCountedMetric(
  inventoryCount: InventoryCount,
  previewTotals: {
    hasMissingValue: boolean;
    hasInvalidValue: boolean;
    countedTotal: number;
    varianceTotal: number;
  } | null,
  locale: Locale,
  inventoryCountMessages: Messages["inventoryCounts"],
) {
  if (inventoryCount.status === "Completed") {
    return formatQuantity(
      inventoryCount.lines.reduce(
        (total, line) => total + (line.countedQuantity ?? 0),
        0,
      ),
      locale,
    );
  }

  if (!previewTotals || previewTotals.hasMissingValue || previewTotals.hasInvalidValue) {
    return inventoryCountMessages.detail.pendingEntry;
  }

  return formatQuantity(previewTotals.countedTotal, locale);
}

function formatVarianceMetric(
  inventoryCount: InventoryCount,
  previewTotals: {
    hasMissingValue: boolean;
    hasInvalidValue: boolean;
    countedTotal: number;
    varianceTotal: number;
  } | null,
  locale: Locale,
  inventoryCountMessages: Messages["inventoryCounts"],
) {
  if (inventoryCount.status === "Completed") {
    return formatSignedQuantity(
      inventoryCount.lines.reduce(
        (total, line) => total + (line.varianceQuantity ?? 0),
        0,
      ),
      locale,
    );
  }

  if (!previewTotals || previewTotals.hasMissingValue || previewTotals.hasInvalidValue) {
    return inventoryCountMessages.detail.pendingPreview;
  }

  return formatSignedQuantity(previewTotals.varianceTotal, locale);
}

function parseCountedQuantity(value: string) {
  if (value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue) || numericValue < 0) {
    return null;
  }

  return numericValue;
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

function formatSignedQuantity(value: number, locale: Locale) {
  const formatted = formatQuantity(Math.abs(value), locale);

  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

function formatInputQuantity(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.00$/, "");
}

function truncateId(value: string) {
  return value.slice(0, 8);
}

function formatLocationTypeLabel(
  locationType: string,
  labels: Messages["warehouseSetup"]["forms"]["locationTypes"],
) {
  return labels[locationType as keyof typeof labels] ?? locationType;
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
