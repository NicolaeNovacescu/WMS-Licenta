import { notFound } from "next/navigation";

import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelSalesOrderAction,
  confirmSalesOrderAction,
  updateSalesOrderAction,
} from "@/features/sales/sales-order-actions";
import { SalesOrderDetailPage } from "@/features/sales/sales-order-detail-page";
import { listProducts } from "@/lib/api/catalog-api";
import { listCustomers } from "@/lib/api/customer-api";
import { getSalesOrder } from "@/lib/api/sales-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { Product } from "@/types/catalog";
import type { ManagedCustomer } from "@/types/customer";

type SalesOrderDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function SalesOrderDetailRoute({
  params,
  searchParams,
}: SalesOrderDetailRouteProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess(`/sales-orders/${id}`);

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

  const salesOrderResult = await getSalesOrder(id);

  if (!salesOrderResult.ok) {
    if (salesOrderResult.status === 404) {
      notFound();
    }

    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.salesOrders.route.detailUnavailableTitle}
        message={salesOrderResult.message}
        fallbackMessage={messages.salesOrders.route.detailUnavailableFallback}
      />
    );
  }

  const canManageDrafts =
    hasRole(access.session.user.roles, "Sales") ||
    hasRole(access.session.user.roles, "Admin");
  const canEditDraft =
    canManageDrafts && salesOrderResult.data.status === "Draft";

  let products: Product[] = [];
  let customers: ManagedCustomer[] = [];
  let editDataError: string | null = null;

  if (canEditDraft) {
    const [productsResult, customersResult] = await Promise.all([
      listProducts(),
      listCustomers(),
    ]);

    if (!productsResult.ok) {
      editDataError =
        productsResult.message ??
        messages.salesOrders.route.editProductsFallback;
    } else if (!customersResult.ok) {
      editDataError =
        customersResult.message ??
        messages.salesOrders.route.editCustomersFallback;
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
    <SalesOrderDetailPage
      salesOrder={salesOrderResult.data}
      customers={customers}
      products={products}
      canEditDraft={canEditDraft && !editDataError}
      canConfirm={hasRole(access.session.user.roles, "Sales")}
      canCancel={
        hasRole(access.session.user.roles, "Sales") ||
        hasRole(access.session.user.roles, "Admin")
      }
      actionError={readSearchParam(resolvedSearchParams.actionError)}
      editDataError={editDataError}
      updateAction={updateSalesOrderAction}
      confirmAction={confirmSalesOrderAction}
      cancelAction={cancelSalesOrderAction}
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
