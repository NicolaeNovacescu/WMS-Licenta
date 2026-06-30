"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { ReplenishmentRuleForm } from "@/features/replenishment/replenishment-rule-form";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { Product } from "@/types/catalog";
import type {
  ReplenishmentRule,
  ReplenishmentRuleFormState,
} from "@/types/replenishment";
import type { Location } from "@/types/warehouse-structure";

type ReplenishmentRuleDetailPageProps = {
  replenishmentRule: ReplenishmentRule;
  products: readonly Product[];
  targetLocations: readonly Location[];
  adminDataError: string | null;
  actionError: string | null;
  updateAction: (
    state: ReplenishmentRuleFormState,
    formData: FormData,
  ) => Promise<ReplenishmentRuleFormState>;
  deactivateAction: () => Promise<void>;
};

export function ReplenishmentRuleDetailPage({
  replenishmentRule,
  products,
  targetLocations,
  adminDataError,
  actionError,
  updateAction,
  deactivateAction,
}: ReplenishmentRuleDetailPageProps) {
  const { locale, messages } = useLocaleContext();
  const replenishmentRuleMessages = messages.replenishmentRules;

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {replenishmentRule.productSku}
              </span>
              <RuleStateBadge isActive={replenishmentRule.isActive} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {interpolateMessage(replenishmentRuleMessages.detail.title, {
                productName: replenishmentRule.productName,
              })}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              {replenishmentRuleMessages.detail.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/replenishment-rules"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {replenishmentRuleMessages.detail.backToList}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            label={replenishmentRuleMessages.detail.metrics.minimumThreshold}
            value={formatQuantity(replenishmentRule.minimumThreshold, locale)}
          />
          <Metric
            label={replenishmentRuleMessages.detail.metrics.targetQuantity}
            value={formatQuantity(replenishmentRule.targetQuantity, locale)}
          />
          <Metric
            label={replenishmentRuleMessages.detail.metrics.created}
            value={formatTimestamp(replenishmentRule.createdAtUtc, locale)}
          />
          <Metric
            label={replenishmentRuleMessages.detail.metrics.updated}
            value={formatTimestamp(replenishmentRule.updatedAtUtc, locale)}
          />
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {replenishmentRuleMessages.detail.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {replenishmentRuleMessages.detail.summaryEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow
                label={replenishmentRuleMessages.detail.ruleId}
                value={replenishmentRule.id}
                mono
              />
              <DetailRow
                label={replenishmentRuleMessages.detail.targetPath}
                value={`${replenishmentRule.targetWarehouseCode} / ${replenishmentRule.targetZoneCode} / ${replenishmentRule.targetLocationCode}`}
              />
              <DetailRow
                label={replenishmentRuleMessages.detail.targetLocationName}
                value={replenishmentRule.targetLocationName}
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
              {replenishmentRuleMessages.detail.lifecycleEyebrow}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {replenishmentRuleMessages.detail.lifecycleDescription}
            </p>

            {replenishmentRule.isActive ? (
              <div className="mt-5">
                <form action={deactivateAction}>
                  <ActionButton
                    label={replenishmentRuleMessages.detail.deactivate}
                    tone="muted"
                  />
                </form>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-muted">
                {replenishmentRuleMessages.detail.inactiveMessage}
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <LocationCard replenishmentRule={replenishmentRule} />

          {adminDataError ? (
            <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm text-ink">
              {adminDataError}
            </div>
          ) : null}

          <ReplenishmentRuleForm
            action={updateAction}
            products={products}
            targetLocations={targetLocations}
            submitLabel={replenishmentRuleMessages.detail.editSubmit}
            title={replenishmentRuleMessages.detail.editTitle}
            description={replenishmentRuleMessages.detail.editDescription}
            replenishmentRule={replenishmentRule}
          />
        </div>
      </div>
    </section>
  );
}

function LocationCard({
  replenishmentRule,
}: {
  replenishmentRule: ReplenishmentRule;
}) {
  const { messages } = useLocaleContext();
  const replenishmentRuleMessages = messages.replenishmentRules;

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        {replenishmentRuleMessages.detail.targetLocationEyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {replenishmentRule.targetLocationCode} - {replenishmentRule.targetLocationName}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        {replenishmentRule.targetWarehouseCode} / {replenishmentRule.targetZoneCode}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        {replenishmentRuleMessages.detail.targetLocationDescription}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink">
          {formatLocationTypeLabel(
            replenishmentRule.targetLocationType,
            messages.warehouseSetup.forms.locationTypes,
          )}
        </span>
        <StateBadge
          label={
            replenishmentRule.targetLocationIsActive
              ? messages.common.states.active
              : messages.common.states.inactive
          }
          tone={replenishmentRule.targetLocationIsActive ? "ok" : "muted"}
        />
        <StateBadge
          label={
            replenishmentRule.targetLocationIsBlocked
              ? messages.common.states.blocked
              : messages.common.states.unblocked
          }
          tone={replenishmentRule.targetLocationIsBlocked ? "danger" : "ok"}
        />
      </div>
    </section>
  );
}

function ActionButton({
  label,
  tone,
}: {
  label: string;
  tone: "muted";
}) {
  const { messages } = useLocaleContext();
  const { pending } = useFormStatus();
  const toneClass =
    tone === "muted"
      ? "border border-stone-300 bg-stone-100 text-stone-800 hover:border-stone-400 hover:bg-stone-200"
      : "";

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

function RuleStateBadge({ isActive }: { isActive: boolean }) {
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

function formatQuantity(value: number, locale: Locale) {
  return formatLocalizedQuantity(value, locale);
}

function formatTimestamp(value: string, locale: Locale) {
  return formatLocalizedDateTime(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatLocationTypeLabel(
  locationType: string,
  labels: Messages["warehouseSetup"]["forms"]["locationTypes"],
) {
  return labels[locationType as keyof typeof labels] ?? locationType;
}
