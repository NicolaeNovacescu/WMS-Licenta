import { AccessDenied } from "@/features/placeholders/access-denied";
import { createReceiptAction } from "@/features/inbound/receipt-actions";
import { ReceiptsPage } from "@/features/inbound/receipts-page";
import { listInboundOrders, listReceipts } from "@/lib/api/inbound-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { listLocations } from "@/lib/api/warehouse-structure-api";
import { getPageAccess } from "@/lib/navigation/route-access";
import type { Location } from "@/types/warehouse-structure";

type ReceiptsRoutePageProps = {
  searchParams: Promise<{
    inboundOrderId?: string | string[];
  }>;
};

export default async function ReceiptsRoutePage({
  searchParams,
}: ReceiptsRoutePageProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const resolvedSearchParams = await searchParams;
  const access = await getPageAccess("/receipts");

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

  const receiptsResult = await listReceipts();

  if (!receiptsResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.receipts.route.listUnavailableTitle}
        message={receiptsResult.message}
        fallbackMessage={messages.receipts.route.listUnavailableFallback}
      />
    );
  }

  const [inboundOrdersResult, locationsResult] = await Promise.all([
    listInboundOrders(),
    listLocations(),
  ]);

  const inboundOrders = inboundOrdersResult.ok ? inboundOrdersResult.data : [];
  const receivingLocations: Location[] = locationsResult.ok
    ? locationsResult.data.filter(
        (location) =>
          location.isActive &&
          !location.isBlocked &&
          location.locationType.toUpperCase() === "RECEIVING",
      )
    : [];
  const createDataError = !inboundOrdersResult.ok
    ? inboundOrdersResult.message ??
      messages.receipts.route.createInboundOrdersFallback
    : !locationsResult.ok
      ? locationsResult.message ??
        messages.receipts.route.createLocationsFallback
      : null;

  return (
    <ReceiptsPage
      receipts={receiptsResult.data}
      inboundOrders={inboundOrders}
      receivingLocations={receivingLocations}
      createAction={createReceiptAction}
      createDataError={createDataError}
      preselectedInboundOrderId={readSearchParam(resolvedSearchParams.inboundOrderId)}
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
