"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { ReplenishmentRuleForm } from "@/features/replenishment/replenishment-rule-form";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { Product } from "@/types/catalog";
import type {
  ReplenishmentRule,
  ReplenishmentRuleFormState,
} from "@/types/replenishment";
import type { Location } from "@/types/warehouse-structure";

type ReplenishmentRulesPageProps = {
  replenishmentRules: readonly ReplenishmentRule[];
  products: readonly Product[];
  targetLocations: readonly Location[];
  createAction: (
    state: ReplenishmentRuleFormState,
    formData: FormData,
  ) => Promise<ReplenishmentRuleFormState>;
  adminDataError: string | null;
};

type RuleStateFilter = "all" | "active" | "inactive";

export function ReplenishmentRulesPage({
  replenishmentRules,
  products,
  targetLocations,
  createAction,
  adminDataError,
}: ReplenishmentRulesPageProps) {
  const { locale, messages } = useLocaleContext();
  const replenishmentRuleMessages = messages.replenishmentRules;
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<RuleStateFilter>("active");
  const deferredSearch = useDeferredValue(search);

  const filteredRules = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...replenishmentRules]
      .filter((rule) => {
        const matchesSearch =
          !query ||
          [
            rule.productSku,
            rule.productName,
            rule.targetWarehouseCode,
            rule.targetZoneCode,
            rule.targetLocationCode,
            rule.targetLocationName,
          ].some((value) => value.toLowerCase().includes(query));
        const matchesState =
          stateFilter === "all"
            ? true
            : stateFilter === "active"
              ? rule.isActive
              : !rule.isActive;

        return matchesSearch && matchesState;
      })
      .sort((left, right) => {
        if (left.isActive !== right.isActive) {
          return left.isActive ? -1 : 1;
        }

        return right.updatedAtUtc.localeCompare(left.updatedAtUtc);
      });
  }, [deferredSearch, replenishmentRules, stateFilter]);

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          {replenishmentRuleMessages.list.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          {replenishmentRuleMessages.list.title}
        </h1>
      </header>

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.7fr]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {replenishmentRuleMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={replenishmentRuleMessages.list.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {replenishmentRuleMessages.list.stateLabel}
            </span>
            <select
              value={stateFilter}
              onChange={(event) =>
                setStateFilter(event.target.value as RuleStateFilter)
              }
              className={inputClassName}
            >
              <option value="active">{replenishmentRuleMessages.list.activeFirst}</option>
              <option value="all">{replenishmentRuleMessages.list.allRules}</option>
              <option value="inactive">
                {replenishmentRuleMessages.list.inactiveOnly}
              </option>
            </select>
          </label>

          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {replenishmentRuleMessages.list.resultsLabel}
            </p>
            <p className="mt-3 text-sm font-medium text-ink">
              {interpolateMessage(replenishmentRuleMessages.list.resultsTemplate, {
                filtered: filteredRules.length,
                total: replenishmentRules.length,
              })}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-4">
          {filteredRules.length === 0 ? (
            <EmptyState />
          ) : (
            filteredRules.map((rule) => (
              <article
                key={rule.id}
                className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                        {rule.productSku}
                      </span>
                      <RuleStateBadge isActive={rule.isActive} />
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                      {rule.productName}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {interpolateMessage(replenishmentRuleMessages.list.targetLabel, {
                        path: formatLocationPath(rule),
                        name: rule.targetLocationName,
                      })}
                    </p>
                  </div>

                  <Link
                    href={`/replenishment-rules/${rule.id}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                  >
                    {replenishmentRuleMessages.list.viewDetails}
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <Metric
                    label={replenishmentRuleMessages.list.metrics.minimumThreshold}
                    value={formatQuantity(rule.minimumThreshold, locale)}
                  />
                  <Metric
                    label={replenishmentRuleMessages.list.metrics.targetQuantity}
                    value={formatQuantity(rule.targetQuantity, locale)}
                  />
                  <Metric
                    label={replenishmentRuleMessages.list.metrics.updated}
                    value={formatTimestamp(rule.updatedAtUtc, locale)}
                  />
                </div>
              </article>
            ))
          )}
        </section>

        <div className="space-y-6">
          {adminDataError ? (
            <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm text-ink">
              {adminDataError}
            </div>
          ) : null}

          <ReplenishmentRuleForm
            action={createAction}
            products={products}
            targetLocations={targetLocations}
            submitLabel={replenishmentRuleMessages.form.createSubmit}
            title={replenishmentRuleMessages.form.createTitle}
            description={replenishmentRuleMessages.form.createDescription}
          />
        </div>
      </div>
    </section>
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

function EmptyState() {
  const { messages } = useLocaleContext();
  const replenishmentRuleMessages = messages.replenishmentRules;

  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {replenishmentRuleMessages.list.emptyEyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        {replenishmentRuleMessages.list.emptyMessage}
      </p>
    </div>
  );
}

function formatLocationPath(rule: ReplenishmentRule) {
  return `${rule.targetWarehouseCode} / ${rule.targetZoneCode} / ${rule.targetLocationCode}`;
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

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
