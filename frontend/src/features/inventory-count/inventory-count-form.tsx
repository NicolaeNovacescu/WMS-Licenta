"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { ProductBarcodeAssist } from "@/features/barcode/product-barcode-assist";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import { formatLocalizedQuantity } from "@/lib/format/locale-format";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { Product } from "@/types/catalog";
import type { InventoryBalance } from "@/types/inventory";
import type { InventoryCountWorkflowFormState } from "@/types/inventory-count";
import type { Location } from "@/types/warehouse-structure";

const initialState: InventoryCountWorkflowFormState = {
  error: null,
  successMessage: null,
};

type EditableLine = {
  key: string;
  productId: string;
  locationId: string;
};

type InventoryCountFormProps = {
  action: (
    state: InventoryCountWorkflowFormState,
    formData: FormData,
  ) => Promise<InventoryCountWorkflowFormState>;
  products: readonly Product[];
  locations: readonly Location[];
  inventoryBalances: readonly InventoryBalance[];
  expectedPreviewWarning: string | null;
};

export function InventoryCountForm({
  action,
  products,
  locations,
  inventoryBalances,
  expectedPreviewWarning,
}: InventoryCountFormProps) {
  const { locale, messages } = useLocaleContext();
  const inventoryCountMessages = messages.inventoryCounts;
  const [state, formAction] = useActionState(action, initialState);
  const [lines, setLines] = useState<EditableLine[]>([createEmptyLine("0")]);
  const hasProducts = products.length > 0;
  const hasLocations = locations.length > 0;
  const canSubmit = hasProducts && hasLocations;
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const locationsById = useMemo(
    () => new Map(locations.map((location) => [location.id, location])),
    [locations],
  );
  const balancesByKey = useMemo(
    () =>
      new Map(
        inventoryBalances.map((balance) => [
          buildBalanceKey(balance.productId, balance.locationId),
          balance,
        ]),
      ),
    [inventoryBalances],
  );

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {inventoryCountMessages.form.eyebrow}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
          {inventoryCountMessages.form.meaningEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">
          {inventoryCountMessages.form.meaningDescription}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {inventoryCountMessages.form.readinessEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          {inventoryCountMessages.form.readinessDescription}
        </p>
        {!hasProducts ? (
          <p className="mt-3 text-sm leading-6 text-warning">
            {inventoryCountMessages.form.noProductsWarning}
          </p>
        ) : null}
        {!hasLocations ? (
          <p className="mt-3 text-sm leading-6 text-warning">
            {inventoryCountMessages.form.noLocationsWarning}
          </p>
        ) : null}
      </div>

      {expectedPreviewWarning ? (
        <div className="mt-5 rounded-2xl border border-amber-300 bg-white px-4 py-4 text-sm leading-6 text-ink">
          {expectedPreviewWarning}
        </div>
      ) : null}

      <ProductBarcodeAssist
        products={products}
        contextLabel={inventoryCountMessages.form.barcodeContextLabel}
        onApplyProduct={(productId) => {
          let feedback = "";

          setLines((current) => {
            const emptyLineIndex = current.findIndex((candidate) => !candidate.productId);

            if (emptyLineIndex >= 0) {
              feedback = interpolateMessage(
                inventoryCountMessages.form.barcodeApplied,
                {
                  lineNumber: emptyLineIndex + 1,
                },
              );

              return current.map((candidate, index) =>
                index === emptyLineIndex
                  ? { ...candidate, productId }
                  : candidate,
              );
            }

            feedback = interpolateMessage(
              inventoryCountMessages.form.barcodeAdded,
              {
                lineNumber: current.length + 1,
              },
            );

            return [...current, createLine(String(Date.now()), productId)];
          });

          return feedback;
        }}
      />

      <form action={formAction} className="mt-6 space-y-5">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                {inventoryCountMessages.form.linesTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {inventoryCountMessages.form.linesDescription}
              </p>
              {!canSubmit ? (
                <p className="mt-2 text-sm leading-6 text-warning">
                  {inventoryCountMessages.form.linesBlockedWarning}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() =>
                setLines((current) => [
                  ...current,
                  createEmptyLine(String(Date.now())),
                ])
              }
              disabled={!canSubmit}
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {inventoryCountMessages.form.addLine}
            </button>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => {
              const selectedProduct = productsById.get(line.productId) ?? null;
              const selectedLocation = locationsById.get(line.locationId) ?? null;
              const currentBalance =
                line.productId && line.locationId
                  ? (balancesByKey.get(buildBalanceKey(line.productId, line.locationId)) ??
                    null)
                  : null;

              return (
                <div
                  key={line.key}
                  className="rounded-2xl border border-line bg-surface px-4 py-4"
                >
                  <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                    <Field
                      label={interpolateMessage(
                        inventoryCountMessages.form.productLabelTemplate,
                        {
                          index: index + 1,
                        },
                      )}
                      htmlFor={`line-product-${line.key}`}
                    >
                      <select
                        id={`line-product-${line.key}`}
                        name="lineProductId"
                        value={line.productId}
                        onChange={(event) =>
                          setLines((current) =>
                            current.map((candidate) =>
                              candidate.key === line.key
                                ? { ...candidate, productId: event.target.value }
                                : candidate,
                            ),
                          )
                        }
                        className={inputClassName}
                        disabled={!hasProducts}
                      >
                        <option value="">
                          {hasProducts
                            ? inventoryCountMessages.form.productPlaceholder
                            : inventoryCountMessages.form.productUnavailable}
                        </option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.sku} - {product.name}
                            {product.isActive
                              ? ""
                              : ` [${messages.common.states.inactive.toLowerCase()}]`}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label={interpolateMessage(
                        inventoryCountMessages.form.locationLabelTemplate,
                        {
                          index: index + 1,
                        },
                      )}
                      htmlFor={`line-location-${line.key}`}
                    >
                      <select
                        id={`line-location-${line.key}`}
                        name="lineLocationId"
                        value={line.locationId}
                        onChange={(event) =>
                          setLines((current) =>
                            current.map((candidate) =>
                              candidate.key === line.key
                                ? { ...candidate, locationId: event.target.value }
                                : candidate,
                            ),
                          )
                        }
                        className={inputClassName}
                        disabled={!hasLocations}
                      >
                        <option value="">
                          {hasLocations
                            ? inventoryCountMessages.form.locationPlaceholder
                            : inventoryCountMessages.form.locationUnavailable}
                        </option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.warehouseCode} / {location.zoneCode} / {location.code} -{" "}
                            {location.name} [
                            {formatLocationTypeLabel(
                              location.locationType,
                              messages.warehouseSetup.forms.locationTypes,
                            )}
                            {location.isActive
                              ? ""
                              : `, ${messages.common.states.inactive.toLowerCase()}`}
                            {location.isBlocked
                              ? `, ${messages.common.states.blocked.toLowerCase()}`
                              : ""}
                            ]
                          </option>
                        ))}
                      </select>
                    </Field>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() =>
                          setLines((current) =>
                            current.length === 1
                              ? current
                              : current.filter((candidate) => candidate.key !== line.key),
                          )
                        }
                        disabled={lines.length === 1}
                        className="inline-flex h-[50px] items-center justify-center rounded-2xl border border-stone-300 bg-stone-100 px-4 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {inventoryCountMessages.form.remove}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                      label={inventoryCountMessages.form.summary.expectedSystemPreview}
                      value={
                        expectedPreviewWarning
                          ? inventoryCountMessages.form.summary.previewUnavailable
                          : formatQuantity(currentBalance?.onHandQuantity ?? 0, locale)
                      }
                      caption={
                        expectedPreviewWarning
                          ? inventoryCountMessages.form.summary.previewUnavailableCaption
                          : currentBalance
                            ? inventoryCountMessages.form.summary.previewCurrentBalanceCaption
                            : inventoryCountMessages.form.summary.previewNoBalanceCaption
                      }
                    />
                    <SummaryCard
                      label={inventoryCountMessages.form.summary.productState}
                      value={
                        selectedProduct
                          ? selectedProduct.isActive
                            ? messages.common.states.active
                            : messages.common.states.inactive
                          : inventoryCountMessages.form.summary.selectProduct
                      }
                      caption={
                        selectedProduct
                          ? `${selectedProduct.sku} - ${selectedProduct.name}`
                          : inventoryCountMessages.form.summary.selectProductCaption
                      }
                    />
                    <SummaryCard
                      label={inventoryCountMessages.form.summary.locationPath}
                      value={
                        selectedLocation
                          ? `${selectedLocation.warehouseCode} / ${selectedLocation.zoneCode} / ${selectedLocation.code}`
                          : inventoryCountMessages.form.summary.selectLocation
                      }
                      caption={
                        selectedLocation
                          ? selectedLocation.name
                          : inventoryCountMessages.form.summary.selectLocationCaption
                      }
                    />
                    <SummaryCard
                      label={inventoryCountMessages.form.summary.locationState}
                      value={
                        selectedLocation
                          ? selectedLocation.isBlocked
                            ? messages.common.states.blocked
                            : selectedLocation.isActive
                              ? messages.common.states.active
                              : messages.common.states.inactive
                          : inventoryCountMessages.form.summary.notSelected
                      }
                      caption={
                        selectedLocation
                          ? interpolateMessage(
                              inventoryCountMessages.form.summary.locationStateCaptionTemplate,
                              {
                                type: formatLocationTypeLabel(
                                  selectedLocation.locationType,
                                  messages.warehouseSetup.forms.locationTypes,
                                ),
                              },
                            )
                          : inventoryCountMessages.form.summary.locationStateCaptionUnselected
                      }
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedProduct ? (
                      <StateBadge
                        label={
                          selectedProduct.isActive
                            ? messages.common.states.active
                            : messages.common.states.inactive
                        }
                        tone={selectedProduct.isActive ? "ok" : "muted"}
                      />
                    ) : null}
                    {selectedLocation ? (
                      <>
                        <StateBadge
                          label={formatLocationTypeLabel(
                            selectedLocation.locationType,
                            messages.warehouseSetup.forms.locationTypes,
                          )}
                          tone="muted"
                        />
                        <StateBadge
                          label={
                            selectedLocation.isActive
                              ? messages.common.states.active
                              : messages.common.states.inactive
                          }
                          tone={selectedLocation.isActive ? "ok" : "muted"}
                        />
                        <StateBadge
                          label={
                            selectedLocation.isBlocked
                              ? messages.common.states.blocked
                              : messages.common.states.unblocked
                          }
                          tone={selectedLocation.isBlocked ? "danger" : "ok"}
                        />
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {state.error ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {state.error}
          </div>
        ) : null}

        <SubmitButton
          label={inventoryCountMessages.form.createSubmit}
          disabled={!canSubmit}
        />
      </form>
    </section>
  );
}

function createLine(keySuffix: string, productId = ""): EditableLine {
  return {
    key: `line-${keySuffix}`,
    productId,
    locationId: "",
  };
}

function createEmptyLine(keySuffix: string) {
  return createLine(keySuffix);
}

function buildBalanceKey(productId: string, locationId: string) {
  return `${productId}:${locationId}`;
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
    <div className="rounded-2xl border border-line bg-white px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-sm font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{caption}</p>
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

function SubmitButton({
  label,
  disabled = false,
}: {
  label: string;
  disabled?: boolean;
}) {
  const { messages } = useLocaleContext();
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? messages.inventoryCounts.form.pending : label}
    </button>
  );
}

function formatQuantity(value: number, locale: Locale) {
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
