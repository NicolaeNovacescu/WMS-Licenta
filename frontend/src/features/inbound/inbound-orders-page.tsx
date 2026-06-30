"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { InboundOrderForm } from "@/features/inbound/inbound-order-form";
import { formatLocalizedQuantity } from "@/lib/format/locale-format";
import {
  formatInboundOrderStatusLabel,
} from "@/lib/format/workflow-status";
import type { Locale } from "@/lib/i18n/locale";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { Product } from "@/types/catalog";
import type { ManagedSupplier } from "@/types/supplier";
import type {
  InboundOrder,
  InboundOrderStatus,
  InboundWorkflowFormState,
} from "@/types/inbound";

type InboundOrdersPageProps = {
  inboundOrders: readonly InboundOrder[];
  canManage: boolean;
  products: readonly Product[];
  suppliers: readonly ManagedSupplier[];
  createAction: (
    state: InboundWorkflowFormState,
    formData: FormData,
  ) => Promise<InboundWorkflowFormState>;
  adminDataError: string | null;
};

type OrderStatusFilter = "all" | "receivable" | InboundOrderStatus;

export function InboundOrdersPage({
  inboundOrders,
  canManage,
  products,
  suppliers,
  createAction,
  adminDataError,
}: InboundOrdersPageProps) {
  const { locale, messages } = useLocaleContext();
  const inboundMessages = messages.inboundOrders;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>(
    canManage ? "all" : "receivable",
  );
  const deferredSearch = useDeferredValue(search);

  const filteredOrders = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...inboundOrders]
      .filter((order) => {
        const matchesSearch =
          !query ||
          [
            order.supplierCode,
            order.supplierName,
            order.supplierInvoiceReference,
            order.status,
            order.notes,
            ...order.lines.map((line) => line.productSku),
            ...order.lines.map((line) => line.productName),
          ]
            .filter((value): value is string => Boolean(value))
            .some((value) => value.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "receivable"
              ? isReceivable(order)
              : order.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => {
        const priority = getStatusPriority(left) - getStatusPriority(right);

        if (priority !== 0) {
          return priority;
        }

        return right.updatedAtUtc.localeCompare(left.updatedAtUtc);
      });
  }, [deferredSearch, inboundOrders, statusFilter]);

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {inboundMessages.list.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {inboundMessages.list.title}
            </h1>
          </div>

          {!canManage ? (
            <div className="rounded-3xl border border-line bg-surface px-5 py-4 text-sm leading-6 text-ink">
              {inboundMessages.list.warehouseFocus}
            </div>
          ) : null}
        </div>
      </header>

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.7fr]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {inboundMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={inboundMessages.list.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {inboundMessages.list.statusLabel}
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as OrderStatusFilter)}
              className={inputClassName}
            >
              <option value="all">{inboundMessages.list.allOrders}</option>
              <option value="receivable">{inboundMessages.list.receivableFirst}</option>
              <option value="Draft">
                {formatInboundOrderStatusLabel("Draft", locale)}
              </option>
              <option value="ReadyForReceipt">
                {formatInboundOrderStatusLabel("ReadyForReceipt", locale)}
              </option>
              <option value="PartiallyReceived">
                {formatInboundOrderStatusLabel("PartiallyReceived", locale)}
              </option>
              <option value="FullyReceived">
                {formatInboundOrderStatusLabel("FullyReceived", locale)}
              </option>
              <option value="Cancelled">
                {formatInboundOrderStatusLabel("Cancelled", locale)}
              </option>
            </select>
          </label>

          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {inboundMessages.list.resultsLabel}
            </p>
            <p className="mt-3 text-sm font-medium text-ink">
              {interpolateMessage(inboundMessages.list.resultsTemplate, {
                filtered: filteredOrders.length,
                total: inboundOrders.length,
              })}
            </p>
          </div>
        </div>
      </section>

      <div className={`grid gap-6 ${canManage ? "xl:grid-cols-[1.2fr_0.8fr]" : ""}`}>
        <section className="space-y-4">
          {filteredOrders.length === 0 ? (
            <EmptyState />
          ) : (
            filteredOrders.map((order) => {
              const totals = summarizeOrder(order);
              const receivable = isReceivable(order) && totals.remaining > 0;

              return (
                <article
                  key={order.id}
                  className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                          {order.supplierCode}
                        </span>
                        <StatusBadge status={order.status} />
                        {receivable ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {inboundMessages.list.receiptQueue}
                          </span>
                        ) : null}
                      </div>

                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                        {order.supplierInvoiceReference}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {order.supplierName}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {order.notes || inboundMessages.list.noNotes}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <Link
                        href={`/inbound-orders/${order.id}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                      >
                        {inboundMessages.list.viewDetails}
                      </Link>
                      {!canManage && receivable ? (
                        <Link
                          href={`/receipts?inboundOrderId=${order.id}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                        >
                          {inboundMessages.list.createReceipt}
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Metric
                      label={inboundMessages.list.metrics.lines}
                      value={String(order.lines.length)}
                    />
                    <Metric
                      label={inboundMessages.list.metrics.expected}
                      value={formatQuantity(totals.expected, locale)}
                    />
                    <Metric
                      label={inboundMessages.list.metrics.confirmedReceived}
                      value={formatQuantity(totals.received, locale)}
                    />
                    <Metric
                      label={inboundMessages.list.metrics.remaining}
                      value={formatQuantity(totals.remaining, locale)}
                    />
                  </div>
                </article>
              );
            })
          )}
        </section>

        {canManage ? (
          <div className="space-y-6">
            {adminDataError ? (
              <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm text-ink">
                {adminDataError}
              </div>
            ) : null}

            {!adminDataError ? (
              <InboundOrderForm
                action={createAction}
                products={products}
                suppliers={suppliers}
                submitLabel={inboundMessages.list.createSubmit}
                title={inboundMessages.list.createTitle}
                description={inboundMessages.list.createDescription}
              />
            ) : null}
          </div>
        ) : null}
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

function getStatusPriority(order: InboundOrder) {
  if (order.status === "ReadyForReceipt") {
    return 0;
  }

  if (order.status === "PartiallyReceived") {
    return 1;
  }

  if (order.status === "Draft") {
    return 2;
  }

  if (order.status === "FullyReceived") {
    return 3;
  }

  return 4;
}

function isReceivable(order: InboundOrder) {
  return order.status === "ReadyForReceipt" || order.status === "PartiallyReceived";
}

function formatQuantity(value: number, locale: Locale) {
  return formatLocalizedQuantity(value, locale);
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

function EmptyState() {
  const { messages } = useLocaleContext();
  const inboundMessages = messages.inboundOrders;

  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {inboundMessages.list.emptyEyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        {inboundMessages.list.emptyMessage}
      </p>
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
