"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { ProductBarcodeAssist } from "@/features/barcode/product-barcode-assist";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { Product } from "@/types/catalog";
import type { ManagedSupplier } from "@/types/supplier";
import type {
  InboundOrder,
  InboundWorkflowFormState,
} from "@/types/inbound";

const initialState: InboundWorkflowFormState = {
  error: null,
  successMessage: null,
};

type EditableLine = {
  key: string;
  productId: string;
  expectedQuantity: string;
};

type InboundOrderFormProps = {
  action: (
    state: InboundWorkflowFormState,
    formData: FormData,
  ) => Promise<InboundWorkflowFormState>;
  products: readonly Product[];
  submitLabel: string;
  title: string;
  description: string;
  suppliers: readonly ManagedSupplier[];
  inboundOrder?: InboundOrder;
};

export function InboundOrderForm({
  action,
  products,
  submitLabel,
  title,
  suppliers,
  inboundOrder,
}: InboundOrderFormProps) {
  const { messages } = useLocaleContext();
  const inboundMessages = messages.inboundOrders;
  const [state, formAction] = useActionState(action, initialState);
  const [lines, setLines] = useState<EditableLine[]>(() =>
    inboundOrder
      ? inboundOrder.lines.map((line, index) => ({
          key: `${line.id}-${index}`,
          productId: line.productId,
          expectedQuantity: formatInputQuantity(line.expectedQuantity),
        }))
      : [createEmptyLine("0")],
  );
  const activeSuppliers = suppliers.filter((supplier) => supplier.isActive);
  const hasProducts = products.length > 0;
  const canSubmit = activeSuppliers.length > 0 && hasProducts;
  const selectedSupplier = suppliers.find(
    (supplier) => supplier.id === inboundOrder?.supplierId,
  );
  const selectedSupplierIsInactive = selectedSupplier ? !selectedSupplier.isActive : false;

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {title}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
          {inboundMessages.form.stockImpactEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">
          {inboundMessages.form.stockImpactDescription}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {inboundMessages.form.readinessEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          {inboundMessages.form.readinessDescription}
        </p>
        {activeSuppliers.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-warning">
            {inboundMessages.form.noActiveSuppliers}
          </p>
        ) : null}
        {!hasProducts ? (
          <p className="mt-3 text-sm leading-6 text-warning">
            {inboundMessages.form.noProducts}
          </p>
        ) : null}
        {selectedSupplierIsInactive ? (
          <p className="mt-3 text-sm leading-6 text-warning">
            {interpolateMessage(inboundMessages.form.selectedInactiveSupplier, {
              code: selectedSupplier?.code ?? "",
            })}
          </p>
        ) : null}
      </div>

      <ProductBarcodeAssist
        products={products}
        contextLabel={inboundMessages.form.barcodeContextLabel}
        onApplyProduct={(productId) => {
          let feedback = "";

          setLines((current) => {
            const emptyLineIndex = current.findIndex((candidate) => !candidate.productId);

            if (emptyLineIndex >= 0) {
              feedback = interpolateMessage(inboundMessages.form.barcodeApplied, {
                lineNumber: emptyLineIndex + 1,
              });

              return current.map((candidate, index) =>
                index === emptyLineIndex
                  ? { ...candidate, productId }
                  : candidate,
              );
            }

            feedback = interpolateMessage(inboundMessages.form.barcodeAdded, {
              lineNumber: current.length + 1,
            });

            return [...current, createLine(String(Date.now()), productId)];
          });

          return feedback;
        }}
      />

      <form action={formAction} className="mt-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={inboundMessages.form.supplierLabel} htmlFor="supplierId">
            <select
              id="supplierId"
              name="supplierId"
              defaultValue={inboundOrder?.supplierId ?? ""}
              className={inputClassName}
              disabled={activeSuppliers.length === 0}
            >
              <option value="">
                {activeSuppliers.length > 0
                  ? inboundMessages.form.selectSupplier
                  : inboundMessages.form.noActiveSuppliersOption}
              </option>
              {selectedSupplierIsInactive ? (
                <option value={selectedSupplier?.id}>
                  {selectedSupplier?.code} - {selectedSupplier?.name}{" "}
                  {inboundMessages.form.inactiveSuffix}
                </option>
              ) : null}
              {activeSuppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.code} - {supplier.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={inboundMessages.form.invoiceReferenceLabel}
            htmlFor="supplierInvoiceReference"
          >
            <input
              id="supplierInvoiceReference"
              name="supplierInvoiceReference"
              type="text"
              defaultValue={inboundOrder?.supplierInvoiceReference ?? ""}
              className={inputClassName}
              placeholder={inboundMessages.form.invoiceReferencePlaceholder}
            />
          </Field>
        </div>

        <Field label={inboundMessages.form.notesLabel} htmlFor="notes">
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={inboundOrder?.notes ?? ""}
            className={`${inputClassName} min-h-28 resize-y`}
            placeholder={inboundMessages.form.notesPlaceholder}
          />
        </Field>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                {inboundMessages.form.linesTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {inboundMessages.form.linesDescription}
              </p>
              {!hasProducts ? (
                <p className="mt-2 text-sm leading-6 text-warning">
                  {inboundMessages.form.productsRequired}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() =>
                setLines((current) => [...current, createEmptyLine(String(Date.now()))])
              }
              disabled={!hasProducts}
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {inboundMessages.form.addLine}
            </button>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => (
              <div
                key={line.key}
                className="rounded-2xl border border-line bg-surface px-4 py-4"
              >
                <div className="grid gap-4 md:grid-cols-[1.2fr_0.6fr_auto]">
                  <Field
                    label={interpolateMessage(inboundMessages.form.productLabel, {
                      index: index + 1,
                    })}
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
                          ? inboundMessages.form.selectProduct
                          : inboundMessages.form.noProductsOption}
                      </option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.sku} - {product.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label={inboundMessages.form.expectedQuantityLabel}
                    htmlFor={`line-quantity-${line.key}`}
                  >
                    <input
                      id={`line-quantity-${line.key}`}
                      name="lineExpectedQuantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.expectedQuantity}
                      onChange={(event) =>
                        setLines((current) =>
                          current.map((candidate) =>
                            candidate.key === line.key
                              ? {
                                  ...candidate,
                                  expectedQuantity: event.target.value,
                                }
                              : candidate,
                          ),
                        )
                      }
                      className={inputClassName}
                      placeholder={inboundMessages.form.quantityPlaceholder}
                    />
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
                      {inboundMessages.form.removeLine}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {state.error ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {state.error}
          </div>
        ) : null}

        <SubmitButton
          label={submitLabel}
          pendingLabel={inboundMessages.form.pending}
          disabled={!canSubmit || selectedSupplierIsInactive}
        />
      </form>
    </section>
  );
}

function createLine(keySuffix: string, productId = ""): EditableLine {
  return {
    key: `line-${keySuffix}`,
    productId,
    expectedQuantity: "",
  };
}

function createEmptyLine(keySuffix: string) {
  return createLine(keySuffix);
}

function formatInputQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toString();
}

type FieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

function Field({ label, htmlFor, children }: FieldProps) {
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
  disabled = false,
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

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
