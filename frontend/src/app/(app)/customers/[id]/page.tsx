import { notFound } from "next/navigation";

import {
  activateCustomerAction,
  deactivateCustomerAction,
  updateCustomerAction,
} from "@/features/customers/customer-actions";
import { CustomerDetailPage } from "@/features/customers/customer-detail-page";
import { AccessDenied } from "@/features/placeholders/access-denied";
import { getCustomer } from "@/lib/api/customer-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess } from "@/lib/navigation/route-access";

type CustomerDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function CustomerDetailRoute({
  params,
  searchParams,
}: CustomerDetailRouteProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const access = await getPageAccess(`/customers/${id}`);

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

  const customerResult = await getCustomer(id);

  if (!customerResult.ok) {
    if (customerResult.status === 404) {
      notFound();
    }

    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.customers.route.detailUnavailableTitle}
        message={customerResult.message}
        fallbackMessage={messages.customers.route.detailUnavailableFallback}
      />
    );
  }

  return (
    <CustomerDetailPage
      customer={customerResult.data}
      actionError={readSearchParam(resolvedSearchParams.actionError)}
      updateAction={updateCustomerAction.bind(null, id)}
      activateAction={activateCustomerAction}
      deactivateAction={deactivateCustomerAction}
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
