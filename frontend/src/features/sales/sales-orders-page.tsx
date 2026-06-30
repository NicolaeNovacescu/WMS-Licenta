"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { ExportCsvButton } from "@/features/reports/export-csv-button";
import { SalesOrderForm } from "@/features/sales/sales-order-form";
import type { CsvExportColumn, CsvExportRow } from "@/lib/export/csv";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import { formatSalesOrderStatusLabel } from "@/lib/format/workflow-status";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { Product } from "@/types/catalog";
import type { ManagedCustomer } from "@/types/customer";
import type {
  SalesOrder,
  SalesOrderFormState,
  SalesOrderStatus,
} from "@/types/sales";

type SalesOrdersPageProps = {
  currentRoles: readonly string[];
  salesOrders: readonly SalesOrder[];
  customers: readonly ManagedCustomer[];
  products: readonly Product[];
  canCreate: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  createAction: (
    state: SalesOrderFormState,
    formData: FormData,
  ) => Promise<SalesOrderFormState>;
  confirmAction: (formData: FormData) => Promise<void>;
  cancelAction: (formData: FormData) => Promise<void>;
  createDataError: string | null;
  actionError: string | null;
};

type SalesOrderStatusFilter = "active" | "all" | SalesOrderStatus;

const knownSalesOrderStatuses: readonly SalesOrderStatus[] = [
  "Draft",
  "Confirmed",
  "PartiallyReserved",
  "FullyReserved",
  "Cancelled",
];

export function SalesOrdersPage({
  currentRoles,
  salesOrders,
  customers,
  products,
  canCreate,
  canConfirm,
  canCancel,
  createAction,
  confirmAction,
  cancelAction,
  createDataError,
  actionError,
}: SalesOrdersPageProps) {
  const { locale, messages } = useLocaleContext();
  const salesOrderMessages = messages.salesOrders;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<SalesOrderStatusFilter>("active");
  const deferredSearch = useDeferredValue(search);

  const filteredOrders = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...salesOrders]
      .filter((order) => {
        const matchesSearch =
          !query ||
          [
            order.id,
            order.status,
            ...order.lines.flatMap((line) => [line.productSku, line.productName]),
          ].some((value) => value.toLowerCase().includes(query));
        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "active"
              ? order.status !== "Cancelled"
              : order.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => {
        const priority =
          getStatusPriority(left.status) - getStatusPriority(right.status);

        if (priority !== 0) {
          return priority;
        }

        return right.updatedAtUtc.localeCompare(left.updatedAtUtc);
      });
  }, [deferredSearch, salesOrders, statusFilter]);

  const exportRows = useMemo(
    () =>
      filteredOrders.flatMap((salesOrder) => {
        const orderLines = salesOrder.lines.length > 0 ? salesOrder.lines : [null];

        return orderLines.map<CsvExportRow>((line) => ({
          orderId: salesOrder.id,
          status: formatSalesOrderStatusLabel(salesOrder.status, locale),
          customerCode:
            salesOrder.customerCode ?? salesOrderMessages.list.legacyUnassigned,
          customerName:
            salesOrder.customerName ?? salesOrderMessages.list.legacyUnassigned,
          customerIsActive:
            salesOrder.customerIsActive == null
              ? salesOrderMessages.list.unknownCustomerState
              : formatBooleanFlag(salesOrder.customerIsActive, messages),
          createdAtUtc: formatTimestamp(salesOrder.createdAtUtc, locale),
          updatedAtUtc: formatTimestamp(salesOrder.updatedAtUtc, locale),
          confirmedAtUtc: salesOrder.confirmedAtUtc
            ? formatTimestamp(salesOrder.confirmedAtUtc, locale)
            : "",
          cancelledAtUtc: salesOrder.cancelledAtUtc
            ? formatTimestamp(salesOrder.cancelledAtUtc, locale)
            : "",
          productSku: line?.productSku ?? "",
          productName: line?.productName ?? "",
          orderedQuantity: line == null ? "" : formatQuantity(line.orderedQuantity, locale),
          reservedQuantity:
            line == null ? "" : formatQuantity(line.reservedQuantity, locale),
          pickedQuantity:
            line == null ? "" : formatQuantity(line.pickedQuantity, locale),
          unreservedQuantity:
            line == null
              ? ""
              : formatQuantity(
                  line.orderedQuantity - line.reservedQuantity,
                  locale,
                ),
          reservationRowCount: line == null ? "" : String(line.reservations.length),
        }));
      }),
    [filteredOrders, locale, messages, salesOrderMessages.list],
  );

  const exportColumns = useMemo<readonly CsvExportColumn[]>(
    () => [
      {
        key: "orderId",
        header: salesOrderMessages.list.exportColumns.orderId,
      },
      {
        key: "status",
        header: salesOrderMessages.list.exportColumns.status,
      },
      {
        key: "customerCode",
        header: salesOrderMessages.list.exportColumns.customerCode,
      },
      {
        key: "customerName",
        header: salesOrderMessages.list.exportColumns.customerName,
      },
      {
        key: "customerIsActive",
        header: salesOrderMessages.list.exportColumns.customerIsActive,
      },
      {
        key: "createdAtUtc",
        header: salesOrderMessages.list.exportColumns.createdAtUtc,
      },
      {
        key: "updatedAtUtc",
        header: salesOrderMessages.list.exportColumns.updatedAtUtc,
      },
      {
        key: "confirmedAtUtc",
        header: salesOrderMessages.list.exportColumns.confirmedAtUtc,
      },
      {
        key: "cancelledAtUtc",
        header: salesOrderMessages.list.exportColumns.cancelledAtUtc,
      },
      {
        key: "productSku",
        header: salesOrderMessages.list.exportColumns.productSku,
      },
      {
        key: "productName",
        header: salesOrderMessages.list.exportColumns.productName,
      },
      {
        key: "orderedQuantity",
        header: salesOrderMessages.list.exportColumns.orderedQuantity,
      },
      {
        key: "reservedQuantity",
        header: salesOrderMessages.list.exportColumns.reservedQuantity,
      },
      {
        key: "pickedQuantity",
        header: salesOrderMessages.list.exportColumns.pickedQuantity,
      },
      {
        key: "unreservedQuantity",
        header: salesOrderMessages.list.exportColumns.unreservedQuantity,
      },
      {
        key: "reservationRowCount",
        header: salesOrderMessages.list.exportColumns.reservationRowCount,
      },
    ],
    [salesOrderMessages.list.exportColumns],
  );

  const showCreatePanel = canCreate || Boolean(createDataError);
  const showCreateForm = canCreate && !createDataError;

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {salesOrderMessages.list.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {salesOrderMessages.list.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentRoles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink"
              >
                {messages.roles[role as keyof typeof messages.roles] ?? role}
              </span>
            ))}
          </div>
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {salesOrderMessages.list.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.7fr]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {salesOrderMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={salesOrderMessages.list.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {salesOrderMessages.list.statusLabel}
            </span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as SalesOrderStatusFilter)
              }
              className={inputClassName}
            >
              <option value="active">
                {salesOrderMessages.list.activeOrdersFirst}
              </option>
              <option value="all">{salesOrderMessages.list.allOrders}</option>
              {knownSalesOrderStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatSalesOrderStatusLabel(status, locale)}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {salesOrderMessages.list.resultsLabel}
            </p>
            <p className="mt-3 text-sm font-medium text-ink">
              {interpolateMessage(salesOrderMessages.list.resultsTemplate, {
                filtered: filteredOrders.length,
                total: salesOrders.length,
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <ExportCsvButton
            label={salesOrderMessages.list.exportLabel}
            emptyLabel={salesOrderMessages.list.exportEmptyLabel}
            fileName="sales-orders.csv"
            columns={exportColumns}
            rows={exportRows}
          />
        </div>
      </section>

      <div
        className={`grid gap-6 ${showCreatePanel ? "xl:grid-cols-[1.08fr_0.92fr]" : ""}`}
      >
        <section className="space-y-4">
          {filteredOrders.length === 0 ? (
            <EmptyState />
          ) : (
            filteredOrders.map((salesOrder) => {
              const canRunConfirm =
                canConfirm &&
                (salesOrder.status === "Draft" ||
                  salesOrder.status === "Confirmed" ||
                  salesOrder.status === "PartiallyReserved");
              const canRunCancel = canCancel && salesOrder.status !== "Cancelled";

              return (
                <article
                  key={salesOrder.id}
                  className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                          {interpolateMessage(
                            salesOrderMessages.list.orderBadgeTemplate,
                            {
                              id: salesOrder.id.slice(0, 8),
                            },
                          )}
                        </span>
                        <StatusBadge status={salesOrder.status} />
                      </div>

                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                        {summarizeLineCount(salesOrder.lines.length, salesOrderMessages)}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {summarizeProducts(salesOrder, salesOrderMessages)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {interpolateMessage(
                          salesOrderMessages.list.customerSummaryTemplate,
                          {
                            customer: formatCustomerSummaryValue(
                              salesOrder,
                              messages,
                            ),
                          },
                        )}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {formatTimestamp(salesOrder.createdAtUtc, locale)} ·{" "}
                        {formatTimestamp(salesOrder.updatedAtUtc, locale)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <Link
                        href={`/sales-orders/${salesOrder.id}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                      >
                        {salesOrderMessages.list.viewDetails}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
                    <Metric
                      label={salesOrderMessages.list.metrics.ordered}
                      value={formatQuantity(sumOrderedQuantity(salesOrder), locale)}
                    />
                    <Metric
                      label={salesOrderMessages.list.metrics.reserved}
                      value={formatQuantity(sumReservedQuantity(salesOrder), locale)}
                    />
                    <Metric
                      label={salesOrderMessages.list.metrics.unreserved}
                      value={formatQuantity(sumRemainingQuantity(salesOrder), locale)}
                    />
                    <Metric
                      label={salesOrderMessages.list.metrics.confirmed}
                      value={
                        salesOrder.confirmedAtUtc
                          ? formatTimestamp(salesOrder.confirmedAtUtc, locale)
                          : salesOrderMessages.list.notConfirmed
                      }
                    />
                    <Metric
                      label={salesOrderMessages.list.metrics.cancelled}
                      value={
                        salesOrder.cancelledAtUtc
                          ? formatTimestamp(salesOrder.cancelledAtUtc, locale)
                          : salesOrderMessages.list.notCancelled
                      }
                    />
                  </div>

                  {canRunConfirm || canRunCancel ? (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {canRunConfirm ? (
                        <WorkflowForm
                          action={confirmAction}
                          salesOrderId={salesOrder.id}
                          redirectTo="/sales-orders"
                          label={salesOrderMessages.list.confirm}
                          tone="primary"
                        />
                      ) : null}

                      {canRunCancel ? (
                        <WorkflowForm
                          action={cancelAction}
                          salesOrderId={salesOrder.id}
                          redirectTo="/sales-orders"
                          label={salesOrderMessages.list.cancel}
                          tone="muted"
                        />
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </section>

        {showCreatePanel ? (
          <div className="space-y-6">
            {createDataError ? (
              <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm text-ink">
                {createDataError}
              </div>
            ) : null}

            {showCreateForm ? (
              <SalesOrderForm
                action={createAction}
                customers={customers}
                products={products}
                submitLabel={salesOrderMessages.list.createSubmit}
                title={salesOrderMessages.list.createTitle}
                description={salesOrderMessages.list.createDescription}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function WorkflowForm({
  action,
  salesOrderId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  salesOrderId: string;
  redirectTo: string;
  label: string;
  tone: "primary" | "muted";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="salesOrderId" value={salesOrderId} />
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
  tone: "primary" | "muted";
}) {
  const { messages } = useLocaleContext();
  const { pending } = useFormStatus();
  const toneClass =
    tone === "primary"
      ? "bg-accent text-white hover:bg-accent/90"
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

function EmptyState() {
  const { messages } = useLocaleContext();
  const salesOrderMessages = messages.salesOrders;

  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {salesOrderMessages.list.emptyEyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        {salesOrderMessages.list.emptyMessage}
      </p>
    </div>
  );
}

function getStatusPriority(status: SalesOrderStatus) {
  switch (status) {
    case "Draft":
      return 0;
    case "Confirmed":
      return 1;
    case "PartiallyReserved":
      return 2;
    case "FullyReserved":
      return 3;
    case "Cancelled":
      return 4;
  }
}

function summarizeLineCount(
  lineCount: number,
  salesOrderMessages: ReturnType<typeof useLocaleContext>["messages"]["salesOrders"],
) {
  return interpolateMessage(salesOrderMessages.list.lineCountTemplate, {
    count: lineCount,
    suffix: lineCount === 1 ? "" : "s",
  });
}

function summarizeProducts(
  salesOrder: SalesOrder,
  salesOrderMessages: ReturnType<typeof useLocaleContext>["messages"]["salesOrders"],
) {
  const preview = salesOrder.lines.slice(0, 3).map((line) => line.productSku);

  if (salesOrder.lines.length <= 3) {
    return preview.join(", ");
  }

  return interpolateMessage(salesOrderMessages.list.moreTemplate, {
    preview: preview.join(", "),
    count: salesOrder.lines.length - 3,
  });
}

function formatCustomerSummaryValue(
  salesOrder: SalesOrder,
  messages: ReturnType<typeof useLocaleContext>["messages"],
) {
  if (!salesOrder.customerId || !salesOrder.customerCode || !salesOrder.customerName) {
    return messages.salesOrders.list.legacyUnassigned;
  }

  const suffix =
    salesOrder.customerIsActive === false
      ? ` (${messages.common.states.inactive.toLowerCase()})`
      : "";

  return `${salesOrder.customerCode} - ${salesOrder.customerName}${suffix}`;
}

function sumOrderedQuantity(salesOrder: SalesOrder) {
  return salesOrder.lines.reduce((total, line) => total + line.orderedQuantity, 0);
}

function sumReservedQuantity(salesOrder: SalesOrder) {
  return salesOrder.lines.reduce((total, line) => total + line.reservedQuantity, 0);
}

function sumRemainingQuantity(salesOrder: SalesOrder) {
  return sumOrderedQuantity(salesOrder) - sumReservedQuantity(salesOrder);
}

function formatTimestamp(value: string, locale: "en" | "ro") {
  return formatLocalizedDateTime(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatQuantity(value: number, locale: "en" | "ro") {
  return formatLocalizedQuantity(value, locale);
}

function formatBooleanFlag(
  value: boolean,
  messages: ReturnType<typeof useLocaleContext>["messages"],
) {
  return value ? messages.common.yes : messages.common.no;
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
