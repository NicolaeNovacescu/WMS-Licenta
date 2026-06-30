import { AccessDenied } from "@/features/placeholders/access-denied";
import { LocationListPage } from "@/features/warehouse-structure/location-list-page";
import { listLocations } from "@/lib/api/warehouse-structure-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";

export default async function LocationsPage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/locations");

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

  const locationsResult = await listLocations();

  if (!locationsResult.ok) {
    return (
      <section className="rounded-[32px] border border-amber-300 bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warning">
          {messages.common.backendUnavailable}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          {messages.locations.route.listUnavailableTitle}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          {locationsResult.message ?? messages.locations.route.listUnavailableFallback}
        </p>
      </section>
    );
  }

  return (
    <LocationListPage
      locations={locationsResult.data}
      canManage={hasRole(access.session.user.roles, "Admin")}
    />
  );
}
