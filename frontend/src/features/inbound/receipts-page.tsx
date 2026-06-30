"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { ReceiptForm } from "@/features/inbound/receipt-form";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import { formatLocalizedDateTime } from "@/lib/format/locale-format";
import {
  formatInboundOrderStatusLabel,
  formatReceiptStatusLabel,
} from "@/lib/format/workflow-status";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type {
  InboundOrder,
  InboundWorkflowFormState,
  Receipt,
  ReceiptStatus,
} from "@/types/inbound";
import type { Location } from "@/types/warehouse-structure";

type ReceiptsPageProps = {
  receipts: readonly Receipt[];
  inboundOrders: readonly InboundOrder[];
  receivingLocations: readonly Location[];
  createAction: (
    state: InboundWorkflowFormState,
    formData: FormData,
  ) => Promise<InboundWorkflowFormState>;
  createDataError: string | null;
  preselectedInboundOrderId?: string | null;
};

type ReceiptStatusFilter = "all" | ReceiptStatus;

export function ReceiptsPage({
  receipts,
  inboundOrders,
  receivingLocations,
  createAction,
  createDataError,
  preselectedInboundOrderId,
}: ReceiptsPageProps) {
  const { locale, messages } = useLocaleContext();
  const receiptMessages = messages.receipts;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReceiptStatusFilter>("all");
  const deferredSearch = useDeferredValue(search);

  const filteredReceipts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...receipts]
      .filter((receipt) => {
        const matchesSearch =
          !query ||
          [
            receipt.status,
            receipt.supplierCode,
            receipt.supplierName,
            receipt.supplierInvoiceReference,
            receipt.inboundOrderStatus,
            receipt.notes,
            ...receipt.lines.map((line) => line.productSku),
            ...receipt.lines.map((line) => line.productName),
            ...receipt.lines.map((line) => line.receivingLocationCode),
          ]
            .filter((value): value is string => Boolean(value))
            .some((value) => value.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === "all" ? true : receipt.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => right.createdAtUtc.localeCompare(left.createdAtUtc));
  }, [deferredSearch, receipts, statusFilter]);

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          {receiptMessages.list.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          {receiptMessages.list.title}
        </h1>
      </header>

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.7fr]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {receiptMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={receiptMessages.list.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {receiptMessages.list.statusLabel}
            </span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ReceiptStatusFilter)
              }
              className={inputClassName}
            >
              <option value="all">{receiptMessages.list.allReceipts}</option>
              <option value="Draft">
                {formatReceiptStatusLabel("Draft", locale)}
              </option>
              <option value="InProgress">
                {formatReceiptStatusLabel("InProgress", locale)}
              </option>
              <option value="Confirmed">
                {formatReceiptStatusLabel("Confirmed", locale)}
              </option>
              <option value="Cancelled">
                {formatReceiptStatusLabel("Cancelled", locale)}
              </option>
            </select>
          </label>

          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {receiptMessages.list.resultsLabel}
            </p>
            <p className="mt-3 text-sm font-medium text-ink">
              {interpolateMessage(receiptMessages.list.resultsTemplate, {
                filtered: filteredReceipts.length,
                total: receipts.length,
              })}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4">
          {filteredReceipts.length === 0 ? (
            <EmptyState />
          ) : (
            filteredReceipts.map((receipt) => (
              <article
                key={receipt.id}
                className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                        {receipt.supplierCode}
                      </span>
                      <StatusBadge status={receipt.status} />
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                      {receipt.supplierInvoiceReference}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {interpolateMessage(receiptMessages.list.linkedInboundStatus, {
                        status: formatInboundOrderStatusLabel(
                          receipt.inboundOrderStatus,
                          locale,
                        ),
                      })}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {receipt.notes || receiptMessages.list.noNotes}
                    </p>
                  </div>

                  <Link
                    href={`/receipts/${receipt.id}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                  >
                    {receipt.status === "Confirmed"
                      ? receiptMessages.list.viewReceipt
                      : receiptMessages.list.continueReceipt}
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Metric
                    label={receiptMessages.list.metrics.lines}
                    value={String(receipt.lines.length)}
                  />
                  <Metric
                    label={receiptMessages.list.metrics.created}
                    value={formatTimestamp(receipt.createdAtUtc, locale)}
                  />
                  <Metric
                    label={receiptMessages.list.metrics.started}
                    value={
                      receipt.startedAtUtc
                        ? formatTimestamp(receipt.startedAtUtc, locale)
                        : receiptMessages.list.notStarted
                    }
                  />
                  <Metric
                    label={receiptMessages.list.metrics.confirmed}
                    value={
                      receipt.confirmedAtUtc
                        ? formatTimestamp(receipt.confirmedAtUtc, locale)
                        : receiptMessages.list.notConfirmed
                    }
                  />
                </div>
              </article>
            ))
          )}
        </section>

        <div className="space-y-6">
          {createDataError ? (
            <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm text-ink">
              {createDataError}
            </div>
          ) : null}

          <ReceiptForm
            action={createAction}
            inboundOrders={inboundOrders}
            receivingLocations={receivingLocations}
            preselectedInboundOrderId={preselectedInboundOrderId}
          />
        </div>
      </div>
    </section>
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

function EmptyState() {
  const { messages } = useLocaleContext();
  const receiptMessages = messages.receipts;

  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {receiptMessages.list.emptyEyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        {receiptMessages.list.emptyMessage}
      </p>
    </div>
  );
}

function formatTimestamp(value: string, locale: Locale) {
  return formatLocalizedDateTime(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
