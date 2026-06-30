import { notFound } from "next/navigation";

import { AccessDenied } from "@/features/placeholders/access-denied";
import { LocationDetailPage } from "@/features/warehouse-structure/location-detail-page";
import { updateLocationAction } from "@/features/warehouse-structure/actions";
import {
  getLocation,
  listWarehouses,
  listZones,
} from "@/lib/api/warehouse-structure-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getPageAccess, hasRole } from "@/lib/navigation/route-access";
import type { Warehouse, Zone } from "@/types/warehouse-structure";

type LocationDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LocationDetailRoute({
  params,
}: LocationDetailRouteProps) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const access = await getPageAccess(`/locations/${id}`);

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

  const locationResult = await getLocation(id);

  if (!locationResult.ok) {
    if (locationResult.status === 404) {
      notFound();
    }

    return (
      <section className="rounded-[32px] border border-amber-300 bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-warning">
          {messages.common.backendUnavailable}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          {messages.locations.route.detailUnavailableTitle}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          {locationResult.message ?? messages.locations.route.detailUnavailableFallback}
        </p>
      </section>
    );
  }

  const canManage = hasRole(access.session.user.roles, "Admin");
  let warehouses: Warehouse[] = [];
  let zones: Zone[] = [];
  let adminDataError: string | null = null;

  if (canManage) {
    const [warehousesResult, zonesResult] = await Promise.all([
      listWarehouses(),
      listZones(),
    ]);

    if (!warehousesResult.ok) {
      adminDataError =
        warehousesResult.message ??
        messages.locations.route.warehousesFallback;
    } else if (!zonesResult.ok) {
      adminDataError =
        zonesResult.message ??
        messages.locations.route.zonesFallback;
    } else {
      warehouses = warehousesResult.data;
      zones = zonesResult.data;
    }
  }

  return (
    <LocationDetailPage
      location={locationResult.data}
      canManage={canManage}
      warehouses={warehouses}
      zones={zones}
      updateAction={updateLocationAction.bind(null, id)}
      adminDataError={adminDataError}
    />
  );
}
