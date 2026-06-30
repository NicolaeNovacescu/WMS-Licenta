"use client";

import Link from "next/link";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import {
  formatInboundOrderStatusLabel,
  formatReceiptStatusLabel,
} from "@/lib/format/workflow-status";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type {
  InboundOrder,
  Receipt,
  ReceiptLine,
  ReceiptStatus,
} from "@/types/inbound";

type ReceiptDetailPageProps = {
  receipt: Receipt;
  inboundOrder: InboundOrder | null;
  startAction: () => Promise<void>;
  confirmAction: () => Promise<void>;
  cancelAction: () => Promise<void>;
  actionError: string | null;
};

export function ReceiptDetailPage({
  receipt,
  inboundOrder,
  startAction,
  confirmAction,
  cancelAction,
  actionError,
}: ReceiptDetailPageProps) {
  const { locale, messages } = useLocaleContext();
  const receiptMessages = messages.receipts;
  const inboundLines = new Map(
    (inboundOrder?.lines ?? []).map((line) => [line.id, line]),
  );
  const canStart = receipt.status === "Draft";
  const canConfirm = receipt.status === "InProgress";
  const canCancel = receipt.status === "Draft" || receipt.status === "InProgress";

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {receipt.supplierCode}
              </span>
              <StatusBadge status={receipt.status} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {interpolateMessage(receiptMessages.detail.title, {
                reference: receipt.supplierInvoiceReference,
              })}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              {receiptMessages.detail.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/receipts"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {receiptMessages.detail.backToList}
            </Link>
            <Link
              href={`/inbound-orders/${receipt.inboundOrderId}`}
              className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
            >
              {receiptMessages.detail.openInboundOrder}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            label={receiptMessages.detail.metrics.inboundOrderStatus}
            value={formatInboundOrderStatusLabel(receipt.inboundOrderStatus, locale)}
          />
          <Metric
            label={receiptMessages.detail.metrics.created}
            value={formatTimestamp(receipt.createdAtUtc, locale)}
          />
          <Metric
            label={receiptMessages.detail.metrics.started}
            value={
              receipt.startedAtUtc
                ? formatTimestamp(receipt.startedAtUtc, locale)
                : receiptMessages.detail.notStarted
            }
          />
          <Metric
            label={receiptMessages.detail.metrics.confirmed}
            value={
              receipt.confirmedAtUtc
                ? formatTimestamp(receipt.confirmedAtUtc, locale)
                : receiptMessages.detail.notConfirmed
            }
          />
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {receiptMessages.detail.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {receiptMessages.detail.workflowActionsEyebrow}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {receiptMessages.detail.workflowActionsDescription}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {canStart ? (
                <form action={startAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                  >
                    {receiptMessages.detail.start}
                  </button>
                </form>
              ) : null}

              {canConfirm ? (
                <form action={confirmAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                  >
                    {receiptMessages.detail.confirm}
                  </button>
                </form>
              ) : null}

              {canCancel ? (
                <form action={cancelAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-stone-200"
                  >
                    {receiptMessages.detail.cancel}
                  </button>
                </form>
              ) : null}
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {receiptMessages.detail.summaryEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow label={receiptMessages.detail.receiptId} value={receipt.id} mono />
              <DetailRow
                label={receiptMessages.detail.inboundOrderId}
                value={receipt.inboundOrderId}
                mono
              />
              <DetailRow
                label={receiptMessages.detail.supplier}
                value={receipt.supplierName}
              />
              <DetailRow
                label={receiptMessages.detail.cancelled}
                value={
                  receipt.cancelledAtUtc
                    ? formatTimestamp(receipt.cancelledAtUtc, locale)
                    : receiptMessages.detail.notCancelled
                }
              />
            </div>
          </section>

          {receipt.notes ? (
            <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {receiptMessages.detail.notesEyebrow}
              </p>
              <p className="mt-4 text-sm leading-7 text-ink">{receipt.notes}</p>
            </section>
          ) : null}
        </div>

        <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {receiptMessages.detail.linesEyebrow}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {receiptMessages.detail.linesDescription}
              </p>
            </div>

            <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
              {getLineCountLabel(receipt.lines.length, receiptMessages.detail)}
            </span>
          </div>

          {!inboundOrder ? (
            <div className="mt-5 rounded-2xl border border-amber-300 bg-warning-soft px-4 py-4 text-sm text-ink">
              {receiptMessages.detail.linkedInboundUnavailable}
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
            {receipt.lines.map((line) => (
              <ReceiptLineCard
                key={line.id}
                line={line}
                inboundOrderLine={inboundLines.get(line.inboundOrderLineId) ?? null}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function ReceiptLineCard({
  line,
  inboundOrderLine,
}: {
  line: ReceiptLine;
  inboundOrderLine:
    | InboundOrder["lines"][number]
    | null;
}) {
  const { locale, messages } = useLocaleContext();
  const receiptMessages = messages.receipts;
  const expectedQuantity = inboundOrderLine?.expectedQuantity ?? 0;
  const confirmedReceivedQuantity = inboundOrderLine?.receivedQuantity ?? 0;
  const remainingQuantity = inboundOrderLine
    ? Math.max(expectedQuantity - confirmedReceivedQuantity, 0)
    : null;

  return (
    <article className="rounded-2xl border border-line bg-surface px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {receiptMessages.detail.productLabel}
          </p>
          <h2 className="mt-3 text-lg font-semibold tracking-tight text-ink">
            {line.productSku} - {line.productName}
          </h2>
          <p className="mt-3 break-all font-mono text-sm text-muted">
            {interpolateMessage(receiptMessages.detail.inboundOrderLine, {
              id: line.inboundOrderLineId,
            })}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {receiptMessages.detail.quantitiesEyebrow}
          </p>
          <p className="mt-3 text-sm text-ink">
            {receiptMessages.detail.thisReceipt}:{" "}
            <strong>{formatQuantity(line.quantity, locale)}</strong>
          </p>
          <p className="mt-2 text-sm text-muted">
            {receiptMessages.detail.expected}: {formatQuantity(expectedQuantity, locale)}
          </p>
          <p className="mt-2 text-sm text-muted">
            {receiptMessages.detail.confirmedReceivedOnOrder}:{" "}
            {formatQuantity(confirmedReceivedQuantity, locale)}
          </p>
          <p className="mt-2 text-sm text-muted">
            {receiptMessages.detail.remaining}:{" "}
            {remainingQuantity === null
              ? receiptMessages.detail.unavailable
              : formatQuantity(remainingQuantity, locale)}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {receiptMessages.detail.receivingLocationEyebrow}
          </p>
          <p className="mt-3 text-sm font-semibold text-ink">
            {line.receivingLocationCode}
          </p>
          <p className="mt-2 text-sm text-muted">
            {line.receivingWarehouseCode} / {line.receivingZoneCode}
          </p>
          <p className="mt-2 text-sm text-muted">{line.receivingLocationName}</p>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: ReceiptStatus }) {
  const { locale } = useLocaleContext();
  const toneClass =
    status === "Draft"
      ? "bg-stone-100 text-stone-700"
      : status === "InProgress"
        ? "bg-sky-50 text-sky-700"
        : status === "Confirmed"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {formatReceiptStatusLabel(status, locale)}
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
  detailMessages: Messages["receipts"]["detail"],
) {
  return `${count} ${count === 1 ? detailMessages.lineSingular : detailMessages.linePlural}`;
}
