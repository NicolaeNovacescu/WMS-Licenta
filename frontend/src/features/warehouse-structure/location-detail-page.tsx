import Link from "next/link";

import {
  blockLocationAction,
  unblockLocationAction,
} from "@/features/warehouse-structure/actions";
import { LocationForm } from "@/features/warehouse-structure/location-form";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, interpolateMessage } from "@/lib/i18n/messages";
import type { WarehouseStructureFormState } from "@/types/warehouse-structure";
import type {
  Location,
  Warehouse,
  Zone,
} from "@/types/warehouse-structure";

type LocationDetailPageProps = {
  location: Location;
  canManage: boolean;
  warehouses: readonly Warehouse[];
  zones: readonly Zone[];
  updateAction: (
    state: WarehouseStructureFormState,
    formData: FormData,
  ) => Promise<WarehouseStructureFormState>;
  adminDataError: string | null;
};

export async function LocationDetailPage({
  location,
  canManage,
  warehouses,
  zones,
  updateAction,
  adminDataError,
}: LocationDetailPageProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const locationMessages = messages.locations;
  const blockAction = blockLocationAction.bind(null, location.id);
  const unblockAction = unblockLocationAction.bind(null, location.id);

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {location.code}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {formatLocationTypeLabel(
                  location.locationType,
                  messages.warehouseSetup.forms.locationTypes,
                )}
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {location.name}
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted">
              {interpolateMessage(locationMessages.detail.descriptionTemplate, {
                warehouse: location.warehouseCode,
                zone: location.zoneCode,
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/locations"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {locationMessages.detail.backToLocations}
            </Link>
            <Link
              href="/warehouse-map"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {locationMessages.detail.structureOverview}
            </Link>
            {canManage ? (
              <Link
                href="/warehouse-setup"
                className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                {locationMessages.detail.openSetup}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <StatusCard
            label={locationMessages.detail.activeStatus}
            value={
              location.isActive
                ? messages.common.states.active
                : messages.common.states.inactive
            }
          />
          <StatusCard
            label={locationMessages.detail.blockStatus}
            value={
              location.isBlocked
                ? messages.common.states.blocked
                : messages.common.states.unblocked
            }
          />
          <StatusCard label={locationMessages.detail.mapRow} value={String(location.mapRow)} />
          <StatusCard
            label={locationMessages.detail.mapColumn}
            value={String(location.mapColumn)}
          />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {locationMessages.detail.referenceEyebrow}
          </p>
          <div className="mt-5 grid gap-4">
            <DetailRow
              label={locationMessages.detail.warehouse}
              value={location.warehouseCode}
            />
            <DetailRow label={locationMessages.detail.zone} value={location.zoneCode} />
            <DetailRow
              label={locationMessages.detail.locationId}
              value={location.id}
              mono
            />
            <DetailRow
              label={locationMessages.detail.ruleNote}
              value={locationMessages.detail.ruleNoteValue}
            />
          </div>
        </section>

        {canManage ? (
          <section className="space-y-6">
            <div className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {locationMessages.detail.editEyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    {locationMessages.detail.editTitle}
                  </h2>
                </div>

                <form action={location.isBlocked ? unblockAction : blockAction}>
                  <button
                    type="submit"
                    className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      location.isBlocked
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
                        : "border border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100"
                    }`}
                  >
                    {location.isBlocked
                      ? locationMessages.detail.unblockLocation
                      : locationMessages.detail.blockLocation}
                  </button>
                </form>
              </div>

              <div className="mt-6">
                {adminDataError ? (
                  <p className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
                    {adminDataError}
                  </p>
                ) : (
                  <LocationForm
                    action={updateAction}
                    warehouses={warehouses}
                    zones={zones}
                    location={location}
                    mode="edit"
                  />
                )}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className={`mt-2 text-sm leading-6 text-ink ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function formatLocationTypeLabel(
  locationType: string,
  labels: Record<string, string>,
) {
  return labels[locationType] ?? locationType;
}
