import { notFound } from "next/navigation";

import { AuditLogDetailPage } from "@/features/audit/audit-log-detail-page";
import { AccessDenied } from "@/features/placeholders/access-denied";
import { getAuditLog } from "@/lib/api/audit-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess } from "@/lib/navigation/route-access";

type AuditLogDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AuditLogDetailRoute({
  params,
}: AuditLogDetailRouteProps) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const auditLogMessages = messages.auditLogs;
  const access = await getPageAccess(`/audit-logs/${id}`);

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

  const auditLogResult = await getAuditLog(id);

  if (!auditLogResult.ok) {
    if (auditLogResult.status === 404) {
      notFound();
    }

    return (
      <ApiErrorState
        eyebrow={messages.common.backendUnavailable}
        title={auditLogMessages.route.detailUnavailableTitle}
        message={auditLogResult.message}
        fallbackMessage={auditLogMessages.route.detailUnavailableFallback}
      />
    );
  }

  return <AuditLogDetailPage auditLog={auditLogResult.data} />;
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
