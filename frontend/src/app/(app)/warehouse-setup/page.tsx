import { AccessDenied } from "@/features/placeholders/access-denied";
import { WarehouseSetupPage } from "@/features/warehouse-structure/warehouse-setup-page";
import {
  listLocations,
  listWarehouses,
  listZones,
} from "@/lib/api/warehouse-structure-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess } from "@/lib/navigation/route-access";

export default async function WarehouseSetupRoute() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess("/warehouse-setup");

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

  const [warehousesResult, zonesResult, locationsResult] = await Promise.all([
    listWarehouses(),
    listZones(),
    listLocations(),
  ]);

  if (!warehousesResult.ok || !zonesResult.ok || !locationsResult.ok) {
    const errorMessage = !warehousesResult.ok
      ? warehousesResult.message
      : !zonesResult.ok
        ? zonesResult.message
        : !locationsResult.ok
          ? locationsResult.message
          : null;

    return (
      <section className="rounded-[32px] border border-amber-300 bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warning">
          {messages.warehouseSetup.route.unavailableEyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          {messages.warehouseSetup.route.unavailableTitle}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          {errorMessage ?? messages.warehouseSetup.route.unavailableFallback}
        </p>
      </section>
    );
  }

  return (
    <WarehouseSetupPage
      warehouses={warehousesResult.data}
      zones={zonesResult.data}
      locations={locationsResult.data}
    />
  );
}
