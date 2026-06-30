import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelSalesOrderAction,
  confirmSalesOrderAction,
  createSalesOrderAction,
} from "@/features/sales/sales-order-actions";
import { SalesOrdersPage } from "@/features/sales/sales-orders-page";
import { listProducts } from "@/lib/api/catalog-api";
import { listCustomers } from "@/lib/api/customer-api";
import { listSalesOrders } from "@/lib/api/sales-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { Product } from "@/types/catalog";
import type { ManagedCustomer } from "@/types/customer";

type SalesOrdersRoutePageProps = {
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function SalesOrdersRoutePage({
  searchParams,
}: SalesOrdersRoutePageProps) {
  const resolvedSearchParams = await searchParams;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/sales-orders");

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

  const salesOrdersResult = await listSalesOrders();

  if (!salesOrdersResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.salesOrders.route.listUnavailableTitle}
        message={salesOrdersResult.message}
        fallbackMessage={messages.salesOrders.route.listUnavailableFallback}
      />
    );
  }

  const canCreate =
    hasRole(access.session.user.roles, "Sales") ||
    hasRole(access.session.user.roles, "Admin");

  let products: Product[] = [];
  let customers: ManagedCustomer[] = [];
  let createDataError: string | null = null;

  if (canCreate) {
    const [productsResult, customersResult] = await Promise.all([
      listProducts(),
      listCustomers(),
    ]);

    if (!productsResult.ok) {
      createDataError =
        productsResult.message ??
        messages.salesOrders.route.createProductsFallback;
    } else if (!customersResult.ok) {
      createDataError =
        customersResult.message ??
        messages.salesOrders.route.createCustomersFallback;
    } else {
      products = [...productsResult.data].sort((left, right) =>
        left.sku.localeCompare(right.sku),
      );
      customers = [...customersResult.data].sort((left, right) =>
        left.code.localeCompare(right.code),
      );
    }
  }

  return (
    <SalesOrdersPage
      currentRoles={access.currentRoles}
      salesOrders={salesOrdersResult.data}
      customers={customers}
      products={products}
      canCreate={canCreate}
      canConfirm={hasRole(access.session.user.roles, "Sales")}
      canCancel={
        hasRole(access.session.user.roles, "Sales") ||
        hasRole(access.session.user.roles, "Admin")
      }
      createAction={createSalesOrderAction}
      confirmAction={confirmSalesOrderAction}
      cancelAction={cancelSalesOrderAction}
      createDataError={createDataError}
      actionError={readSearchParam(resolvedSearchParams.actionError)}
    />
  );
}

function ApiErrorState({
  eyebrow,
  title,
  message,
  fallbackMessage,
}: {
  eyebrow: string;
  title: string;
  message: string | null;
  fallbackMessage: string;
}) {
  return (
    <section className="rounded-[32px] border border-amber-300 bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warning">
        {eyebrow}
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

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}
