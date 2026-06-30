import Link from "next/link";

import { ProductForm } from "@/features/products/product-form";
import { formatLocalizedQuantity } from "@/lib/format/locale-format";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, interpolateMessage } from "@/lib/i18n/messages";
import type {
  Product,
  ProductCategory,
  ProductFormState,
  UnitOfMeasure,
} from "@/types/catalog";

type ProductDetailPageProps = {
  product: Product;
  canManage: boolean;
  categories: readonly ProductCategory[];
  unitsOfMeasure: readonly UnitOfMeasure[];
  updateAction: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  deactivateAction: () => Promise<void>;
  adminDataError: string | null;
};

export async function ProductDetailPage({
  product,
  canManage,
  categories,
  unitsOfMeasure,
  updateAction,
  deactivateAction,
  adminDataError,
}: ProductDetailPageProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const productMessages = messages.products;

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
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

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {product.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
              {product.description || productMessages.shared.noDescription}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {productMessages.detail.backToProducts}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat
            label={productMessages.shared.barcode}
            value={product.barcode || productMessages.shared.notSet}
          />
          <Stat label={productMessages.shared.category} value={product.categoryName} />
          <Stat
            label={productMessages.shared.unitOfMeasure}
            value={product.unitOfMeasureName}
          />
          <Stat
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
      </div>

      <div className={`grid gap-6 ${canManage ? "xl:grid-cols-[1fr_0.8fr]" : ""}`}>
        <section className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            {productMessages.detail.referenceEyebrow}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailRow
              label={productMessages.detail.imageUrl}
              value={product.imageUrl || productMessages.shared.notSet}
            />
            <DetailRow
              label={productMessages.detail.productId}
              value={product.id}
              mono
            />
            <DetailRow
              label={productMessages.detail.categoryId}
              value={product.categoryId}
              mono
            />
            <DetailRow
              label={productMessages.detail.unitOfMeasureId}
              value={product.unitOfMeasureId}
              mono
            />
          </div>
        </section>

        {canManage ? (
          <div className="space-y-6">
            {adminDataError ? (
              <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm text-ink">
                {adminDataError}
              </div>
            ) : null}

            {categories.length > 0 && unitsOfMeasure.length > 0 ? (
              <ProductForm
                action={updateAction}
                categories={categories}
                unitsOfMeasure={unitsOfMeasure}
                submitLabel={productMessages.detail.saveChangesSubmit}
                title={productMessages.detail.editTitle}
                description={productMessages.detail.editDescription}
                product={product}
              />
            ) : null}

            <section className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warning">
                {productMessages.detail.deactivationEyebrow}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {productMessages.detail.deactivationDescription}
              </p>

              <form action={deactivateAction} className="mt-5">
                <button
                  type="submit"
                  disabled={!product.isActive}
                  className="inline-flex items-center justify-center rounded-2xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {product.isActive
                    ? productMessages.detail.deactivateButton
                    : productMessages.detail.alreadyInactive}
                </button>
              </form>
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-sm font-medium text-ink">{value}</p>
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
