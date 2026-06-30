"use client";

import Link from "next/link";

import { InboundOrderForm } from "@/features/inbound/inbound-order-form";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import { formatInboundOrderStatusLabel } from "@/lib/format/workflow-status";
import { type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { Product } from "@/types/catalog";
import type { ManagedSupplier } from "@/types/supplier";
import type {
  InboundOrder,
  InboundOrderStatus,
  InboundWorkflowFormState,
} from "@/types/inbound";

type InboundOrderDetailPageProps = {
  inboundOrder: InboundOrder;
  canManage: boolean;
  canCreateReceipt: boolean;
  products: readonly Product[];
  suppliers: readonly ManagedSupplier[];
  updateAction: (
    state: InboundWorkflowFormState,
    formData: FormData,
  ) => Promise<InboundWorkflowFormState>;
  markReadyAction: () => Promise<void>;
  cancelAction: () => Promise<void>;
  adminDataError: string | null;
  actionError: string | null;
};

export function InboundOrderDetailPage({
  inboundOrder,
  canManage,
  canCreateReceipt,
  products,
  suppliers,
  updateAction,
  markReadyAction,
  cancelAction,
  adminDataError,
  actionError,
}: InboundOrderDetailPageProps) {
  const { locale, messages } = useLocaleContext();
  const inboundMessages = messages.inboundOrders;
  const totals = summarizeOrder(inboundOrder);
  const canEditDraft = canManage && inboundOrder.status === "Draft";
  const canMarkReady =
    canManage && inboundOrder.status === "Draft" && inboundOrder.lines.length > 0;
  const canCancel =
    canManage &&
    inboundOrder.status !== "Cancelled" &&
    inboundOrder.status !== "FullyReceived" &&
    inboundOrder.lines.every((line) => line.receivedQuantity === 0);

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {inboundOrder.supplierCode}
              </span>
              <StatusBadge status={inboundOrder.status} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {inboundOrder.supplierInvoiceReference}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              {inboundOrder.notes || inboundMessages.detail.fallbackDescription}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/inbound-orders"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {inboundMessages.detail.backToList}
            </Link>
            {canCreateReceipt ? (
              <Link
                href={`/receipts?inboundOrderId=${inboundOrder.id}`}
                className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                {inboundMessages.detail.createReceipt}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            label={inboundMessages.detail.metrics.supplier}
            value={inboundOrder.supplierName}
          />
          <Metric
            label={inboundMessages.detail.metrics.expected}
            value={formatQuantity(totals.expected, locale)}
          />
          <Metric
            label={inboundMessages.detail.metrics.confirmedReceived}
            value={formatQuantity(totals.received, locale)}
          />
          <Metric
            label={inboundMessages.detail.metrics.remaining}
            value={formatQuantity(totals.remaining, locale)}
          />
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {inboundMessages.detail.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {inboundMessages.detail.linesEyebrow}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {inboundMessages.detail.linesDescription}
              </p>
            </div>

            <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
              {getLineCountLabel(inboundOrder.lines.length, inboundMessages.detail)}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {inboundOrder.lines.map((line) => (
              <article
                key={line.id}
                className="rounded-2xl border border-line bg-surface px-4 py-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {inboundMessages.detail.productLabel}
                    </p>
                    <h2 className="mt-3 text-lg font-semibold tracking-tight text-ink">
                      {line.productSku} - {line.productName}
                    </h2>
                    <p className="mt-3 break-all font-mono text-sm text-muted">
                      {line.productId}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Metric
                      label={inboundMessages.detail.expectedLabel}
                      value={formatQuantity(line.expectedQuantity, locale)}
                    />
                    <Metric
                      label={inboundMessages.detail.receivedLabel}
                      value={formatQuantity(line.receivedQuantity, locale)}
                    />
                    <Metric
                      label={inboundMessages.detail.remainingLabel}
                      value={formatQuantity(
                        Math.max(line.expectedQuantity - line.receivedQuantity, 0),
                        locale,
                      )}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {inboundMessages.detail.workflowMeaningEyebrow}
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
              <p>{inboundMessages.detail.workflowMeaning.inboundOrder}</p>
              <p>{inboundMessages.detail.workflowMeaning.confirmedReceipt}</p>
              <p>{inboundMessages.detail.workflowMeaning.putaway}</p>
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {inboundMessages.detail.summaryEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow
                label={inboundMessages.detail.supplierId}
                value={inboundOrder.supplierId}
                mono
              />
              <DetailRow
                label={inboundMessages.detail.created}
                value={formatTimestamp(inboundOrder.createdAtUtc, locale)}
              />
              <DetailRow
                label={inboundMessages.detail.updated}
                value={formatTimestamp(inboundOrder.updatedAtUtc, locale)}
              />
              <DetailRow
                label={inboundMessages.detail.cancelled}
                value={
                  inboundOrder.cancelledAtUtc
                    ? formatTimestamp(inboundOrder.cancelledAtUtc, locale)
                    : inboundMessages.detail.notCancelled
                }
              />
            </div>
          </section>

          {canManage ? (
            <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {inboundMessages.detail.adminActionsEyebrow}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {inboundMessages.detail.adminActionsDescription}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {canMarkReady ? (
                  <form action={markReadyAction}>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                    >
                      {inboundMessages.detail.markReady}
                    </button>
                  </form>
                ) : null}

                {canCancel ? (
                  <form action={cancelAction}>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-2xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-stone-200"
                    >
                      {inboundMessages.detail.cancel}
                    </button>
                  </form>
                ) : null}
              </div>
            </section>
          ) : null}

          {canManage ? (
            <>
              {adminDataError ? (
                <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm text-ink">
                  {adminDataError}
                </div>
              ) : null}

              {canEditDraft && !adminDataError ? (
                <InboundOrderForm
                  action={updateAction}
                  products={products}
                  suppliers={suppliers}
                  submitLabel={inboundMessages.detail.editSubmit}
                  title={inboundMessages.detail.editTitle}
                  description={inboundMessages.detail.editDescription}
                  inboundOrder={inboundOrder}
                />
              ) : !canEditDraft ? (
                <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    {inboundMessages.detail.draftClosedEyebrow}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {inboundMessages.detail.draftClosedDescription}
                  </p>
                </section>
              ) : null}
            </>
          ) : (
            <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {inboundMessages.detail.warehouseNextEyebrow}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                {inboundMessages.detail.warehouseNextDescription}
              </p>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}

function summarizeOrder(order: InboundOrder) {
  return order.lines.reduce(
    (summary, line) => ({
      expected: summary.expected + line.expectedQuantity,
      received: summary.received + line.receivedQuantity,
      remaining:
        summary.remaining +
        Math.max(line.expectedQuantity - line.receivedQuantity, 0),
    }),
    { expected: 0, received: 0, remaining: 0 },
  );
}

function formatQuantity(value: number, locale: Locale) {
  return formatLocalizedQuantity(value, locale);
}

function formatTimestamp(value: string, locale: Locale) {
  return formatLocalizedDateTime(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getLineCountLabel(
  count: number,
  detailMessages: Messages["inboundOrders"]["detail"],
) {
  return `${count} ${count === 1 ? detailMessages.lineSingular : detailMessages.linePlural}`;
}

function StatusBadge({ status }: { status: InboundOrderStatus }) {
  const { locale } = useLocaleContext();
  const toneClass =
    status === "Draft"
      ? "bg-stone-100 text-stone-700"
      : status === "ReadyForReceipt"
        ? "bg-sky-50 text-sky-700"
        : status === "PartiallyReceived"
          ? "bg-amber-50 text-amber-700"
          : status === "FullyReceived"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-rose-50 text-rose-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {formatInboundOrderStatusLabel(status, locale)}
    </span>
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
      <p className={`mt-3 text-sm text-ink ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}
