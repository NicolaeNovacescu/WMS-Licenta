"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { Location } from "@/types/warehouse-structure";

type LocationListPageProps = {
  locations: readonly Location[];
  canManage: boolean;
};

export function LocationListPage({
  locations,
  canManage,
}: LocationListPageProps) {
  const { messages } = useLocaleContext();
  const locationMessages = messages.locations;
  const [search, setSearch] = useState("");
  const [warehouseCode, setWarehouseCode] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "blocked" | "unblocked">(
    "all",
  );
  const deferredSearch = useDeferredValue(search);

  const warehouseCodes = useMemo(
    () =>
      Array.from(new Set(locations.map((location) => location.warehouseCode))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [locations],
  );

  const filteredLocations = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return locations.filter((location) => {
      const matchesSearch =
        !query ||
        [
          location.code,
          location.name,
          location.warehouseCode,
          location.zoneCode,
          location.locationType,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesWarehouse =
        !warehouseCode || location.warehouseCode === warehouseCode;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "blocked" ? location.isBlocked : !location.isBlocked);

      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }, [deferredSearch, locations, statusFilter, warehouseCode]);

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {locationMessages.list.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {locationMessages.list.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/warehouse-map"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {locationMessages.list.backToStructureOverview}
            </Link>
            {canManage ? (
              <Link
                href="/warehouse-setup"
                className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                {locationMessages.list.openSetup}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {locationMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={locationMessages.list.searchPlaceholder}
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {locationMessages.list.warehouseLabel}
            </span>
            <select
              value={warehouseCode}
              onChange={(event) => setWarehouseCode(event.target.value)}
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            >
              <option value="">{locationMessages.list.allWarehouses}</option>
              {warehouseCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {locationMessages.list.blockStatusLabel}
            </span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "all" | "blocked" | "unblocked",
                )
              }
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            >
              <option value="all">{locationMessages.list.allLocations}</option>
              <option value="blocked">{locationMessages.list.blockedOnly}</option>
              <option value="unblocked">{locationMessages.list.unblockedOnly}</option>
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredLocations.map((location) => (
          <Link
            key={location.id}
            href={`/locations/${location.id}`}
            className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur transition hover:border-accent"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                  {location.name}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {location.warehouseCode} / {location.zoneCode}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusChip active={location.isActive} kind="active" />
                <StatusChip active={!location.isBlocked} kind="blocked" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoTile
                label={locationMessages.list.coordinates}
                value={interpolateMessage(locationMessages.list.coordinatesTemplate, {
                  row: location.mapRow,
                  column: location.mapColumn,
                })}
              />
              <InfoTile
                label={locationMessages.list.locationId}
                value={location.id}
                mono
              />
            </div>
          </Link>
        ))}
      </div>

      {filteredLocations.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line bg-white/72 px-6 py-12 text-center shadow-[0_20px_70px_rgba(29,41,56,0.05)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            {locationMessages.list.emptyEyebrow}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            {locationMessages.list.emptyMessage}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function StatusChip({
  active,
  kind,
}: {
  active: boolean;
  kind: "active" | "blocked";
}) {
  const { messages } = useLocaleContext();
  const label =
    kind === "active"
      ? active
        ? messages.common.states.active
        : messages.common.states.inactive
      : active
        ? messages.common.states.unblocked
        : messages.common.states.blocked;

  const tone =
    kind === "active"
      ? active
        ? "bg-emerald-50 text-emerald-700"
        : "bg-zinc-100 text-zinc-600"
      : active
        ? "bg-emerald-50 text-emerald-700"
        : "bg-rose-50 text-rose-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

function formatLocationTypeLabel(
  locationType: string,
  labels: Record<string, string>,
) {
  return labels[locationType] ?? locationType;
}

function InfoTile({
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
      <p className={`mt-2 text-sm text-ink ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}
