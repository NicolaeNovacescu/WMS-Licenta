"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { ProductBarcodeAssist } from "@/features/barcode/product-barcode-assist";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { Product } from "@/types/catalog";
import type { ManagedCustomer } from "@/types/customer";
import type { SalesOrder, SalesOrderFormState } from "@/types/sales";

const initialState: SalesOrderFormState = {
  error: null,
  successMessage: null,
};

type EditableLine = {
  key: string;
  productId: string;
  orderedQuantity: string;
};

type SalesOrderFormProps = {
  action: (
    state: SalesOrderFormState,
    formData: FormData,
  ) => Promise<SalesOrderFormState>;
  customers: readonly ManagedCustomer[];
  products: readonly Product[];
  submitLabel: string;
  title: string;
  description: string;
  salesOrder?: SalesOrder;
};

export function SalesOrderForm({
  action,
  customers,
  products,
  submitLabel,
  title,
  salesOrder,
}: SalesOrderFormProps) {
  const { messages } = useLocaleContext();
  const salesOrderMessages = messages.salesOrders;
  const [state, formAction] = useActionState(action, initialState);
  const activeCustomers = customers.filter((customer) => customer.isActive);
  const hasProducts = products.length > 0;
  const canSubmit = activeCustomers.length > 0 && hasProducts;
  const [customerId, setCustomerId] = useState(
    salesOrder?.customerIsActive === false ? "" : salesOrder?.customerId ?? "",
  );
  const [lines, setLines] = useState<EditableLine[]>(() =>
    salesOrder
      ? salesOrder.lines.map((line, index) => ({
          key: `${line.id}-${index}`,
          productId: line.productId,
          orderedQuantity: formatQuantity(line.orderedQuantity),
        }))
      : [createEmptyLine("0")],
  );

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {title}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
          {salesOrderMessages.form.stockImpactEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">
          {salesOrderMessages.form.stockImpactDescription}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {salesOrderMessages.form.readinessEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          {salesOrderMessages.form.readinessDescription}
        </p>
        {activeCustomers.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-warning">
            {salesOrderMessages.form.noActiveCustomers}
          </p>
        ) : null}
        {!hasProducts ? (
          <p className="mt-3 text-sm leading-6 text-warning">
            {salesOrderMessages.form.noProducts}
          </p>
        ) : null}
        {salesOrder &&
        (!salesOrder.customerId || salesOrder.customerIsActive === false) ? (
          <p className="mt-3 text-sm leading-6 text-warning">
            {salesOrderMessages.form.inactiveCustomerRequired}
          </p>
        ) : null}
      </div>

      <ProductBarcodeAssist
        products={products}
        contextLabel={salesOrderMessages.form.barcodeContextLabel}
        onApplyProduct={(productId) => {
          let feedback = "";

          setLines((current) => {
            const emptyLineIndex = current.findIndex((candidate) => !candidate.productId);

            if (emptyLineIndex >= 0) {
              feedback = interpolateMessage(salesOrderMessages.form.barcodeApplied, {
                lineNumber: emptyLineIndex + 1,
              });

              return current.map((candidate, index) =>
                index === emptyLineIndex
                  ? { ...candidate, productId }
                  : candidate,
              );
            }

            feedback = interpolateMessage(salesOrderMessages.form.barcodeAdded, {
              lineNumber: current.length + 1,
            });

            return [...current, createLine(String(Date.now()), productId)];
          });

          return feedback;
        }}
      />

      <form action={formAction} className="mt-6 space-y-5">
        {salesOrder ? (
          <input type="hidden" name="salesOrderId" value={salesOrder.id} />
        ) : null}

        <Field
          label={salesOrderMessages.form.customerLabel}
          htmlFor="customerId"
        >
          <select
            id="customerId"
            name="customerId"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            className={inputClassName}
            disabled={activeCustomers.length === 0}
          >
            <option value="">
              {activeCustomers.length > 0
                ? salesOrderMessages.form.selectCustomer
                : salesOrderMessages.form.noActiveCustomersOption}
            </option>
            {salesOrder &&
            (!salesOrder.customerId || salesOrder.customerIsActive === false) ? (
              <option value="">
                {salesOrder.customerCode && salesOrder.customerName
                  ? interpolateMessage(
                      salesOrderMessages.form.legacyInactiveCustomerTemplate,
                      {
                        customer: `${salesOrder.customerCode} - ${salesOrder.customerName}`,
                      },
                    )
                  : salesOrderMessages.form.legacyWithoutCustomerOption}
              </option>
            ) : null}
            {customers.map((customer) => {
              const isSelectable = customer.isActive;
              const inactiveLabel = customer.isActive
                ? ""
                : ` (${messages.common.states.inactive.toLowerCase()})`;

              return (
                <option
                  key={customer.id}
                  value={customer.id}
                  disabled={!isSelectable}
                >
                  {customer.code} - {customer.name}
                  {inactiveLabel}
                </option>
              );
            })}
          </select>
          <p className="text-xs leading-5 text-muted">
            {salesOrderMessages.form.customerHelp}
          </p>
        </Field>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                {salesOrderMessages.form.linesTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {salesOrderMessages.form.linesDescription}
              </p>
              {!hasProducts ? (
                <p className="mt-2 text-sm leading-6 text-warning">
                  {salesOrderMessages.form.productsRequired}
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
              {salesOrderMessages.form.addLine}
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
                    label={interpolateMessage(salesOrderMessages.form.productLabel, {
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
                          ? salesOrderMessages.form.selectProduct
                          : salesOrderMessages.form.noProductsOption}
                      </option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.sku} - {product.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label={salesOrderMessages.form.orderedQuantityLabel}
                    htmlFor={`line-quantity-${line.key}`}
                  >
                    <input
                      id={`line-quantity-${line.key}`}
                      name="lineOrderedQuantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={line.orderedQuantity}
                      onChange={(event) =>
                        setLines((current) =>
                          current.map((candidate) =>
                            candidate.key === line.key
                              ? {
                                  ...candidate,
                                  orderedQuantity: event.target.value,
                                }
                              : candidate,
                          ),
                        )
                      }
                      className={inputClassName}
                      placeholder={salesOrderMessages.form.quantityPlaceholder}
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
                      {salesOrderMessages.form.removeLine}
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
          pendingLabel={salesOrderMessages.form.pending}
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
    orderedQuantity: "",
  };
}

function createEmptyLine(keySuffix: string) {
  return createLine(keySuffix);
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

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toString();
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
