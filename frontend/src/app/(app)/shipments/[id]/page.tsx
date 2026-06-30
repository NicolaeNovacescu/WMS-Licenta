import { notFound } from "next/navigation";

import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelShipmentAction,
  completeShipmentAction,
  startShipmentAction,
} from "@/features/shipment/shipment-actions";
import { ShipmentDetailPage } from "@/features/shipment/shipment-detail-page";
import { getShipment } from "@/lib/api/shipment-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";

type ShipmentDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function ShipmentDetailRoute({
  params,
  searchParams,
}: ShipmentDetailRouteProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess(`/shipments/${id}`);

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

  const shipmentResult = await getShipment(id);

  if (!shipmentResult.ok) {
    if (shipmentResult.status === 404) {
      notFound();
    }

    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.shipments.route.detailUnavailableTitle}
        message={shipmentResult.message}
        fallbackMessage={messages.shipments.route.detailUnavailableFallback}
      />
    );
  }

  return (
    <ShipmentDetailPage
      shipment={shipmentResult.data}
      canExecute={hasRole(access.session.user.roles, "Warehouse")}
      actionError={readSearchParam(resolvedSearchParams.actionError)}
      startAction={startShipmentAction}
      completeAction={completeShipmentAction}
      cancelAction={cancelShipmentAction}
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
