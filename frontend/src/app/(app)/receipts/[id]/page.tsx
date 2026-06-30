import { notFound } from "next/navigation";

import { AccessDenied } from "@/features/placeholders/access-denied";
import {
  cancelReceiptAction,
  confirmReceiptAction,
  startReceiptAction,
} from "@/features/inbound/receipt-actions";
import { ReceiptDetailPage } from "@/features/inbound/receipt-detail-page";
import { getInboundOrder, getReceipt } from "@/lib/api/inbound-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess } from "@/lib/navigation/route-access";

type ReceiptDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function ReceiptDetailRoute({
  params,
  searchParams,
}: ReceiptDetailRouteProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const access = await getPageAccess(`/receipts/${id}`);

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

  const receiptResult = await getReceipt(id);

  if (!receiptResult.ok) {
    if (receiptResult.status === 404) {
      notFound();
    }

    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.receipts.route.detailUnavailableTitle}
        message={receiptResult.message}
        fallbackMessage={messages.receipts.route.detailUnavailableFallback}
      />
    );
  }

  const inboundOrderResult = await getInboundOrder(receiptResult.data.inboundOrderId);
  const linkedInboundOrder = inboundOrderResult.ok ? inboundOrderResult.data : null;

  return (
    <ReceiptDetailPage
      receipt={receiptResult.data}
      inboundOrder={linkedInboundOrder}
      startAction={startReceiptAction.bind(null, id, `/receipts/${id}`)}
      confirmAction={confirmReceiptAction.bind(null, id, `/receipts/${id}`)}
      cancelAction={cancelReceiptAction.bind(null, id, `/receipts/${id}`)}
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
