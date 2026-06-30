"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { formatLocalizedQuantity } from "@/lib/format/locale-format";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { InventoryBalance } from "@/types/inventory";
import type { TransferWorkflowFormState } from "@/types/transfer";
import type { Location } from "@/types/warehouse-structure";

const initialState: TransferWorkflowFormState = {
  error: null,
  successMessage: null,
};

type TransferTaskFormProps = {
  action: (
    state: TransferWorkflowFormState,
    formData: FormData,
  ) => Promise<TransferWorkflowFormState>;
  sourceBalances: readonly InventoryBalance[];
  destinationLocations: readonly Location[];
};

export function TransferTaskForm({
  action,
  sourceBalances,
  destinationLocations,
}: TransferTaskFormProps) {
  const { locale, messages } = useLocaleContext();
  const transferMessages = messages.transferTasks;
  const [state, formAction] = useActionState(action, initialState);
  const [selectedSourceBalanceId, setSelectedSourceBalanceId] = useState(
    sourceBalances[0]?.id ?? "",
  );
  const [selectedDestinationId, setSelectedDestinationId] = useState(() => {
    const initialSource = sourceBalances[0];

    if (!initialSource) {
      return "";
    }

    return (
      getValidDestinationLocations(initialSource.locationId, destinationLocations)[0]
        ?.id ?? ""
    );
  });
  const selectedSource = useMemo(
    () =>
      sourceBalances.find((balance) => balance.id === selectedSourceBalanceId) ?? null,
    [selectedSourceBalanceId, sourceBalances],
  );
  const validDestinations = useMemo(() => {
    if (!selectedSource) {
      return [];
    }

    return getValidDestinationLocations(
      selectedSource.locationId,
      destinationLocations,
    );
  }, [destinationLocations, selectedSource]);

  if (sourceBalances.length === 0) {
    return (
      <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {transferMessages.form.emptyEyebrow}
        </p>
        <p className="mt-4 text-sm leading-7 text-muted">
          {transferMessages.form.emptyMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {transferMessages.form.eyebrow}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
          {transferMessages.form.meaningEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">
          {transferMessages.form.meaningDescription}
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <Field
          label={transferMessages.form.sourceBalanceLabel}
          htmlFor="sourceBalanceId"
        >
          <select
            id="sourceBalanceId"
            value={selectedSourceBalanceId}
            onChange={(event) => {
              const nextSourceBalanceId = event.target.value;
              const nextSource =
                sourceBalances.find((balance) => balance.id === nextSourceBalanceId) ??
                null;
              const nextDestinations = nextSource
                ? getValidDestinationLocations(
                    nextSource.locationId,
                    destinationLocations,
                  )
                : [];

              setSelectedSourceBalanceId(nextSourceBalanceId);
              setSelectedDestinationId((current) =>
                nextDestinations.some((location) => location.id === current)
                  ? current
                  : (nextDestinations[0]?.id ?? ""),
              );
            }}
            className={inputClassName}
          >
            {sourceBalances.map((balance) => (
              <option key={balance.id} value={balance.id}>
                {balance.productSku} - {balance.productName} |{" "}
                {formatInventoryPath(balance)} |{" "}
                {interpolateMessage(transferMessages.form.availableTemplate, {
                  value: formatDisplayQuantity(balance.availableQuantity, locale),
                })}{" "}
                |{" "}
                {balance.locationIsBlocked
                  ? transferMessages.form.blockedSource
                  : transferMessages.form.unblockedSource}
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
                label={transferMessages.form.sourceLabel}
                value={`${selectedSource.productSku} - ${selectedSource.productName}`}
                caption={interpolateMessage(
                  transferMessages.form.locationTypeTemplate,
                  {
                    path: formatInventoryPath(selectedSource),
                    type: formatLocationTypeLabel(
                      selectedSource.locationType,
                      messages.warehouseSetup.forms.locationTypes,
                    ),
                    sourceState: selectedSource.locationIsBlocked
                      ? transferMessages.form.blockedSource
                      : transferMessages.form.unblockedSource,
                  },
                )}
              />
              <SummaryCard
                label={transferMessages.form.availableToMoveLabel}
                value={formatDisplayQuantity(selectedSource.availableQuantity, locale)}
                caption={interpolateMessage(
                  transferMessages.form.quantitySummaryTemplate,
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
                label={transferMessages.form.destinationLocationLabel}
                htmlFor="destinationLocationId"
              >
                <select
                  id="destinationLocationId"
                  name="destinationLocationId"
                  value={selectedDestinationId}
                  onChange={(event) => setSelectedDestinationId(event.target.value)}
                  className={inputClassName}
                  disabled={validDestinations.length === 0}
                >
                  {validDestinations.length === 0 ? (
                    <option value="">
                      {transferMessages.form.noValidDestinations}
                    </option>
                  ) : (
                    validDestinations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {formatLocationLabel(location)}
                      </option>
                    ))
                  )}
                </select>
              </Field>

              <Field label={transferMessages.form.quantityLabel} htmlFor="quantity">
                <input
                  key={selectedSource.id}
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0.01"
                  max={formatInputQuantity(selectedSource.availableQuantity)}
                  step="0.01"
                  defaultValue={formatInputQuantity(selectedSource.availableQuantity)}
                  className={inputClassName}
                />
              </Field>
            </div>
          </>
        ) : null}

        <Field label={transferMessages.form.reasonLabel} htmlFor="reason">
          <textarea
            id="reason"
            name="reason"
            rows={4}
            className={`${inputClassName} min-h-28 resize-y`}
            placeholder={transferMessages.form.reasonPlaceholder}
          />
        </Field>

        {selectedSource && validDestinations.length === 0 ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {transferMessages.form.noValidDestinationMessage}
          </div>
        ) : null}

        {state.error ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {state.error}
          </div>
        ) : null}

        <SubmitButton
          label={transferMessages.form.createSubmit}
          pendingLabel={transferMessages.form.pending}
          disabled={!selectedSource || validDestinations.length === 0}
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

function formatInventoryPath(balance: InventoryBalance) {
  return `${balance.warehouseCode} / ${balance.zoneCode} / ${balance.locationCode}`;
}

function getValidDestinationLocations(
  sourceLocationId: string,
  destinationLocations: readonly Location[],
) {
  return destinationLocations.filter((location) => location.id !== sourceLocationId);
}

function formatLocationLabel(location: Location) {
  return `${location.warehouseCode} / ${location.zoneCode} / ${location.code} - ${location.name}`;
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
