"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { formatLocalizedQuantity } from "@/lib/format/locale-format";
import { formatInboundOrderStatusLabel } from "@/lib/format/workflow-status";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { Location } from "@/types/warehouse-structure";
import type {
  InboundOrder,
  InboundWorkflowFormState,
} from "@/types/inbound";

const initialState: InboundWorkflowFormState = {
  error: null,
  successMessage: null,
};

type ReceiptFormProps = {
  action: (
    state: InboundWorkflowFormState,
    formData: FormData,
  ) => Promise<InboundWorkflowFormState>;
  inboundOrders: readonly InboundOrder[];
  receivingLocations: readonly Location[];
  preselectedInboundOrderId?: string | null;
};

export function ReceiptForm({
  action,
  inboundOrders,
  receivingLocations,
  preselectedInboundOrderId,
}: ReceiptFormProps) {
  const { locale, messages } = useLocaleContext();
  const receiptMessages = messages.receipts;
  const [state, formAction] = useActionState(action, initialState);
  const receivableOrders = useMemo(
    () => inboundOrders.filter((order) => isReceivable(order) && getRemainingTotal(order) > 0),
    [inboundOrders],
  );
  const [selectedInboundOrderId, setSelectedInboundOrderId] = useState(() => {
    const requestedOrder = receivableOrders.find(
      (order) => order.id === preselectedInboundOrderId,
    );

    return requestedOrder?.id ?? receivableOrders[0]?.id ?? "";
  });

  const selectedOrder =
    receivableOrders.find((order) => order.id === selectedInboundOrderId) ?? null;
  const receivableLines = (selectedOrder?.lines ?? [])
    .map((line) => ({
      ...line,
      remainingQuantity: Math.max(line.expectedQuantity - line.receivedQuantity, 0),
    }))
    .filter((line) => line.remainingQuantity > 0);

  if (receivableOrders.length === 0) {
    return (
      <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {receiptMessages.form.emptyEyebrow}
        </p>
        <p className="mt-4 text-sm leading-7 text-muted">
          {receiptMessages.form.emptyMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {receiptMessages.form.eyebrow}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
          {receiptMessages.form.receivingRuleEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">
          {receiptMessages.form.receivingRuleDescription}
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <Field label={receiptMessages.form.inboundOrderLabel} htmlFor="inboundOrderId">
          <select
            id="inboundOrderId"
            name="inboundOrderId"
            value={selectedInboundOrderId}
            onChange={(event) => setSelectedInboundOrderId(event.target.value)}
            className={inputClassName}
          >
            {receivableOrders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.supplierInvoiceReference} - {order.supplierCode} -{" "}
                {formatInboundOrderStatusLabel(order.status, locale)}
              </option>
            ))}
          </select>
        </Field>

        {selectedOrder ? (
          <div className="rounded-2xl border border-line bg-surface px-4 py-4 text-sm text-ink">
            <p className="font-semibold">
              {selectedOrder.supplierCode} - {selectedOrder.supplierName}
            </p>
            <p className="mt-2 text-muted">
              {interpolateMessage(receiptMessages.form.selectedOrderSummary, {
                orderId: selectedOrder.id,
                status: formatInboundOrderStatusLabel(selectedOrder.status, locale),
                remaining: formatDisplayQuantity(
                  getRemainingTotal(selectedOrder),
                  locale,
                ),
              })}
            </p>
          </div>
        ) : null}

        <Field label={receiptMessages.form.notesLabel} htmlFor="notes">
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className={`${inputClassName} min-h-28 resize-y`}
            placeholder={receiptMessages.form.notesPlaceholder}
          />
        </Field>

        {receivingLocations.length === 0 ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {receiptMessages.form.noReceivingLocations}
          </div>
        ) : null}

        {selectedOrder ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                {receiptMessages.form.linesTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {receiptMessages.form.linesDescription}
              </p>
            </div>

            <div key={selectedOrder.id} className="space-y-4">
              {receivableLines.map((line) => (
                <div
                  key={line.id}
                  className="rounded-2xl border border-line bg-surface px-4 py-4"
                >
                  <input
                    type="hidden"
                    name="lineInboundOrderLineId"
                    value={line.id}
                  />

                  <div className="grid gap-4 xl:grid-cols-[1fr_0.7fr_0.7fr_0.9fr]">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        {receiptMessages.form.productLabel}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-ink">
                        {line.productSku} - {line.productName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        {receiptMessages.form.orderQuantitiesLabel}
                      </p>
                      <p className="mt-3 text-sm text-ink">
                        {receiptMessages.form.expected}{" "}
                        {formatDisplayQuantity(line.expectedQuantity, locale)}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {receiptMessages.form.confirmed}{" "}
                        {formatDisplayQuantity(line.receivedQuantity, locale)}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {receiptMessages.form.remaining}{" "}
                        {formatDisplayQuantity(line.remainingQuantity, locale)}
                      </p>
                    </div>

                    <Field
                      label={receiptMessages.form.receivingLocationLabel}
                      htmlFor={`receivingLocation-${line.id}`}
                    >
                      <select
                        id={`receivingLocation-${line.id}`}
                        name="lineReceivingLocationId"
                        defaultValue={receivingLocations[0]?.id ?? ""}
                        className={inputClassName}
                      >
                        {receivingLocations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {formatLocationLabel(location)}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label={receiptMessages.form.receiptQuantityLabel}
                      htmlFor={`line-quantity-${line.id}`}
                    >
                      <input
                        id={`line-quantity-${line.id}`}
                        name="lineQuantity"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={formatInputQuantity(line.remainingQuantity)}
                        className={inputClassName}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {state.error ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {state.error}
          </div>
        ) : null}

        <SubmitButton
          label={receiptMessages.form.createSubmit}
          pendingLabel={receiptMessages.form.pending}
          disabled={receivingLocations.length === 0 || !selectedOrder}
        />
      </form>
    </section>
  );
}

function isReceivable(order: InboundOrder) {
  return order.status === "ReadyForReceipt" || order.status === "PartiallyReceived";
}

function getRemainingTotal(order: InboundOrder) {
  return order.lines.reduce(
    (total, line) => total + Math.max(line.expectedQuantity - line.receivedQuantity, 0),
    0,
  );
}

function formatLocationLabel(location: Location) {
  return `${location.warehouseCode} / ${location.zoneCode} / ${location.code} - ${location.name}`;
}

function formatInputQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, "");
}

function formatDisplayQuantity(value: number, locale: Locale) {
  return formatLocalizedQuantity(value, locale);
}

type FieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

function Field({ label, htmlFor, children }: FieldProps) {
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

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
