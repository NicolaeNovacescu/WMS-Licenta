"use client";

import Link from "next/link";
import { useActionState, useDeferredValue, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { formatLocalizedQuantity } from "@/lib/format/locale-format";
import { interpolateMessage } from "@/lib/i18n/messages";
import { ProductFilters } from "@/features/products/product-filters";
import { ProductForm } from "@/features/products/product-form";
import type {
  CatalogSetupFormState,
  Product,
  ProductCategory,
  ProductFormState,
  UnitOfMeasure,
} from "@/types/catalog";

const setupInitialState: CatalogSetupFormState = {
  error: null,
  successMessage: null,
};

type ProductListPageProps = {
  products: readonly Product[];
  canManage: boolean;
  categories: readonly ProductCategory[];
  unitsOfMeasure: readonly UnitOfMeasure[];
  createAction: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  createCategoryAction: (
    state: CatalogSetupFormState,
    formData: FormData,
  ) => Promise<CatalogSetupFormState>;
  createUnitOfMeasureAction: (
    state: CatalogSetupFormState,
    formData: FormData,
  ) => Promise<CatalogSetupFormState>;
  adminDataError: string | null;
};

export function ProductListPage({
  products,
  canManage,
  categories,
  unitsOfMeasure,
  createAction,
  createCategoryAction,
  createUnitOfMeasureAction,
  adminDataError,
}: ProductListPageProps) {
  const { locale, messages } = useLocaleContext();
  const productMessages = messages.products;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const deferredSearch = useDeferredValue(search);
  const hasCategories = categories.length > 0;
  const hasUnitsOfMeasure = unitsOfMeasure.length > 0;
  const canCreateProducts = hasCategories && hasUnitsOfMeasure;

  const normalizedQuery = deferredSearch.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      [
        product.sku,
        product.barcode,
        product.name,
        product.categoryName,
        product.unitOfMeasureName,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? product.isActive : !product.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          {productMessages.list.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
          {productMessages.list.title}
        </h1>
      </div>

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={products.length}
        filteredCount={filteredProducts.length}
      />

      <div className={`grid gap-6 ${canManage ? "xl:grid-cols-[1.35fr_0.65fr]" : ""}`}>
        <section className="space-y-4">
          {filteredProducts.length === 0 ? (
            <EmptyState />
          ) : (
            filteredProducts.map((product) => (
              <article
                key={product.id}
                className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                        {product.sku}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {product.isActive
                          ? messages.common.states.active
                          : messages.common.states.inactive}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-ink">
                        {product.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {product.description || productMessages.shared.noDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <Link
                      href={`/products/${product.id}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                    >
                      {productMessages.list.viewDetails}
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoCard
                    label={productMessages.shared.barcode}
                    value={product.barcode || productMessages.shared.notSet}
                  />
                  <InfoCard
                    label={productMessages.shared.category}
                    value={product.categoryName}
                  />
                  <InfoCard
                    label={productMessages.shared.unitOfMeasure}
                    value={product.unitOfMeasureName}
                  />
                  <InfoCard
                    label={productMessages.shared.pickingBaseline}
                    value={interpolateMessage(
                      productMessages.shared.pickingBaselineTemplate,
                      {
                        min: formatLocalizedQuantity(
                          product.defaultMinPickingThreshold,
                          locale,
                        ),
                        target: formatLocalizedQuantity(
                          product.defaultTargetPickingQuantity,
                          locale,
                        ),
                      },
                    )}
                  />
                </div>
              </article>
            ))
          )}
        </section>

        {canManage ? (
          <div className="space-y-6">
            {adminDataError ? (
              <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm text-ink">
                {adminDataError}
              </div>
            ) : null}

            {!adminDataError ? (
              <>
                <CatalogPrerequisiteSetup
                  categories={categories}
                  unitsOfMeasure={unitsOfMeasure}
                  createCategoryAction={createCategoryAction}
                  createUnitOfMeasureAction={createUnitOfMeasureAction}
                />

                {canCreateProducts ? (
                  <ProductForm
                    action={createAction}
                    categories={categories}
                    unitsOfMeasure={unitsOfMeasure}
                    submitLabel={productMessages.list.createSubmit}
                    title={productMessages.list.createTitle}
                    description={productMessages.list.createDescription}
                  />
                ) : (
                  <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm leading-6 text-ink">
                    {productMessages.setup.productCreationLocked}
                  </div>
                )}
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CatalogPrerequisiteSetup({
  categories,
  unitsOfMeasure,
  createCategoryAction,
  createUnitOfMeasureAction,
}: {
  categories: readonly ProductCategory[];
  unitsOfMeasure: readonly UnitOfMeasure[];
  createCategoryAction: (
    state: CatalogSetupFormState,
    formData: FormData,
  ) => Promise<CatalogSetupFormState>;
  createUnitOfMeasureAction: (
    state: CatalogSetupFormState,
    formData: FormData,
  ) => Promise<CatalogSetupFormState>;
}) {
  const { messages } = useLocaleContext();
  const setupMessages = messages.products.setup;
  const [categoryState, categoryAction] = useActionState(
    createCategoryAction,
    setupInitialState,
  );
  const [unitState, unitAction] = useActionState(
    createUnitOfMeasureAction,
    setupInitialState,
  );
  const hasCategories = categories.length > 0;
  const hasUnitsOfMeasure = unitsOfMeasure.length > 0;
  const statusMessage = getPrerequisiteStatusMessage(
    hasCategories,
    hasUnitsOfMeasure,
    setupMessages,
  );

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
        {setupMessages.eyebrow}
      </p>
      <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink">
        {setupMessages.title}
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoCard
          label={setupMessages.categoriesLabel}
          value={interpolateMessage(setupMessages.countTemplate, {
            count: categories.length,
          })}
        />
        <InfoCard
          label={setupMessages.unitsLabel}
          value={interpolateMessage(setupMessages.countTemplate, {
            count: unitsOfMeasure.length,
          })}
        />
      </div>

      <p
        className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${
          hasCategories && hasUnitsOfMeasure
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-300 bg-warning-soft text-ink"
        }`}
      >
        {statusMessage}
      </p>

      <div className="mt-5 grid gap-4">
        <PrerequisiteForm
          action={categoryAction}
          state={categoryState}
          inputId="product-category-name"
          label={setupMessages.categoryNameLabel}
          placeholder={setupMessages.categoryNamePlaceholder}
          submitLabel={setupMessages.createCategorySubmit}
          pendingLabel={setupMessages.pending}
          maxLength={100}
        />
        <PrerequisiteForm
          action={unitAction}
          state={unitState}
          inputId="unit-of-measure-name"
          label={setupMessages.unitNameLabel}
          placeholder={setupMessages.unitNamePlaceholder}
          submitLabel={setupMessages.createUnitSubmit}
          pendingLabel={setupMessages.pending}
          maxLength={50}
        />
      </div>
    </section>
  );
}

function PrerequisiteForm({
  action,
  state,
  inputId,
  label,
  placeholder,
  submitLabel,
  pendingLabel,
  maxLength,
}: {
  action: (formData: FormData) => void;
  state: CatalogSetupFormState;
  inputId: string;
  label: string;
  placeholder: string;
  submitLabel: string;
  pendingLabel: string;
  maxLength: number;
}) {
  return (
    <form action={action} className="rounded-2xl border border-line bg-surface px-4 py-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-2">
          <label
            htmlFor={inputId}
            className="text-sm font-semibold tracking-wide text-ink"
          >
            {label}
          </label>
          <input
            id={inputId}
            name="name"
            type="text"
            maxLength={maxLength}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            placeholder={placeholder}
          />
        </div>

        <SetupSubmitButton label={submitLabel} pendingLabel={pendingLabel} />
      </div>

      {state.error ? (
        <div className="mt-3 rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
          {state.error}
        </div>
      ) : null}
    </form>
  );
}

function SetupSubmitButton({
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
      className="inline-flex h-[46px] items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function getPrerequisiteStatusMessage(
  hasCategories: boolean,
  hasUnitsOfMeasure: boolean,
  setupMessages: ReturnType<typeof useLocaleContext>["messages"]["products"]["setup"],
) {
  if (hasCategories && hasUnitsOfMeasure) {
    return setupMessages.ready;
  }

  if (!hasCategories && !hasUnitsOfMeasure) {
    return setupMessages.missingBoth;
  }

  return hasCategories
    ? setupMessages.missingUnits
    : setupMessages.missingCategories;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function EmptyState() {
  const { messages } = useLocaleContext();

  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {messages.products.list.emptyEyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        {messages.products.list.emptyMessage}
      </p>
    </div>
  );
}
