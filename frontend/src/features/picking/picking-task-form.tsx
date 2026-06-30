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
import { formatLocalizedQuantity } from "@/lib/format/locale-format";
import { formatSalesOrderStatusLabel } from "@/lib/format/workflow-status";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { PickingWorkflowFormState } from "@/types/picking";
import type { SalesOrder, SalesOrderReservation, SalesOrderStatus } from "@/types/sales";

const initialState: PickingWorkflowFormState = {
  error: null,
  successMessage: null,
};

type PickingTaskFormProps = {
  action: (
    state: PickingWorkflowFormState,
    formData: FormData,
  ) => Promise<PickingWorkflowFormState>;
  salesOrders: readonly SalesOrder[];
  openAllocatedQuantitiesByReservationId: Readonly<Record<string, number>>;
};

type ReservationCandidate = {
  salesOrderReservationId: string;
  productSku: string;
  productName: string;
  reservationQuantity: number;
  reservationPickedQuantity: number;
  sourceLocationId: string;
  warehouseCode: string;
  zoneCode: string;
  locationCode: string;
  locationName: string;
  locationType: string;
  locationIsActive: boolean;
  locationIsBlocked: boolean;
  openAllocatedQuantity: number;
  remainingPickableQuantity: number;
};

type LineSelection = {
  selected: boolean;
  quantity: string;
};

export function PickingTaskForm({
  action,
  salesOrders,
  openAllocatedQuantitiesByReservationId,
}: PickingTaskFormProps) {
  const { locale, messages } = useLocaleContext();
  const pickingMessages = messages.pickingTasks;
  const [state, formAction] = useActionState(action, initialState);
  const candidateSalesOrders = useMemo(
    () =>
      salesOrders
        .map((salesOrder) => ({
          salesOrder,
          candidates: buildReservationCandidates(
            salesOrder,
            openAllocatedQuantitiesByReservationId,
          ),
        }))
        .filter((entry) => entry.candidates.length > 0)
        .sort((left, right) =>
          right.salesOrder.updatedAtUtc.localeCompare(left.salesOrder.updatedAtUtc),
        ),
    [openAllocatedQuantitiesByReservationId, salesOrders],
  );
  const [selectedSalesOrderId, setSelectedSalesOrderId] = useState(
    candidateSalesOrders[0]?.salesOrder.id ?? "",
  );
  const [lineSelectionsByOrderId, setLineSelectionsByOrderId] = useState<
    Record<string, Record<string, LineSelection>>
  >({});
  const effectiveSelectedSalesOrderId = useMemo(
    () =>
      candidateSalesOrders.some((entry) => entry.salesOrder.id === selectedSalesOrderId)
        ? selectedSalesOrderId
        : (candidateSalesOrders[0]?.salesOrder.id ?? ""),
    [candidateSalesOrders, selectedSalesOrderId],
  );
  const selectedEntry =
    candidateSalesOrders.find(
      (entry) => entry.salesOrder.id === effectiveSelectedSalesOrderId,
    ) ?? null;
  const selectedCandidates = selectedEntry?.candidates ?? [];
  const selectedLineSelections = mergeSelectionsWithDefaults(
    selectedCandidates,
    lineSelectionsByOrderId[effectiveSelectedSalesOrderId],
  );
  const selectedLineCount = selectedCandidates.filter(
    (candidate) =>
      selectedLineSelections[candidate.salesOrderReservationId]?.selected,
  ).length;

  if (candidateSalesOrders.length === 0) {
    return (
      <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {pickingMessages.form.emptyEyebrow}
        </p>
        <p className="mt-4 text-sm leading-7 text-muted">
          {pickingMessages.form.emptyMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {pickingMessages.form.eyebrow}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
          {pickingMessages.form.meaningEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">
          {pickingMessages.form.meaningDescription}
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <Field
          label={pickingMessages.form.salesOrderLabel}
          htmlFor="salesOrderId"
        >
          <select
            id="salesOrderId"
            name="salesOrderId"
            value={effectiveSelectedSalesOrderId}
            onChange={(event) => setSelectedSalesOrderId(event.target.value)}
            className={inputClassName}
          >
            {candidateSalesOrders.map((entry) => (
              <option key={entry.salesOrder.id} value={entry.salesOrder.id}>
                {interpolateMessage(pickingMessages.form.salesOrderOptionTemplate, {
                  id: entry.salesOrder.id.slice(0, 8),
                  status: formatSalesOrderStatusLabel(
                    entry.salesOrder.status,
                    locale,
                  ),
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
              label={pickingMessages.form.summary.orderStatus}
              value={formatSalesOrderStatusLabel(
                selectedEntry.salesOrder.status,
                locale,
              )}
              caption={pickingMessages.form.summary.orderStatusCaption}
            />
            <SummaryCard
              label={pickingMessages.form.summary.currentReservedQuantity}
              value={formatQuantity(
                selectedEntry.salesOrder.lines.reduce(
                  (total, line) => total + line.reservedQuantity,
                  0,
                ),
                locale,
              )}
              caption={pickingMessages.form.summary.currentReservedQuantityCaption}
            />
            <SummaryCard
              label={pickingMessages.form.summary.alreadyPickedQuantity}
              value={formatQuantity(
                selectedEntry.salesOrder.lines.reduce(
                  (total, line) => total + line.pickedQuantity,
                  0,
                ),
                locale,
              )}
              caption={pickingMessages.form.summary.alreadyPickedQuantityCaption}
            />
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                {pickingMessages.form.linesTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {pickingMessages.form.linesDescription}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink">
              {interpolateMessage(pickingMessages.form.selectedCountTemplate, {
                count: selectedLineCount,
                suffix: getLineSuffix(locale, selectedLineCount),
              })}
            </div>
          </div>

          {selectedCandidates.map((candidate) => {
            const selection =
              selectedLineSelections[candidate.salesOrderReservationId] ??
              createDefaultSelection(candidate.remainingPickableQuantity);

            return (
              <article
                key={candidate.salesOrderReservationId}
                className="rounded-2xl border border-line bg-surface px-4 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                        {candidate.productSku}
                      </span>
                      <StatusBadge status={selectedEntry?.salesOrder.status ?? "Confirmed"} />
                    </div>

                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                      {candidate.productName}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {interpolateMessage(pickingMessages.form.sourceTemplate, {
                        path: formatLocationPath(candidate),
                        name: candidate.locationName,
                      })}
                    </p>
                    <p className="mt-2 break-all font-mono text-xs text-muted">
                      {interpolateMessage(
                        pickingMessages.form.reservationTemplate,
                        {
                          id: candidate.salesOrderReservationId,
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
                          candidate.salesOrderReservationId,
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
                    {pickingMessages.form.includeInTask}
                  </label>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <SummaryCard
                    label={pickingMessages.form.metrics.reservationQuantity}
                    value={formatQuantity(candidate.reservationQuantity, locale)}
                    caption={pickingMessages.form.captions.reservationQuantity}
                  />
                  <SummaryCard
                    label={pickingMessages.form.metrics.alreadyPicked}
                    value={formatQuantity(candidate.reservationPickedQuantity, locale)}
                    caption={pickingMessages.form.captions.alreadyPicked}
                  />
                  <SummaryCard
                    label={pickingMessages.form.metrics.openTaskAssigned}
                    value={formatQuantity(candidate.openAllocatedQuantity, locale)}
                    caption={pickingMessages.form.captions.openTaskAssigned}
                  />
                  <SummaryCard
                    label={pickingMessages.form.metrics.pickableNow}
                    value={formatQuantity(candidate.remainingPickableQuantity, locale)}
                    caption={pickingMessages.form.captions.pickableNow}
                  />
                  <div className="rounded-2xl border border-line bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {pickingMessages.form.metrics.quantityToPick}
                    </p>
                    {selection.selected ? (
                      <>
                        <input
                          type="hidden"
                          name="lineReservationId"
                          value={candidate.salesOrderReservationId}
                        />
                        <input
                          name="lineQuantityToPick"
                          type="number"
                          min="0.01"
                          max={formatInputQuantity(candidate.remainingPickableQuantity)}
                          step="0.01"
                          value={selection.quantity}
                          onChange={(event) =>
                            updateLineSelection(
                              effectiveSelectedSalesOrderId,
                              candidate.salesOrderReservationId,
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
                        {pickingMessages.form.captions.selectToSet}
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
          label={pickingMessages.form.createSubmit}
          pendingLabel={pickingMessages.form.pending}
          disabled={selectedLineCount === 0}
        />
      </form>
    </section>
  );
}

function buildReservationCandidates(
  salesOrder: SalesOrder,
  openAllocatedQuantitiesByReservationId: Readonly<Record<string, number>>,
) {
  return salesOrder.lines
    .flatMap((line) =>
      line.reservations.map((reservation) =>
        mapReservationCandidate(line, reservation, openAllocatedQuantitiesByReservationId),
      ),
    )
    .filter((candidate) => candidate.remainingPickableQuantity > 0)
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
}

function mapReservationCandidate(
  line: SalesOrder["lines"][number],
  reservation: SalesOrderReservation,
  openAllocatedQuantitiesByReservationId: Readonly<Record<string, number>>,
): ReservationCandidate {
  const openAllocatedQuantity =
    openAllocatedQuantitiesByReservationId[reservation.id] ?? 0;
  const remainingPickableQuantity = Math.max(
    reservation.quantity - openAllocatedQuantity,
    0,
  );

  return {
    salesOrderReservationId: reservation.id,
    productSku: line.productSku,
    productName: line.productName,
    reservationQuantity: reservation.quantity,
    reservationPickedQuantity: reservation.pickedQuantity,
    sourceLocationId: reservation.locationId,
    warehouseCode: reservation.warehouseCode,
    zoneCode: reservation.zoneCode,
    locationCode: reservation.locationCode,
    locationName: reservation.locationName,
    locationType: reservation.locationType,
    locationIsActive: reservation.locationIsActive,
    locationIsBlocked: reservation.locationIsBlocked,
    openAllocatedQuantity,
    remainingPickableQuantity,
  };
}

function mergeSelectionsWithDefaults(
  candidates: readonly ReservationCandidate[],
  currentSelections: Record<string, LineSelection> | undefined,
) {
  const mergedSelections: Record<string, LineSelection> = {};

  for (const candidate of candidates) {
    mergedSelections[candidate.salesOrderReservationId] =
      currentSelections?.[candidate.salesOrderReservationId] ??
      createDefaultSelection(candidate.remainingPickableQuantity);
  }

  return mergedSelections;
}

function updateLineSelection(
  salesOrderId: string,
  reservationId: string,
  selection: LineSelection,
  setSelections: Dispatch<SetStateAction<Record<string, Record<string, LineSelection>>>>,
  currentSelections: Record<string, LineSelection>,
) {
  setSelections((current) => ({
    ...current,
    [salesOrderId]: {
      ...currentSelections,
      [reservationId]: selection,
    },
  }));
}

function createDefaultSelection(remainingPickableQuantity: number): LineSelection {
  return {
    selected: false,
    quantity: formatInputQuantity(remainingPickableQuantity),
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

function StatusBadge({ status }: { status: SalesOrderStatus }) {
  const { locale } = useLocaleContext();
  const toneClass =
    status === "Draft"
      ? "bg-stone-100 text-stone-700"
      : status === "Confirmed"
        ? "bg-sky-50 text-sky-700"
        : status === "PartiallyReserved"
          ? "bg-amber-50 text-amber-700"
          : status === "FullyReserved"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-rose-50 text-rose-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {formatSalesOrderStatusLabel(status, locale)}
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

function formatLocationPath(candidate: ReservationCandidate) {
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

function getLineSuffix(locale: Locale, count: number) {
  if (count === 1) {
    return "";
  }

  return locale === "ro" ? "i" : "s";
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
