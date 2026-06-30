"use client";

import {
  useActionState,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
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
import type { ShipmentWorkflowFormState } from "@/types/shipment";

const initialState: ShipmentWorkflowFormState = {
  error: null,
  successMessage: null,
};

type ShipmentFormProps = {
  action: (
    state: ShipmentWorkflowFormState,
    formData: FormData,
  ) => Promise<ShipmentWorkflowFormState>;
  pickingTasks: readonly PickingTask[];
  openAllocatedQuantitiesByPickingTaskLineId: Readonly<Record<string, number>>;
  completedShippedQuantitiesByPickingTaskLineId: Readonly<Record<string, number>>;
};

type ShipmentCandidate = {
  salesOrderId: string;
  salesOrderStatus: string;
  pickingTaskId: string;
  pickingTaskLineId: string;
  productSku: string;
  productName: string;
  warehouseCode: string;
  zoneCode: string;
  locationCode: string;
  locationName: string;
  locationType: string;
  locationIsActive: boolean;
  locationIsBlocked: boolean;
  pickedQuantity: number;
  completedShippedQuantity: number;
  openAllocatedQuantity: number;
  remainingShippableQuantity: number;
};

type ShipmentOrderEntry = {
  salesOrderId: string;
  salesOrderStatus: string;
  latestCompletedAtUtc: string;
  candidates: ShipmentCandidate[];
};

type LineSelection = {
  selected: boolean;
  quantity: string;
};

const knownSalesOrderStatuses: readonly SalesOrderStatus[] = [
  "Draft",
  "Confirmed",
  "PartiallyReserved",
  "FullyReserved",
  "Cancelled",
];

export function ShipmentForm({
  action,
  pickingTasks,
  openAllocatedQuantitiesByPickingTaskLineId,
  completedShippedQuantitiesByPickingTaskLineId,
}: ShipmentFormProps) {
  const { locale, messages } = useLocaleContext();
  const shipmentMessages = messages.shipments;
  const [state, formAction] = useActionState(action, initialState);
  const candidateOrders = useMemo(
    () =>
      buildShipmentOrderEntries(
        pickingTasks,
        openAllocatedQuantitiesByPickingTaskLineId,
        completedShippedQuantitiesByPickingTaskLineId,
      ),
    [
      completedShippedQuantitiesByPickingTaskLineId,
      openAllocatedQuantitiesByPickingTaskLineId,
      pickingTasks,
    ],
  );
  const [selectedSalesOrderId, setSelectedSalesOrderId] = useState(
    candidateOrders[0]?.salesOrderId ?? "",
  );
  const [lineSelectionsByOrderId, setLineSelectionsByOrderId] = useState<
    Record<string, Record<string, LineSelection>>
  >({});
  const effectiveSelectedSalesOrderId = useMemo(
    () =>
      candidateOrders.some((entry) => entry.salesOrderId === selectedSalesOrderId)
        ? selectedSalesOrderId
        : (candidateOrders[0]?.salesOrderId ?? ""),
    [candidateOrders, selectedSalesOrderId],
  );
  const selectedEntry =
    candidateOrders.find(
      (entry) => entry.salesOrderId === effectiveSelectedSalesOrderId,
    ) ?? null;
  const selectedCandidates = selectedEntry?.candidates ?? [];
  const selectedLineSelections = mergeSelectionsWithDefaults(
    selectedCandidates,
    lineSelectionsByOrderId[effectiveSelectedSalesOrderId],
  );
  const selectedLineCount = selectedCandidates.filter(
    (candidate) => selectedLineSelections[candidate.pickingTaskLineId]?.selected,
  ).length;

  if (candidateOrders.length === 0) {
    return (
      <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {shipmentMessages.form.emptyEyebrow}
        </p>
        <p className="mt-4 text-sm leading-7 text-muted">
          {shipmentMessages.form.emptyMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {shipmentMessages.form.eyebrow}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
          {shipmentMessages.form.meaningEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">
          {shipmentMessages.form.meaningDescription}
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <Field
          label={shipmentMessages.form.salesOrderLabel}
          htmlFor="salesOrderId"
        >
          <select
            id="salesOrderId"
            name="salesOrderId"
            value={effectiveSelectedSalesOrderId}
            onChange={(event) => setSelectedSalesOrderId(event.target.value)}
            className={inputClassName}
          >
            {candidateOrders.map((entry) => (
              <option key={entry.salesOrderId} value={entry.salesOrderId}>
                {interpolateMessage(shipmentMessages.form.salesOrderOptionTemplate, {
                  id: entry.salesOrderId.slice(0, 8),
                  status: formatSalesOrderStatusText(entry.salesOrderStatus, locale),
                  count: entry.candidates.length,
                  suffix: getLineSuffix(locale, entry.candidates.length),
                })}
              </option>
            ))}
          </select>
        </Field>

        {selectedEntry ? (
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label={shipmentMessages.form.summary.orderStatus}
              value={formatSalesOrderStatusText(selectedEntry.salesOrderStatus, locale)}
              caption={shipmentMessages.form.summary.orderStatusCaption}
            />
            <SummaryCard
              label={shipmentMessages.form.summary.pickedQuantity}
              value={formatQuantity(sumCandidatePickedQuantity(selectedCandidates), locale)}
              caption={shipmentMessages.form.summary.pickedQuantityCaption}
            />
            <SummaryCard
              label={shipmentMessages.form.summary.shippableNow}
              value={formatQuantity(
                sumRemainingShippableQuantity(selectedCandidates),
                locale,
              )}
              caption={shipmentMessages.form.summary.shippableNowCaption}
            />
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                {shipmentMessages.form.linesTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {shipmentMessages.form.linesDescription}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink">
              {interpolateMessage(shipmentMessages.form.selectedCountTemplate, {
                count: selectedLineCount,
                suffix: getLineSuffix(locale, selectedLineCount),
              })}
            </div>
          </div>

          {selectedCandidates.map((candidate) => {
            const selection =
              selectedLineSelections[candidate.pickingTaskLineId] ??
              createDefaultSelection(candidate.remainingShippableQuantity);

            return (
              <article
                key={candidate.pickingTaskLineId}
                className="rounded-2xl border border-line bg-surface px-4 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                        {candidate.productSku}
                      </span>
                      <TaskStatusBadge status="Completed" />
                    </div>

                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                      {candidate.productName}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {interpolateMessage(shipmentMessages.form.sourceTemplate, {
                        path: formatLocationPath(candidate),
                        name: candidate.locationName,
                      })}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {interpolateMessage(shipmentMessages.form.pickingTaskTemplate, {
                        id: candidate.pickingTaskId.slice(0, 8),
                      })}
                    </p>
                    <p className="mt-2 break-all font-mono text-xs text-muted">
                      {interpolateMessage(
                        shipmentMessages.form.pickingTaskLineTemplate,
                        {
                          id: candidate.pickingTaskLineId,
                        },
                      )}
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink">
                    <input
                      type="checkbox"
                      checked={selection.selected}
                      onChange={(event) =>
                        updateLineSelection(
                          effectiveSelectedSalesOrderId,
                          candidate.pickingTaskLineId,
                          {
                            ...selection,
                            selected: event.target.checked,
                          },
                          setLineSelectionsByOrderId,
                          selectedLineSelections,
                        )
                      }
                      className="h-4 w-4 rounded border-line text-accent focus:ring-accent/20"
                    />
                    {shipmentMessages.form.includeInShipment}
                  </label>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <SummaryCard
                    label={shipmentMessages.form.metrics.pickedQuantity}
                    value={formatQuantity(candidate.pickedQuantity, locale)}
                    caption={shipmentMessages.form.captions.pickedQuantity}
                  />
                  <SummaryCard
                    label={shipmentMessages.form.metrics.alreadyShipped}
                    value={formatQuantity(candidate.completedShippedQuantity, locale)}
                    caption={shipmentMessages.form.captions.alreadyShipped}
                  />
                  <SummaryCard
                    label={shipmentMessages.form.metrics.openShipmentAssigned}
                    value={formatQuantity(candidate.openAllocatedQuantity, locale)}
                    caption={shipmentMessages.form.captions.openShipmentAssigned}
                  />
                  <SummaryCard
                    label={shipmentMessages.form.metrics.shippableNow}
                    value={formatQuantity(candidate.remainingShippableQuantity, locale)}
                    caption={shipmentMessages.form.captions.shippableNow}
                  />
                  <div className="rounded-2xl border border-line bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {shipmentMessages.form.metrics.quantityToShip}
                    </p>
                    {selection.selected ? (
                      <>
                        <input
                          type="hidden"
                          name="linePickingTaskLineId"
                          value={candidate.pickingTaskLineId}
                        />
                        <input
                          name="lineQuantityToShip"
                          type="number"
                          min="0.01"
                          max={formatInputQuantity(candidate.remainingShippableQuantity)}
                          step="0.01"
                          value={selection.quantity}
                          onChange={(event) =>
                            updateLineSelection(
                              effectiveSelectedSalesOrderId,
                              candidate.pickingTaskLineId,
                              {
                                ...selection,
                                quantity: event.target.value,
                              },
                              setLineSelectionsByOrderId,
                              selectedLineSelections,
                            )
                          }
                          className={`${inputClassName} mt-3`}
                        />
                      </>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {shipmentMessages.form.captions.selectToSet}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <StateBadge
                    label={formatLocationTypeLabel(
                      candidate.locationType,
                      messages.warehouseSetup.forms.locationTypes,
                    )}
                    tone="muted"
                  />
                  <StateBadge
                    label={
                      candidate.locationIsActive
                        ? messages.common.states.active
                        : messages.common.states.inactive
                    }
                    tone={candidate.locationIsActive ? "ok" : "muted"}
                  />
                  <StateBadge
                    label={
                      candidate.locationIsBlocked
                        ? messages.common.states.blocked
                        : messages.common.states.unblocked
                    }
                    tone={candidate.locationIsBlocked ? "danger" : "ok"}
                  />
                </div>
              </article>
            );
          })}
        </div>

        {state.error ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {state.error}
          </div>
        ) : null}

        <SubmitButton
          label={shipmentMessages.form.createSubmit}
          pendingLabel={shipmentMessages.form.pending}
          disabled={selectedLineCount === 0}
        />
      </form>
    </section>
  );
}

function buildShipmentOrderEntries(
  pickingTasks: readonly PickingTask[],
  openAllocatedQuantitiesByPickingTaskLineId: Readonly<Record<string, number>>,
  completedShippedQuantitiesByPickingTaskLineId: Readonly<Record<string, number>>,
) {
  const orderMap = new Map<string, ShipmentOrderEntry>();

  for (const pickingTask of pickingTasks) {
    if (pickingTask.status !== "Completed") {
      continue;
    }

    const candidates = pickingTask.lines
      .map((line) =>
        mapShipmentCandidate(
          pickingTask,
          line,
          openAllocatedQuantitiesByPickingTaskLineId,
          completedShippedQuantitiesByPickingTaskLineId,
        ),
      )
      .filter((candidate) => candidate.remainingShippableQuantity > 0);

    if (candidates.length === 0) {
      continue;
    }

    const existing = orderMap.get(pickingTask.salesOrderId);
    const latestCompletedAtUtc =
      pickingTask.completedAtUtc ?? pickingTask.createdAtUtc;

    if (!existing) {
      orderMap.set(pickingTask.salesOrderId, {
        salesOrderId: pickingTask.salesOrderId,
        salesOrderStatus: pickingTask.salesOrderStatus,
        latestCompletedAtUtc,
        candidates,
      });
      continue;
    }

    existing.salesOrderStatus = pickingTask.salesOrderStatus;
    existing.latestCompletedAtUtc =
      existing.latestCompletedAtUtc.localeCompare(latestCompletedAtUtc) > 0
        ? existing.latestCompletedAtUtc
        : latestCompletedAtUtc;
    existing.candidates.push(...candidates);
  }

  return [...orderMap.values()]
    .map((entry) => ({
      ...entry,
      candidates: [...entry.candidates].sort((left, right) => {
        const productOrder = left.productSku.localeCompare(right.productSku);

        if (productOrder !== 0) {
          return productOrder;
        }

        const taskOrder = left.pickingTaskId.localeCompare(right.pickingTaskId);

        if (taskOrder !== 0) {
          return taskOrder;
        }

        return left.locationCode.localeCompare(right.locationCode);
      }),
    }))
    .sort((left, right) =>
      right.latestCompletedAtUtc.localeCompare(left.latestCompletedAtUtc),
    );
}

function mapShipmentCandidate(
  pickingTask: PickingTask,
  line: PickingTask["lines"][number],
  openAllocatedQuantitiesByPickingTaskLineId: Readonly<Record<string, number>>,
  completedShippedQuantitiesByPickingTaskLineId: Readonly<Record<string, number>>,
): ShipmentCandidate {
  const openAllocatedQuantity =
    openAllocatedQuantitiesByPickingTaskLineId[line.id] ?? 0;
  const completedShippedQuantity =
    completedShippedQuantitiesByPickingTaskLineId[line.id] ?? 0;
  const remainingShippableQuantity = Math.max(
    line.pickedQuantity - completedShippedQuantity - openAllocatedQuantity,
    0,
  );

  return {
    salesOrderId: pickingTask.salesOrderId,
    salesOrderStatus: pickingTask.salesOrderStatus,
    pickingTaskId: pickingTask.id,
    pickingTaskLineId: line.id,
    productSku: line.productSku,
    productName: line.productName,
    warehouseCode: line.sourceWarehouseCode,
    zoneCode: line.sourceZoneCode,
    locationCode: line.sourceLocationCode,
    locationName: line.sourceLocationName,
    locationType: line.sourceLocationType,
    locationIsActive: line.sourceLocationIsActive,
    locationIsBlocked: line.sourceLocationIsBlocked,
    pickedQuantity: line.pickedQuantity,
    completedShippedQuantity,
    openAllocatedQuantity,
    remainingShippableQuantity,
  };
}

function mergeSelectionsWithDefaults(
  candidates: readonly ShipmentCandidate[],
  currentSelections: Record<string, LineSelection> | undefined,
) {
  const mergedSelections: Record<string, LineSelection> = {};

  for (const candidate of candidates) {
    mergedSelections[candidate.pickingTaskLineId] =
      currentSelections?.[candidate.pickingTaskLineId] ??
      createDefaultSelection(candidate.remainingShippableQuantity);
  }

  return mergedSelections;
}

function updateLineSelection(
  salesOrderId: string,
  pickingTaskLineId: string,
  selection: LineSelection,
  setSelections: Dispatch<SetStateAction<Record<string, Record<string, LineSelection>>>>,
  currentSelections: Record<string, LineSelection>,
) {
  setSelections((current) => ({
    ...current,
    [salesOrderId]: {
      ...currentSelections,
      [pickingTaskLineId]: selection,
    },
  }));
}

function createDefaultSelection(remainingShippableQuantity: number): LineSelection {
  return {
    selected: false,
    quantity: formatInputQuantity(remainingShippableQuantity),
  };
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold tracking-wide text-ink"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-sm font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{caption}</p>
    </div>
  );
}

function SubmitButton({
  label,
  pendingLabel,
  disabled,
}: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function TaskStatusBadge({ status }: { status: PickingTaskStatus }) {
  const { locale, messages } = useLocaleContext();
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
      {interpolateMessage(messages.shipments.form.completedPickingTemplate, {
        status: formatExecutionStatusLabel(status, locale),
      })}
    </span>
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

function sumCandidatePickedQuantity(candidates: readonly ShipmentCandidate[]) {
  return candidates.reduce((total, candidate) => total + candidate.pickedQuantity, 0);
}

function sumRemainingShippableQuantity(candidates: readonly ShipmentCandidate[]) {
  return candidates.reduce(
    (total, candidate) => total + candidate.remainingShippableQuantity,
    0,
  );
}

function formatLocationPath(candidate: ShipmentCandidate) {
  return `${candidate.warehouseCode} / ${candidate.zoneCode} / ${candidate.locationCode}`;
}

function formatQuantity(value: number, locale: Locale) {
  return formatLocalizedQuantity(value, locale);
}

function formatInputQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toString();
}

function formatLocationTypeLabel(
  locationType: string,
  labels: Messages["warehouseSetup"]["forms"]["locationTypes"],
) {
  return labels[locationType as keyof typeof labels] ?? locationType;
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
