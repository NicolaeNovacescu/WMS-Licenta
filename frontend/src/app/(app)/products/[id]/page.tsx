import { notFound } from "next/navigation";

import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  deactivateProductAction,
  updateProductAction,
} from "@/features/products/actions";
import { ProductDetailPage } from "@/features/products/product-detail-page";
import {
  getProduct,
  listProductCategories,
  listUnitsOfMeasure,
} from "@/lib/api/catalog-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { ProductCategory, UnitOfMeasure } from "@/types/catalog";

type ProductDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailRoute({
  params,
}: ProductDetailRouteProps) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess(`/products/${id}`);

  if (!access) {
    return null;
  }

  if (!access.canAccess) {
    return (
      <AccessDenied
        title={access.page.label}
        allowedRoles={access.allowedRoles}
        currentRoles={access.currentRoles}
      />
    );
  }

  const productResult = await getProduct(id);

  if (!productResult.ok) {
    if (productResult.status === 404) {
      notFound();
    }

    return (
      <section className="rounded-[32px] border border-amber-300 bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warning">
          {messages.common.backendUnavailable}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          {messages.products.route.detailUnavailableTitle}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          {productResult.message ?? messages.products.route.detailUnavailableFallback}
        </p>
      </section>
    );
  }

  const canManage = hasRole(access.session.user.roles, "Admin");
  let categories: ProductCategory[] = [];
  let unitsOfMeasure: UnitOfMeasure[] = [];
  let adminDataError: string | null = null;

  if (canManage) {
    const [categoriesResult, unitsResult] = await Promise.all([
      listProductCategories(),
      listUnitsOfMeasure(),
    ]);

    if (!categoriesResult.ok) {
      adminDataError =
        categoriesResult.message ??
        messages.products.route.categoriesFallback;
    } else if (!unitsResult.ok) {
      adminDataError =
        unitsResult.message ??
        messages.products.route.unitsFallback;
    } else {
      categories = categoriesResult.data;
      unitsOfMeasure = unitsResult.data;
    }
  }

  return (
    <ProductDetailPage
      product={productResult.data}
      canManage={canManage}
      categories={categories}
      unitsOfMeasure={unitsOfMeasure}
      updateAction={updateProductAction.bind(null, id)}
      deactivateAction={deactivateProductAction.bind(null, id)}
      adminDataError={adminDataError}
    />
  );
}
