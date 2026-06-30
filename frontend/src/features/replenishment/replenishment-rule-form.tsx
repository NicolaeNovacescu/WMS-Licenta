"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import type { Product } from "@/types/catalog";
import type {
  ReplenishmentRule,
  ReplenishmentRuleFormState,
} from "@/types/replenishment";
import type { Location } from "@/types/warehouse-structure";

const initialState: ReplenishmentRuleFormState = {
  error: null,
  successMessage: null,
};

type ReplenishmentRuleFormProps = {
  action: (
    state: ReplenishmentRuleFormState,
    formData: FormData,
  ) => Promise<ReplenishmentRuleFormState>;
  products: readonly Product[];
  targetLocations: readonly Location[];
  submitLabel: string;
  title: string;
  description: string;
  replenishmentRule?: ReplenishmentRule;
};

export function ReplenishmentRuleForm({
  action,
  products,
  targetLocations,
  submitLabel,
  title,
  replenishmentRule,
}: ReplenishmentRuleFormProps) {
  const { messages } = useLocaleContext();
  const replenishmentRuleMessages = messages.replenishmentRules;
  const [state, formAction] = useActionState(action, initialState);
  const hasFormOptions = products.length > 0 && targetLocations.length > 0;

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {title}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
          {replenishmentRuleMessages.form.workflowMeaningEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">
          {replenishmentRuleMessages.form.workflowMeaningDescription}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {replenishmentRuleMessages.form.targetLocationRuleEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          {replenishmentRuleMessages.form.targetLocationRuleDescription}
        </p>
      </div>

      {hasFormOptions ? (
        <form action={formAction} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label={replenishmentRuleMessages.form.productLabel}
              htmlFor="productId"
            >
              <select
                id="productId"
                name="productId"
                defaultValue={replenishmentRule?.productId ?? ""}
                className={inputClassName}
              >
                <option value="">
                  {replenishmentRuleMessages.form.selectProduct}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.sku} - {product.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={replenishmentRuleMessages.form.targetLocationLabel}
              htmlFor="targetLocationId"
            >
              <select
                id="targetLocationId"
                name="targetLocationId"
                defaultValue={replenishmentRule?.targetLocationId ?? ""}
                className={inputClassName}
              >
                <option value="">
                  {replenishmentRuleMessages.form.selectTargetLocation}
                </option>
                {targetLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {formatLocationLabel(location)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label={replenishmentRuleMessages.form.minimumThresholdLabel}
              htmlFor="minimumThreshold"
            >
              <input
                id="minimumThreshold"
                name="minimumThreshold"
                type="number"
                min="0"
                step="0.01"
                defaultValue={
                  replenishmentRule
                    ? formatInputQuantity(replenishmentRule.minimumThreshold)
                    : ""
                }
                className={inputClassName}
                placeholder={replenishmentRuleMessages.form.minimumThresholdPlaceholder}
              />
            </Field>

            <Field
              label={replenishmentRuleMessages.form.targetQuantityLabel}
              htmlFor="targetQuantity"
            >
              <input
                id="targetQuantity"
                name="targetQuantity"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={
                  replenishmentRule
                    ? formatInputQuantity(replenishmentRule.targetQuantity)
                    : ""
                }
                className={inputClassName}
                placeholder={replenishmentRuleMessages.form.targetQuantityPlaceholder}
              />
            </Field>
          </div>

          {state.error ? (
            <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
              {state.error}
            </div>
          ) : null}

          <SubmitButton
            label={submitLabel}
            pendingLabel={replenishmentRuleMessages.form.pending}
          />
        </form>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface px-4 py-5 text-sm leading-6 text-muted">
          {replenishmentRuleMessages.form.optionsRequired}
        </div>
      )}
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

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function formatLocationLabel(location: Location) {
  return `${location.warehouseCode} / ${location.zoneCode} / ${location.code} - ${location.name}`;
}

function formatInputQuantity(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.00$/, "");
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
