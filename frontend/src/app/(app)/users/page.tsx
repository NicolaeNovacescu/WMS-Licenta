import {
  activateUserAction,
  createUserAction,
  deactivateUserAction,
} from "@/features/users/user-actions";
import { UsersPage } from "@/features/users/users-page";
import { AccessDenied } from "@/features/placeholders/access-denied";
import { listUsers } from "@/lib/api/user-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess } from "@/lib/navigation/route-access";

type UsersRoutePageProps = {
  searchParams: Promise<{
    actionError?: string | string[];
  }>;
};

export default async function UsersRoutePage({
  searchParams,
}: UsersRoutePageProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/users");

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

  const usersResult = await listUsers();

  if (!usersResult.ok) {
    return (
      <ApiErrorState
        title={messages.users.route.listUnavailableTitle}
        message={usersResult.message}
        fallbackMessage={messages.users.route.listUnavailableFallback}
      />
    );
  }

  const resolvedSearchParams = await searchParams;

  return (
    <UsersPage
      currentRoles={access.currentRoles}
      users={usersResult.data}
      actionError={readSearchParam(resolvedSearchParams.actionError)}
      createAction={createUserAction}
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
