import {
  activateSupplierAction,
  createSupplierAction,
  deactivateSupplierAction,
} from "@/features/suppliers/supplier-actions";
import { SuppliersPage } from "@/features/suppliers/suppliers-page";
import { AccessDenied } from "@/features/placeholders/access-denied";
import { listSuppliers } from "@/lib/api/supplier-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess } from "@/lib/navigation/route-access";

type SuppliersRoutePageProps = {
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function SuppliersRoutePage({
  searchParams,
}: SuppliersRoutePageProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/suppliers");

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

  const suppliersResult = await listSuppliers();

  if (!suppliersResult.ok) {
    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={messages.suppliers.route.listUnavailableTitle}
        message={suppliersResult.message}
        fallbackMessage={messages.suppliers.route.listUnavailableFallback}
      />
    );
  }

  const resolvedSearchParams = await searchParams;

  return (
    <SuppliersPage
      suppliers={suppliersResult.data}
      actionError={readSearchParam(resolvedSearchParams.actionError)}
      createAction={createSupplierAction}
      activateAction={activateSupplierAction}
      deactivateAction={deactivateSupplierAction}
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
