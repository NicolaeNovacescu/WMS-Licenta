"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { formatLocalizedQuantity } from "@/lib/format/locale-format";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { InventoryBalance } from "@/types/inventory";
import type {
  ReplenishmentRule,
  ReplenishmentTaskFormState,
} from "@/types/replenishment";
import type { Location } from "@/types/warehouse-structure";

const initialState: ReplenishmentTaskFormState = {
  error: null,
  successMessage: null,
};

type ReplenishmentTaskFormProps = {
  action: (
    state: ReplenishmentTaskFormState,
    formData: FormData,
  ) => Promise<ReplenishmentTaskFormState>;
  sourceBalances: readonly InventoryBalance[];
  inventoryBalances: readonly InventoryBalance[];
  targetLocations: readonly Location[];
  replenishmentRules: readonly ReplenishmentRule[];
  canReadRules: boolean;
};

export function ReplenishmentTaskForm({
  action,
  sourceBalances,
  inventoryBalances,
  targetLocations,
  replenishmentRules,
  canReadRules,
}: ReplenishmentTaskFormProps) {
  const { locale, messages } = useLocaleContext();
  const replenishmentTaskMessages = messages.replenishmentTasks;
  const [state, formAction] = useActionState(action, initialState);
  const [selectedSourceBalanceId, setSelectedSourceBalanceId] = useState(
    sourceBalances[0]?.id ?? "",
  );
  const [selectedTargetId, setSelectedTargetId] = useState(() => {
    const initialSource = sourceBalances[0];

    if (!initialSource) {
      return "";
    }

    return (
      getValidTargetLocations(initialSource.locationId, targetLocations)[0]?.id ?? ""
    );
  });

  const selectedSource = useMemo(
    () =>
      sourceBalances.find((balance) => balance.id === selectedSourceBalanceId) ?? null,
    [selectedSourceBalanceId, sourceBalances],
  );
  const validTargetLocations = useMemo(() => {
    if (!selectedSource) {
      return [];
    }

    return getValidTargetLocations(selectedSource.locationId, targetLocations);
  }, [selectedSource, targetLocations]);
  const selectedTarget =
    validTargetLocations.find((location) => location.id === selectedTargetId) ?? null;
  const matchingRule = useMemo(() => {
    if (!selectedSource || !selectedTarget) {
      return null;
    }

    return (
      replenishmentRules.find(
        (rule) =>
          rule.isActive &&
          rule.productId === selectedSource.productId &&
          rule.targetLocationId === selectedTarget.id,
      ) ?? null
    );
  }, [replenishmentRules, selectedSource, selectedTarget]);
  const targetBalance = useMemo(() => {
    if (!selectedSource || !selectedTarget) {
      return null;
    }

    return (
      inventoryBalances.find(
        (balance) =>
          balance.productId === selectedSource.productId &&
          balance.locationId === selectedTarget.id,
      ) ?? null
    );
  }, [inventoryBalances, selectedSource, selectedTarget]);

  if (sourceBalances.length === 0) {
    return (
      <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {replenishmentTaskMessages.form.emptyEyebrow}
        </p>
        <p className="mt-4 text-sm leading-7 text-muted">
          {replenishmentTaskMessages.form.emptyMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {replenishmentTaskMessages.form.eyebrow}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
          {replenishmentTaskMessages.form.meaningEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">
          {replenishmentTaskMessages.form.meaningDescription}
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <Field label={replenishmentTaskMessages.form.sourceStockLabel} htmlFor="sourceBalanceId">
          <select
            id="sourceBalanceId"
            value={selectedSourceBalanceId}
            onChange={(event) => {
              const nextSourceBalanceId = event.target.value;
              const nextSource =
                sourceBalances.find((balance) => balance.id === nextSourceBalanceId) ??
                null;
              const nextTargets = nextSource
                ? getValidTargetLocations(nextSource.locationId, targetLocations)
                : [];

              setSelectedSourceBalanceId(nextSourceBalanceId);
              setSelectedTargetId((current) =>
                nextTargets.some((location) => location.id === current)
                  ? current
                  : (nextTargets[0]?.id ?? ""),
              );
            }}
            className={inputClassName}
          >
            {sourceBalances.map((balance) => (
              <option key={balance.id} value={balance.id}>
                {balance.productSku} - {balance.productName} |{" "}
                {formatInventoryPath(balance)} |{" "}
                {interpolateMessage(replenishmentTaskMessages.form.availableTemplate, {
                  value: formatDisplayQuantity(balance.availableQuantity, locale),
                })}
              </option>
            ))}
          </select>
        </Field>

        {selectedSource ? (
          <>
            <input type="hidden" name="productId" value={selectedSource.productId} />
            <input
              type="hidden"
              name="sourceLocationId"
              value={selectedSource.locationId}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <SummaryCard
                label={replenishmentTaskMessages.form.sourceLabel}
                value={`${selectedSource.productSku} - ${selectedSource.productName}`}
                caption={interpolateMessage(
                  replenishmentTaskMessages.form.sourceCaptionTemplate,
                  {
                    path: formatInventoryPath(selectedSource),
                    type: formatLocationTypeLabel(
                      selectedSource.locationType,
                      messages.warehouseSetup.forms.locationTypes,
                    ),
                  },
                )}
              />
              <SummaryCard
                label={replenishmentTaskMessages.form.availableToMoveLabel}
                value={formatDisplayQuantity(selectedSource.availableQuantity, locale)}
                caption={interpolateMessage(
                  replenishmentTaskMessages.form.quantitySummaryTemplate,
                  {
                    onHand: formatDisplayQuantity(selectedSource.onHandQuantity, locale),
                    reserved: formatDisplayQuantity(
                      selectedSource.reservedQuantity,
                      locale,
                    ),
                  },
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label={replenishmentTaskMessages.form.targetLocationLabel}
                htmlFor="targetLocationId"
              >
                <select
                  id="targetLocationId"
                  name="targetLocationId"
                  value={selectedTargetId}
                  onChange={(event) => setSelectedTargetId(event.target.value)}
                  className={inputClassName}
                  disabled={validTargetLocations.length === 0}
                >
                  {validTargetLocations.length === 0 ? (
                    <option value="">
                      {replenishmentTaskMessages.form.noValidTargets}
                    </option>
                  ) : (
                    validTargetLocations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {formatLocationLabel(location)}
                      </option>
                    ))
                  )}
                </select>
              </Field>

              <Field label={replenishmentTaskMessages.form.quantityLabel} htmlFor="quantity">
                <input
                  key={`${selectedSource.id}-${selectedTargetId}`}
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0.01"
                  max={formatInputQuantity(selectedSource.availableQuantity)}
                  step="0.01"
                  className={inputClassName}
                  placeholder={replenishmentTaskMessages.form.quantityPlaceholder}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SummaryCard
                label={replenishmentTaskMessages.form.targetAvailableNowLabel}
                value={formatDisplayQuantity(targetBalance?.availableQuantity ?? 0, locale)}
                caption={
                  targetBalance
                    ? interpolateMessage(
                        replenishmentTaskMessages.form.targetBalanceCaptionTemplate,
                        {
                          onHand: formatDisplayQuantity(
                            targetBalance.onHandQuantity,
                            locale,
                          ),
                          reserved: formatDisplayQuantity(
                            targetBalance.reservedQuantity,
                            locale,
                          ),
                        },
                      )
                    : replenishmentTaskMessages.form.noTargetBalance
                }
              />
              {matchingRule ? (
                <SummaryCard
                  label={replenishmentTaskMessages.form.matchedRuleLabel}
                  value={interpolateMessage(
                    replenishmentTaskMessages.form.matchedRuleValue,
                    {
                      minimumThreshold: formatDisplayQuantity(
                        matchingRule.minimumThreshold,
                        locale,
                      ),
                      targetQuantity: formatDisplayQuantity(
                        matchingRule.targetQuantity,
                        locale,
                      ),
                    },
                  )}
                  caption={replenishmentTaskMessages.form.matchedRuleCaption}
                />
              ) : (
                <SummaryCard
                  label={
                    canReadRules
                      ? replenishmentTaskMessages.form.ruleCheckLabel
                      : replenishmentTaskMessages.form.ruleValidationLabel
                  }
                  value={
                    canReadRules
                      ? replenishmentTaskMessages.form.noMatchingRule
                      : replenishmentTaskMessages.form.validatedByBackend
                  }
                  caption={
                    canReadRules
                      ? replenishmentTaskMessages.form.ruleCheckCaption
                      : replenishmentTaskMessages.form.backendValidationCaption
                  }
                />
              )}
            </div>
          </>
        ) : null}

        {selectedSource && validTargetLocations.length === 0 ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {replenishmentTaskMessages.form.noValidTargetMessage}
          </div>
        ) : null}

        {state.error ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {state.error}
          </div>
        ) : null}

        <SubmitButton
          label={replenishmentTaskMessages.form.createSubmit}
          pendingLabel={replenishmentTaskMessages.form.pending}
          disabled={!selectedSource || validTargetLocations.length === 0}
        />
      </form>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold tracking-wide text-ink"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-sm font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{caption}</p>
    </div>
  );
}

function SubmitButton({
  label,
  pendingLabel,
  disabled,
}: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function getValidTargetLocations(
  sourceLocationId: string,
  targetLocations: readonly Location[],
) {
  return targetLocations.filter((location) => location.id !== sourceLocationId);
}

function formatLocationLabel(location: Location) {
  return `${location.warehouseCode} / ${location.zoneCode} / ${location.code} - ${location.name}`;
}

function formatInventoryPath(balance: InventoryBalance) {
  return `${balance.warehouseCode} / ${balance.zoneCode} / ${balance.locationCode}`;
}

function formatInputQuantity(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.00$/, "");
}

function formatDisplayQuantity(value: number, locale: Locale) {
  return formatLocalizedQuantity(value, locale);
}

function formatLocationTypeLabel(
  locationType: string,
  labels: Messages["warehouseSetup"]["forms"]["locationTypes"],
) {
  return labels[locationType as keyof typeof labels] ?? locationType;
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
