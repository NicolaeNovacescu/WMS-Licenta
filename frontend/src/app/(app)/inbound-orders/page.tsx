import { AccessDenied } from "@/features/placeholders/access-denied";
import { createInboundOrderAction } from "@/features/inbound/inbound-orders-actions";
import { InboundOrdersPage } from "@/features/inbound/inbound-orders-page";
import { listInboundOrders } from "@/lib/api/inbound-api";
import { listProducts } from "@/lib/api/catalog-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { listSuppliers } from "@/lib/api/supplier-api";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { Product } from "@/types/catalog";
import type { ManagedSupplier } from "@/types/supplier";

export default async function InboundOrdersRoutePage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/inbound-orders");

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

  const inboundOrdersResult = await listInboundOrders();

  if (!inboundOrdersResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.inboundOrders.route.listUnavailableTitle}
        message={inboundOrdersResult.message}
        fallbackMessage={messages.inboundOrders.route.listUnavailableFallback}
      />
    );
  }

  const canManage = hasRole(access.session.user.roles, "Admin");
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
        messages.inboundOrders.route.createProductsFallback;
    } else if (!suppliersResult.ok) {
      adminDataError =
        suppliersResult.message ??
        messages.inboundOrders.route.createSuppliersFallback;
    } else {
      products = productsResult.data;
      suppliers = suppliersResult.data;
    }
  }

  return (
    <InboundOrdersPage
      inboundOrders={inboundOrdersResult.data}
      canManage={canManage}
      products={products}
      suppliers={suppliers}
      createAction={createInboundOrderAction}
      adminDataError={adminDataError}
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
