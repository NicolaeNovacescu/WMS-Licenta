"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { CustomerForm } from "@/features/customers/customer-form";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type {
  CustomerWorkflowFormState,
  ManagedCustomerDetail,
} from "@/types/customer";

type CustomerDetailPageProps = {
  customer: ManagedCustomerDetail;
  actionError: string | null;
  updateAction: (
    state: CustomerWorkflowFormState,
    formData: FormData,
  ) => Promise<CustomerWorkflowFormState>;
  activateAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
};

export function CustomerDetailPage({
  customer,
  actionError,
  updateAction,
  activateAction,
  deactivateAction,
}: CustomerDetailPageProps) {
  const { messages } = useLocaleContext();
  const customerMessages = messages.customers;
  const hasReferences = customer.referencedSalesOrderCount > 0;
  const hasActiveReferences = customer.activeReferencedSalesOrderCount > 0;

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge isActive={customer.isActive} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {customer.code}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/customers"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {customerMessages.detail.backToList}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label={customerMessages.list.customerCode} value={customer.code} />
          <Metric label={customerMessages.list.customerName} value={customer.name} />
          <Metric
            label={customerMessages.list.operationalState}
            value={
              customer.isActive
                ? messages.common.states.active
                : messages.common.states.inactive
            }
          />
          <Metric label={customerMessages.list.customerId} value={customer.id} mono />
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {customerMessages.list.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {customerMessages.detail.referenceEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow label={customerMessages.list.customerId} value={customer.id} mono />
              <DetailRow label={customerMessages.list.customerCode} value={customer.code} />
              <DetailRow label={customerMessages.list.customerName} value={customer.name} />
              <DetailRow
                label={customerMessages.detail.salesEligibility}
                value={
                  customer.isActive
                    ? messages.common.states.selectable
                    : messages.common.states.notSelectableWhileInactive
                }
              />
            </div>
          </section>

          <UsageSummaryCard
            eyebrow={customerMessages.detail.usageEyebrow}
            referencedLabel={customerMessages.detail.referencedSalesOrders}
            activeReferencedLabel={customerMessages.detail.activeReferencedSalesOrders}
            summaryMessage={buildCustomerUsageSummaryMessage(
              customerMessages,
              customer.referencedSalesOrderCount,
              customer.activeReferencedSalesOrderCount,
            )}
            hasReferences={hasReferences}
            hasActiveReferences={hasActiveReferences}
            referencedOrderCount={customer.referencedSalesOrderCount}
            activeReferencedOrderCount={customer.activeReferencedSalesOrderCount}
          />

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {customerMessages.detail.accessStateEyebrow}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {buildCustomerAccessStateMessage(
                customerMessages,
                customer.referencedSalesOrderCount,
                customer.activeReferencedSalesOrderCount,
              )}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {customer.isActive ? (
                <WorkflowForm
                  action={deactivateAction}
                  customerId={customer.id}
                  redirectTo={`/customers/${customer.id}`}
                  label={customerMessages.detail.deactivate}
                  tone="muted"
                />
              ) : (
                <WorkflowForm
                  action={activateAction}
                  customerId={customer.id}
                  redirectTo={`/customers/${customer.id}`}
                  label={customerMessages.detail.activate}
                  tone="secondary"
                />
              )}
            </div>
          </section>
        </div>

        <CustomerForm
          action={updateAction}
          submitLabel={customerMessages.detail.editSubmit}
          title={customerMessages.detail.editTitle}
          description={customerMessages.detail.editDescription}
          customer={customer}
        />
      </div>
    </section>
  );
}

function UsageSummaryCard({
  eyebrow,
  referencedLabel,
  activeReferencedLabel,
  summaryMessage,
  hasReferences,
  hasActiveReferences,
  referencedOrderCount,
  activeReferencedOrderCount,
}: {
  eyebrow: string;
  referencedLabel: string;
  activeReferencedLabel: string;
  summaryMessage: string;
  hasReferences: boolean;
  hasActiveReferences: boolean;
  referencedOrderCount: number;
  activeReferencedOrderCount: number;
}) {
  const toneClass = hasActiveReferences
    ? "border-amber-300 bg-amber-50/80"
    : hasReferences
      ? "border-sky-200 bg-sky-50/80"
      : "border-emerald-200 bg-emerald-50/70";
  const eyebrowClass = hasActiveReferences
    ? "text-warning"
    : hasReferences
      ? "text-sky-700"
      : "text-emerald-700";

  return (
    <section
      className={`rounded-[28px] border p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur ${toneClass}`}
    >
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${eyebrowClass}`}>
        {eyebrow}
      </p>
      <p className="mt-3 text-sm leading-7 text-muted">{summaryMessage}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <DetailRow label={referencedLabel} value={String(referencedOrderCount)} />
        <DetailRow
          label={activeReferencedLabel}
          value={String(activeReferencedOrderCount)}
        />
      </div>
    </section>
  );
}

function WorkflowForm({
  action,
  customerId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  customerId: string;
  redirectTo: string;
  label: string;
  tone: "secondary" | "muted";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="customerId" value={customerId} />
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
  tone: "secondary" | "muted";
}) {
  const { messages } = useLocaleContext();
  const { pending } = useFormStatus();
  const toneClass =
    tone === "secondary"
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

function Metric({
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
      <p className={`mt-3 text-sm font-semibold text-ink ${mono ? "break-all font-mono" : ""}`}>
        {value}
      </p>
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

function StatusBadge({ isActive }: { isActive: boolean }) {
  const { messages } = useLocaleContext();

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-stone-100 text-stone-700"
      }`}
    >
      {isActive ? messages.common.states.active : messages.common.states.inactive}
    </span>
  );
}

function buildCustomerUsageSummaryMessage(
  customerMessages: Messages["customers"],
  referencedOrderCount: number,
  activeReferencedOrderCount: number,
) {
  const referencedWord =
    referencedOrderCount === 1
      ? customerMessages.detail.words.orderSingular
      : customerMessages.detail.words.orderPlural;
  const activeWord =
    activeReferencedOrderCount === 1
      ? customerMessages.detail.words.orderSingular
      : customerMessages.detail.words.orderPlural;

  if (activeReferencedOrderCount > 0) {
    return interpolateMessage(customerMessages.detail.templates.usageActive, {
      referencedCount: referencedOrderCount,
      referencedWord,
      activeCount: activeReferencedOrderCount,
      activeWord,
    });
  }

  if (referencedOrderCount > 0) {
    return interpolateMessage(customerMessages.detail.templates.usageHistorical, {
      referencedCount: referencedOrderCount,
      referencedWord,
    });
  }

  return customerMessages.detail.templates.usageNone;
}

function buildCustomerAccessStateMessage(
  customerMessages: Messages["customers"],
  referencedOrderCount: number,
  activeReferencedOrderCount: number,
) {
  const activeWord =
    activeReferencedOrderCount === 1
      ? customerMessages.detail.words.orderSingular
      : customerMessages.detail.words.orderPlural;

  if (activeReferencedOrderCount > 0) {
    return interpolateMessage(customerMessages.detail.templates.accessActive, {
      activeCount: activeReferencedOrderCount,
      activeWord,
    });
  }

  if (referencedOrderCount > 0) {
    return customerMessages.detail.templates.accessHistorical;
  }

  return customerMessages.detail.templates.accessNone;
}
