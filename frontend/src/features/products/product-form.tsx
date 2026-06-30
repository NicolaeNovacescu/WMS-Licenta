"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import type {
  Product,
  ProductCategory,
  ProductFormState,
  UnitOfMeasure,
} from "@/types/catalog";

const initialState: ProductFormState = {
  error: null,
  successMessage: null,
};

type ProductFormProps = {
  action: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  categories: readonly ProductCategory[];
  unitsOfMeasure: readonly UnitOfMeasure[];
  submitLabel: string;
  title: string;
  description: string;
  product?: Product;
};

export function ProductForm({
  action,
  categories,
  unitsOfMeasure,
  submitLabel,
  title,
  product,
}: ProductFormProps) {
  const { messages } = useLocaleContext();
  const productMessages = messages.products;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {title}
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={productMessages.form.skuLabel} htmlFor="sku">
            <input
              id="sku"
              name="sku"
              type="text"
              defaultValue={product?.sku ?? ""}
              className={inputClassName}
              placeholder={productMessages.form.skuPlaceholder}
            />
          </Field>

          <Field label={productMessages.form.barcodeLabel} htmlFor="barcode">
            <>
              <input
                id="barcode"
                name="barcode"
                type="text"
                defaultValue={product?.barcode ?? ""}
                className={inputClassName}
                placeholder={productMessages.form.barcodePlaceholder}
                maxLength={100}
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-xs leading-6 text-muted">
                {productMessages.form.barcodeHint}
              </p>
            </>
          </Field>
        </div>

        <Field label={productMessages.form.nameLabel} htmlFor="name">
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={product?.name ?? ""}
            className={inputClassName}
            placeholder={productMessages.form.namePlaceholder}
          />
        </Field>

        <Field label={productMessages.form.descriptionLabel} htmlFor="description">
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product?.description ?? ""}
            className={`${inputClassName} min-h-28 resize-y`}
            placeholder={productMessages.form.descriptionPlaceholder}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={productMessages.form.categoryLabel} htmlFor="categoryId">
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product?.categoryId ?? categories[0]?.id ?? ""}
              className={inputClassName}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={productMessages.form.unitOfMeasureLabel}
            htmlFor="unitOfMeasureId"
          >
            <select
              id="unitOfMeasureId"
              name="unitOfMeasureId"
              defaultValue={product?.unitOfMeasureId ?? unitsOfMeasure[0]?.id ?? ""}
              className={inputClassName}
            >
              {unitsOfMeasure.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={productMessages.form.imageUrlLabel} htmlFor="imageUrl">
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            defaultValue={product?.imageUrl ?? ""}
            className={inputClassName}
            placeholder={productMessages.form.imageUrlPlaceholder}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={productMessages.form.defaultMinPickingThresholdLabel}
            htmlFor="defaultMinPickingThreshold"
          >
            <input
              id="defaultMinPickingThreshold"
              name="defaultMinPickingThreshold"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.defaultMinPickingThreshold ?? 0}
              className={inputClassName}
            />
          </Field>

          <Field
            label={productMessages.form.defaultTargetPickingQuantityLabel}
            htmlFor="defaultTargetPickingQuantity"
          >
            <input
              id="defaultTargetPickingQuantity"
              name="defaultTargetPickingQuantity"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.defaultTargetPickingQuantity ?? 0}
              className={inputClassName}
            />
          </Field>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={product?.isActive ?? true}
            className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
          />
          {productMessages.form.isActiveLabel}
        </label>

        {state.error ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {state.error}
          </div>
        ) : null}

        <SubmitButton label={submitLabel} />
      </form>
    </section>
  );
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

function SubmitButton({ label }: { label: string }) {
  const { messages } = useLocaleContext();
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? messages.products.form.pending : label}
    </button>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
