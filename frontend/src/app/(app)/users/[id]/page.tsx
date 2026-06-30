import { notFound } from "next/navigation";

import {
  activateUserAction,
  deactivateUserAction,
  updateUserAction,
} from "@/features/users/user-actions";
import { UserDetailPage } from "@/features/users/user-detail-page";
import { AccessDenied } from "@/features/placeholders/access-denied";
import { getUser } from "@/lib/api/user-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess } from "@/lib/navigation/route-access";

type UserDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function UserDetailRoute({
  params,
  searchParams,
}: UserDetailRouteProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess(`/users/${id}`);

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

  const userResult = await getUser(id);

  if (!userResult.ok) {
    if (userResult.status === 404) {
      notFound();
    }

    return (
      <ApiErrorState
        title={messages.users.route.detailUnavailableTitle}
        message={userResult.message}
        fallbackMessage={messages.users.route.detailUnavailableFallback}
      />
    );
  }

  return (
    <UserDetailPage
      user={userResult.data}
      actionError={readSearchParam(resolvedSearchParams.actionError)}
      updateAction={updateUserAction.bind(null, id)}
      activateAction={activateUserAction}
      deactivateAction={deactivateUserAction}
    />
  );
}

function ApiErrorState({
  title,
  message,
  fallbackMessage,
}: {
  title: string;
  message: string | null;
  fallbackMessage: string;
}) {
  return (
    <section className="rounded-[32px] border border-amber-300 bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warning">
        Backend unavailable
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
