import {
  activateCustomerAction,
  createCustomerAction,
  deactivateCustomerAction,
} from "@/features/customers/customer-actions";
import { CustomersPage } from "@/features/customers/customers-page";
import { AccessDenied } from "@/features/placeholders/access-denied";
import { listCustomers } from "@/lib/api/customer-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess } from "@/lib/navigation/route-access";

type CustomersRoutePageProps = {
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function CustomersRoutePage({
  searchParams,
}: CustomersRoutePageProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/customers");

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

  const customersResult = await listCustomers();

  if (!customersResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.customers.route.listUnavailableTitle}
        message={customersResult.message}
        fallbackMessage={messages.customers.route.listUnavailableFallback}
      />
    );
  }

  const resolvedSearchParams = await searchParams;

  return (
    <CustomersPage
      customers={customersResult.data}
      actionError={readSearchParam(resolvedSearchParams.actionError)}
      createAction={createCustomerAction}
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
