import { notFound } from "next/navigation";

import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelInboundOrderAction,
  markInboundOrderReadyAction,
  updateInboundOrderAction,
} from "@/features/inbound/inbound-orders-actions";
import { InboundOrderDetailPage } from "@/features/inbound/inbound-order-detail-page";
import { getInboundOrder } from "@/lib/api/inbound-api";
import { listProducts } from "@/lib/api/catalog-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { listSuppliers } from "@/lib/api/supplier-api";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { Product } from "@/types/catalog";
import type { ManagedSupplier } from "@/types/supplier";

type InboundOrderDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function InboundOrderDetailRoute({
  params,
  searchParams,
}: InboundOrderDetailRouteProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const access = await getPageAccess(`/inbound-orders/${id}`);

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

  const inboundOrderResult = await getInboundOrder(id);

  if (!inboundOrderResult.ok) {
    if (inboundOrderResult.status === 404) {
      notFound();
    }

    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.inboundOrders.route.detailUnavailableTitle}
        message={inboundOrderResult.message}
        fallbackMessage={messages.inboundOrders.route.detailUnavailableFallback}
      />
    );
  }

  const canManage = hasRole(access.session.user.roles, "Admin");
  const canCreateReceipt =
    hasRole(access.session.user.roles, "Warehouse") &&
    (inboundOrderResult.data.status === "ReadyForReceipt" ||
      inboundOrderResult.data.status === "PartiallyReceived") &&
    inboundOrderResult.data.lines.some(
      (line) => line.expectedQuantity - line.receivedQuantity > 0,
    );

  let products: Product[] = [];
  let suppliers: ManagedSupplier[] = [];
  let adminDataError: string | null = null;

  if (canManage) {
    const [productsResult, suppliersResult] = await Promise.all([
      listProducts(),
      listSuppliers(),
    ]);

    if (!productsResult.ok) {
      adminDataError =
        productsResult.message ??
        messages.inboundOrders.route.editProductsFallback;
    } else if (!suppliersResult.ok) {
      adminDataError =
        suppliersResult.message ??
        messages.inboundOrders.route.editSuppliersFallback;
    } else {
      products = productsResult.data;
      suppliers = suppliersResult.data;
    }
  }

  return (
    <InboundOrderDetailPage
      inboundOrder={inboundOrderResult.data}
      canManage={canManage}
      canCreateReceipt={canCreateReceipt}
      products={products}
      suppliers={suppliers}
      updateAction={updateInboundOrderAction.bind(null, id)}
      markReadyAction={markInboundOrderReadyAction.bind(
        null,
        id,
        `/inbound-orders/${id}`,
      )}
      cancelAction={cancelInboundOrderAction.bind(
        null,
        id,
        `/inbound-orders/${id}`,
      )}
      adminDataError={adminDataError}
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
