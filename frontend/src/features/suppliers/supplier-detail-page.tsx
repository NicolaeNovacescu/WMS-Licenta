"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { SupplierForm } from "@/features/suppliers/supplier-form";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type {
  ManagedSupplierDetail,
  SupplierWorkflowFormState,
} from "@/types/supplier";

type SupplierDetailPageProps = {
  supplier: ManagedSupplierDetail;
  actionError: string | null;
  updateAction: (
    state: SupplierWorkflowFormState,
    formData: FormData,
  ) => Promise<SupplierWorkflowFormState>;
  activateAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
};

export function SupplierDetailPage({
  supplier,
  actionError,
  updateAction,
  activateAction,
  deactivateAction,
}: SupplierDetailPageProps) {
  const { messages } = useLocaleContext();
  const supplierMessages = messages.suppliers;
  const hasReferences = supplier.referencedInboundOrderCount > 0;
  const hasActiveReferences = supplier.activeReferencedInboundOrderCount > 0;

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge isActive={supplier.isActive} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {supplier.code}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/suppliers"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {supplierMessages.detail.backToList}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label={supplierMessages.list.supplierCode} value={supplier.code} />
          <Metric label={supplierMessages.list.supplierName} value={supplier.name} />
          <Metric
            label={supplierMessages.list.operationalState}
            value={
              supplier.isActive
                ? messages.common.states.active
                : messages.common.states.inactive
            }
          />
          <Metric label={supplierMessages.list.supplierId} value={supplier.id} mono />
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {supplierMessages.list.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {supplierMessages.detail.referenceEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow label={supplierMessages.list.supplierId} value={supplier.id} mono />
              <DetailRow label={supplierMessages.list.supplierCode} value={supplier.code} />
              <DetailRow label={supplierMessages.list.supplierName} value={supplier.name} />
              <DetailRow
                label={supplierMessages.detail.inboundEligibility}
                value={
                  supplier.isActive
                    ? messages.common.states.selectable
                    : messages.common.states.notSelectableWhileInactive
                }
              />
            </div>
          </section>

          <UsageSummaryCard
            eyebrow={supplierMessages.detail.usageEyebrow}
            referencedLabel={supplierMessages.detail.referencedInboundOrders}
            activeReferencedLabel={supplierMessages.detail.activeReferencedInboundOrders}
            summaryMessage={buildSupplierUsageSummaryMessage(
              supplierMessages,
              supplier.referencedInboundOrderCount,
              supplier.activeReferencedInboundOrderCount,
            )}
            hasReferences={hasReferences}
            hasActiveReferences={hasActiveReferences}
            referencedOrderCount={supplier.referencedInboundOrderCount}
            activeReferencedOrderCount={supplier.activeReferencedInboundOrderCount}
          />

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {supplierMessages.detail.accessStateEyebrow}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {buildSupplierAccessStateMessage(
                supplierMessages,
                supplier.referencedInboundOrderCount,
                supplier.activeReferencedInboundOrderCount,
              )}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {supplier.isActive ? (
                <WorkflowForm
                  action={deactivateAction}
                  supplierId={supplier.id}
                  redirectTo={`/suppliers/${supplier.id}`}
                  label={supplierMessages.detail.deactivate}
                  tone="muted"
                />
              ) : (
                <WorkflowForm
                  action={activateAction}
                  supplierId={supplier.id}
                  redirectTo={`/suppliers/${supplier.id}`}
                  label={supplierMessages.detail.activate}
                  tone="secondary"
                />
              )}
            </div>
          </section>
        </div>

        <SupplierForm
          action={updateAction}
          submitLabel={supplierMessages.detail.editSubmit}
          title={supplierMessages.detail.editTitle}
          description={supplierMessages.detail.editDescription}
          supplier={supplier}
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
  supplierId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  supplierId: string;
  redirectTo: string;
  label: string;
  tone: "secondary" | "muted";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="supplierId" value={supplierId} />
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

function buildSupplierUsageSummaryMessage(
  supplierMessages: Messages["suppliers"],
  referencedOrderCount: number,
  activeReferencedOrderCount: number,
) {
  const referencedWord =
    referencedOrderCount === 1
      ? supplierMessages.detail.words.orderSingular
      : supplierMessages.detail.words.orderPlural;
  const activeWord =
    activeReferencedOrderCount === 1
      ? supplierMessages.detail.words.orderSingular
      : supplierMessages.detail.words.orderPlural;

  if (activeReferencedOrderCount > 0) {
    return interpolateMessage(supplierMessages.detail.templates.usageActive, {
      referencedCount: referencedOrderCount,
      referencedWord,
      activeCount: activeReferencedOrderCount,
      activeWord,
    });
  }

  if (referencedOrderCount > 0) {
    return interpolateMessage(supplierMessages.detail.templates.usageHistorical, {
      referencedCount: referencedOrderCount,
      referencedWord,
    });
  }

  return supplierMessages.detail.templates.usageNone;
}

function buildSupplierAccessStateMessage(
  supplierMessages: Messages["suppliers"],
  referencedOrderCount: number,
  activeReferencedOrderCount: number,
) {
  const activeWord =
    activeReferencedOrderCount === 1
      ? supplierMessages.detail.words.orderSingular
      : supplierMessages.detail.words.orderPlural;

  if (activeReferencedOrderCount > 0) {
    return interpolateMessage(supplierMessages.detail.templates.accessActive, {
      activeCount: activeReferencedOrderCount,
      activeWord,
    });
  }

  if (referencedOrderCount > 0) {
    return supplierMessages.detail.templates.accessHistorical;
  }

  return supplierMessages.detail.templates.accessNone;
}
