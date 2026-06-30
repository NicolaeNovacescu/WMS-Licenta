"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { SalesOrderForm } from "@/features/sales/sales-order-form";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import { formatSalesOrderStatusLabel } from "@/lib/format/workflow-status";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Product } from "@/types/catalog";
import type { ManagedCustomer } from "@/types/customer";
import type {
  SalesOrder,
  SalesOrderFormState,
  SalesOrderLine,
  SalesOrderReservation,
  SalesOrderStatus,
} from "@/types/sales";

type SalesOrderDetailPageProps = {
  salesOrder: SalesOrder;
  customers: readonly ManagedCustomer[];
  products: readonly Product[];
  canEditDraft: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  actionError: string | null;
  editDataError: string | null;
  updateAction: (
    state: SalesOrderFormState,
    formData: FormData,
  ) => Promise<SalesOrderFormState>;
  confirmAction: (formData: FormData) => Promise<void>;
  cancelAction: (formData: FormData) => Promise<void>;
};

export function SalesOrderDetailPage({
  salesOrder,
  customers,
  products,
  canEditDraft,
  canConfirm,
  canCancel,
  actionError,
  editDataError,
  updateAction,
  confirmAction,
  cancelAction,
}: SalesOrderDetailPageProps) {
  const { locale, messages } = useLocaleContext();
  const salesOrderMessages = messages.salesOrders;
  const canRunConfirm =
    canConfirm &&
    (salesOrder.status === "Draft" ||
      salesOrder.status === "Confirmed" ||
      salesOrder.status === "PartiallyReserved");
  const canRunCancel = canCancel && salesOrder.status !== "Cancelled";
  const totalOrdered = sumOrderedQuantity(salesOrder);
  const totalReserved = sumReservedQuantity(salesOrder);

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {salesOrderMessages.detail.headerBadge}
              </span>
              <StatusBadge status={salesOrder.status} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {interpolateMessage(salesOrderMessages.detail.titleTemplate, {
                id: salesOrder.id.slice(0, 8),
              })}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              {salesOrderMessages.detail.description}
            </p>
          </div>

          <Link
            href="/sales-orders"
            className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            {salesOrderMessages.detail.backToList}
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric
            label={salesOrderMessages.detail.metrics.lines}
            value={String(salesOrder.lines.length)}
          />
          <Metric
            label={salesOrderMessages.detail.metrics.customer}
            value={formatCustomerMetric(salesOrder, messages)}
          />
          <Metric
            label={salesOrderMessages.detail.metrics.ordered}
            value={formatQuantity(totalOrdered, locale)}
          />
          <Metric
            label={salesOrderMessages.detail.metrics.reserved}
            value={formatQuantity(totalReserved, locale)}
          />
          <Metric
            label={salesOrderMessages.detail.metrics.confirmed}
            value={
              salesOrder.confirmedAtUtc
                ? formatTimestamp(salesOrder.confirmedAtUtc, locale)
                : salesOrderMessages.detail.notConfirmed
            }
          />
          <Metric
            label={salesOrderMessages.detail.metrics.cancelled}
            value={
              salesOrder.cancelledAtUtc
                ? formatTimestamp(salesOrder.cancelledAtUtc, locale)
                : salesOrderMessages.detail.notCancelled
            }
          />
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {salesOrderMessages.detail.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {salesOrderMessages.detail.workflowActionsEyebrow}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {salesOrderMessages.detail.workflowActionsDescription}
            </p>

            {canRunConfirm || canRunCancel ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {canRunConfirm ? (
                  <WorkflowForm
                    action={confirmAction}
                    salesOrderId={salesOrder.id}
                    redirectTo={`/sales-orders/${salesOrder.id}`}
                    label={salesOrderMessages.detail.confirm}
                    tone="primary"
                  />
                ) : null}

                {canRunCancel ? (
                  <WorkflowForm
                    action={cancelAction}
                    salesOrderId={salesOrder.id}
                    redirectTo={`/sales-orders/${salesOrder.id}`}
                    label={salesOrderMessages.detail.cancel}
                    tone="muted"
                  />
                ) : null}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-muted">
                {salesOrderMessages.detail.noFurtherAction}
              </p>
            )}
          </section>

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {salesOrderMessages.detail.summaryEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow
                label={salesOrderMessages.detail.salesOrderId}
                value={salesOrder.id}
                mono
              />
              <DetailRow
                label={salesOrderMessages.detail.customer}
                value={formatCustomerDetail(salesOrder, messages)}
              />
              <DetailRow
                label={salesOrderMessages.detail.updated}
                value={formatTimestamp(salesOrder.updatedAtUtc, locale)}
              />
              <DetailRow
                label={salesOrderMessages.detail.unreservedQuantity}
                value={formatQuantity(totalOrdered - totalReserved, locale)}
              />
            </div>
          </section>

          {canEditDraft || editDataError ? (
            <>
              {editDataError ? (
                <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm text-ink">
                  {editDataError}
                </div>
              ) : null}

              {canEditDraft ? (
                <SalesOrderForm
                  action={updateAction}
                  customers={customers}
                  products={products}
                  submitLabel={salesOrderMessages.detail.editSubmit}
                  title={salesOrderMessages.detail.editTitle}
                  description={salesOrderMessages.detail.editDescription}
                  salesOrder={salesOrder}
                />
              ) : null}
            </>
          ) : null}
        </div>

        <section className="space-y-4">
          {salesOrder.lines.map((line) => (
            <LineCard key={line.id} line={line} />
          ))}
        </section>
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

function LineCard({ line }: { line: SalesOrderLine }) {
  const { locale, messages } = useLocaleContext();
  const salesOrderMessages = messages.salesOrders;

  return (
    <article className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          {line.productSku}
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {line.productName}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Metric
          label={salesOrderMessages.detail.lineMetrics.ordered}
          value={formatQuantity(line.orderedQuantity, locale)}
        />
        <Metric
          label={salesOrderMessages.detail.lineMetrics.reserved}
          value={formatQuantity(line.reservedQuantity, locale)}
        />
        <Metric
          label={salesOrderMessages.detail.lineMetrics.unreserved}
          value={formatQuantity(
            line.orderedQuantity - line.reservedQuantity,
            locale,
          )}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {salesOrderMessages.detail.reservationDetailEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          {salesOrderMessages.detail.reservationDetailDescription}
        </p>

        {line.reservations.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            {salesOrderMessages.detail.noReservationRows}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {line.reservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function ReservationCard({
  reservation,
}: {
  reservation: SalesOrderReservation;
}) {
  const { locale, messages } = useLocaleContext();
  const salesOrderMessages = messages.salesOrders;

  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink">
          {formatLocationTypeLabel(
            reservation.locationType,
            messages.warehouseSetup.forms.locationTypes,
          )}
        </span>
        <StateBadge
          label={
            reservation.locationIsActive
              ? messages.common.states.active
              : messages.common.states.inactive
          }
          tone={reservation.locationIsActive ? "ok" : "muted"}
        />
        <StateBadge
          label={
            reservation.locationIsBlocked
              ? messages.common.states.blocked
              : messages.common.states.unblocked
          }
          tone={reservation.locationIsBlocked ? "danger" : "ok"}
        />
      </div>

      <p className="mt-4 text-sm font-semibold text-ink">
        {reservation.warehouseCode} / {reservation.zoneCode} /{" "}
        {reservation.locationCode} - {reservation.locationName}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">
        {interpolateMessage(
          salesOrderMessages.detail.reservedQuantityTemplate,
          {
            quantity: formatQuantity(reservation.quantity, locale),
          },
        )}
      </p>
      <p className="mt-2 break-all font-mono text-xs text-muted">
        {interpolateMessage(salesOrderMessages.detail.balanceRowTemplate, {
          id: reservation.inventoryBalanceId,
        })}
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

function sumOrderedQuantity(salesOrder: SalesOrder) {
  return salesOrder.lines.reduce((total, line) => total + line.orderedQuantity, 0);
}

function sumReservedQuantity(salesOrder: SalesOrder) {
  return salesOrder.lines.reduce((total, line) => total + line.reservedQuantity, 0);
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

function formatCustomerMetric(
  salesOrder: SalesOrder,
  messages: Messages,
) {
  return salesOrder.customerCode ?? messages.salesOrders.list.legacyUnassigned;
}

function formatCustomerDetail(
  salesOrder: SalesOrder,
  messages: Messages,
) {
  if (!salesOrder.customerId || !salesOrder.customerCode || !salesOrder.customerName) {
    return messages.salesOrders.detail.legacyWithoutCustomer;
  }

  const suffix =
    salesOrder.customerIsActive === false
      ? ` (${messages.common.states.inactive.toLowerCase()})`
      : "";

  return `${salesOrder.customerCode} - ${salesOrder.customerName}${suffix}`;
}

function formatLocationTypeLabel(
  locationType: string,
  labels: Messages["warehouseSetup"]["forms"]["locationTypes"],
) {
  return labels[locationType as keyof typeof labels] ?? locationType;
}
