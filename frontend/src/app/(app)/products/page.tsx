import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  createProductAction,
  createProductCategoryAction,
  createUnitOfMeasureAction,
} from "@/features/products/actions";
import { ProductListPage } from "@/features/products/product-list-page";
import {
  listProductCategories,
  listProducts,
  listUnitsOfMeasure,
} from "@/lib/api/catalog-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { ProductCategory, UnitOfMeasure } from "@/types/catalog";

export default async function ProductsPage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/products");

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

  const productsResult = await listProducts();

  if (!productsResult.ok) {
    return (
      <ApiErrorState
        title={messages.products.route.listUnavailableTitle}
        message={productsResult.message}
        fallbackMessage={messages.products.route.listUnavailableFallback}
      />
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
    <ProductListPage
      products={productsResult.data}
      canManage={canManage}
      categories={categories}
      unitsOfMeasure={unitsOfMeasure}
      createAction={createProductAction}
      createCategoryAction={createProductCategoryAction}
      createUnitOfMeasureAction={createUnitOfMeasureAction}
      adminDataError={adminDataError}
    />
  );
}

function ApiErrorState({
  title,
  message,
  fallbackMessage,
}: {
  title: string;
  message: string | null;
  fallbackMessage: string;
}) {
  return (
    <section className="rounded-[32px] border border-amber-300 bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warning">
        Backend unavailable
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        {message ?? fallbackMessage}
      </p>
    </section>
  );
}
