"use client";

import Link from "next/link";
import { Fragment, useDeferredValue, useMemo, useState } from "react";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatLocalizedDateTime,
  formatLocalizedNumber,
} from "@/lib/format/locale-format";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import { formatRoleLabels } from "@/lib/navigation/app-navigation";
import type { InventoryBalance, LocationStateFilter } from "@/types/inventory";
import type {
  Location,
  Warehouse,
  Zone,
} from "@/types/warehouse-structure";

type WarehouseMapPageProps = {
  currentRoles: readonly string[];
  warehouses: readonly Warehouse[];
  zones: readonly Zone[];
  locations: readonly Location[];
  balanceRows: readonly InventoryBalance[];
};

type OccupancyFilter = "all" | "occupied" | "empty";

type LocationSummary = {
  location: Location;
  balances: readonly InventoryBalance[];
  productCount: number;
  totalOnHand: number;
  totalReserved: number;
  totalPicked: number;
  totalAvailable: number;
  latestUpdatedAtUtc: string | null;
  isOccupied: boolean;
};

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export function WarehouseMapPage({
  currentRoles,
  warehouses,
  zones,
  locations,
  balanceRows,
}: WarehouseMapPageProps) {
  const { locale, messages } = useLocaleContext();
  const mapMessages = messages.warehouseMap;
  const roleLabels = formatRoleLabels(currentRoles, locale);
  const canManageStructure = currentRoles.some(
    (role) => role.trim().toLowerCase() === "admin",
  );
  const [search, setSearch] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [occupancyFilter, setOccupancyFilter] =
    useState<OccupancyFilter>("all");
  const [stateFilter, setStateFilter] = useState<LocationStateFilter>("all");
  const deferredSearch = useDeferredValue(search);

  const locationSummaries = useMemo(() => {
    const balancesByLocationId = new Map<string, InventoryBalance[]>();

    for (const balance of balanceRows) {
      const current = balancesByLocationId.get(balance.locationId);

      if (current) {
        current.push(balance);
      } else {
        balancesByLocationId.set(balance.locationId, [balance]);
      }
    }

    return [...locations]
      .map((location) => {
        const locationBalances =
          balancesByLocationId.get(location.id)?.toSorted((left, right) =>
            left.productSku.localeCompare(right.productSku),
          ) ?? [];

        const totals = locationBalances.reduce(
          (current, balance) => ({
            onHand: current.onHand + balance.onHandQuantity,
            reserved: current.reserved + balance.reservedQuantity,
            picked: current.picked + balance.pickedQuantity,
            available: current.available + balance.availableQuantity,
          }),
          { onHand: 0, reserved: 0, picked: 0, available: 0 },
        );

        return {
          location,
          balances: locationBalances,
          productCount: locationBalances.length,
          totalOnHand: totals.onHand,
          totalReserved: totals.reserved,
          totalPicked: totals.picked,
          totalAvailable: totals.available,
          latestUpdatedAtUtc:
            locationBalances.length > 0
              ? locationBalances
                  .map((balance) => balance.updatedAtUtc)
                  .sort((left, right) => right.localeCompare(left))[0] ?? null
              : null,
          isOccupied: totals.onHand > 0,
        } satisfies LocationSummary;
      })
      .toSorted((left, right) => {
        const warehouseCompare = left.location.warehouseCode.localeCompare(
          right.location.warehouseCode,
        );

        if (warehouseCompare !== 0) {
          return warehouseCompare;
        }

        const zoneCompare = left.location.zoneCode.localeCompare(
          right.location.zoneCode,
        );

        if (zoneCompare !== 0) {
          return zoneCompare;
        }

        return left.location.code.localeCompare(right.location.code);
      });
  }, [balanceRows, locations]);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    () =>
      locationSummaries.find((summary) => summary.isOccupied)?.location.id ??
      locationSummaries[0]?.location.id ??
      null,
  );

  const warehouseOptions = useMemo(
    () =>
      [...warehouses].toSorted((left, right) =>
        left.code.localeCompare(right.code),
      ),
    [warehouses],
  );

  const zoneOptions = useMemo(
    () =>
      [...zones]
        .filter(
          (zone) =>
            !selectedWarehouseId || zone.warehouseId === selectedWarehouseId,
        )
        .toSorted((left, right) => {
          const warehouseCompare = left.warehouseCode.localeCompare(
            right.warehouseCode,
          );

          if (warehouseCompare !== 0) {
            return warehouseCompare;
          }

          return left.code.localeCompare(right.code);
        }),
    [selectedWarehouseId, zones],
  );

  const filteredLocations = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return locationSummaries.filter((summary) => {
      const matchesSearch =
        !query ||
        [
          summary.location.warehouseCode,
          summary.location.zoneCode,
          summary.location.code,
          summary.location.name,
          summary.location.locationType,
          ...summary.balances.flatMap((balance) => [
            balance.productSku,
            balance.productName,
          ]),
        ].some((value) => value.toLowerCase().includes(query));

      const matchesWarehouse =
        !selectedWarehouseId ||
        summary.location.warehouseId === selectedWarehouseId;
      const matchesZone =
        !selectedZoneId || summary.location.zoneId === selectedZoneId;
      const matchesOccupancy =
        occupancyFilter === "all" ||
        (occupancyFilter === "occupied"
          ? summary.isOccupied
          : !summary.isOccupied);
      const matchesState = matchesLocationState(summary.location, stateFilter);

      return (
        matchesSearch &&
        matchesWarehouse &&
        matchesZone &&
        matchesOccupancy &&
        matchesState
      );
    });
  }, [
    deferredSearch,
    locationSummaries,
    occupancyFilter,
    selectedWarehouseId,
    selectedZoneId,
    stateFilter,
  ]);

  const groupedWarehouses = useMemo(() => {
    const warehouseById = new Map(
      warehouses.map((warehouse) => [warehouse.id, warehouse]),
    );
    const zoneById = new Map(zones.map((zone) => [zone.id, zone]));
    const zoneGroups = new Map<
      string,
      Map<string, { zone: Zone; locations: LocationSummary[] }>
    >();

    for (const summary of filteredLocations) {
      const warehouse = warehouseById.get(summary.location.warehouseId);
      const zone = zoneById.get(summary.location.zoneId);

      if (!warehouse || !zone) {
        continue;
      }

      const groupedZones =
        zoneGroups.get(warehouse.id) ??
        new Map<string, { zone: Zone; locations: LocationSummary[] }>();
      const currentZone = groupedZones.get(zone.id);

      if (currentZone) {
        currentZone.locations.push(summary);
      } else {
        groupedZones.set(zone.id, { zone, locations: [summary] });
      }

      zoneGroups.set(warehouse.id, groupedZones);
    }

    return [...zoneGroups.entries()]
      .map(([warehouseId, groupedZones]) => ({
        warehouse: warehouseById.get(warehouseId)!,
        zones: [...groupedZones.values()].toSorted((left, right) =>
          left.zone.code.localeCompare(right.zone.code),
        ),
      }))
      .toSorted((left, right) =>
        left.warehouse.code.localeCompare(right.warehouse.code),
      );
  }, [filteredLocations, warehouses, zones]);

  const occupiedLocationCount = locationSummaries.filter(
    (summary) => summary.isOccupied,
  ).length;
  const filteredOccupiedCount = filteredLocations.filter(
    (summary) => summary.isOccupied,
  ).length;
  const totalSkuRows = locationSummaries.reduce(
    (current, summary) => current + summary.productCount,
    0,
  );
  const filteredSkuRows = filteredLocations.reduce(
    (current, summary) => current + summary.productCount,
    0,
  );

  const visibleSelectedLocationId = filteredLocations.some(
    (summary) => summary.location.id === selectedLocationId,
  )
    ? selectedLocationId
    : filteredLocations[0]?.location.id ?? null;

  const selectedLocation =
    locationSummaries.find(
      (summary) => summary.location.id === visibleSelectedLocationId,
    ) ?? null;

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {mapMessages.header.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {mapMessages.header.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManageStructure ? (
              <Link
                href="/warehouse-setup"
                className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
              >
                {mapMessages.header.openSetup}
              </Link>
            ) : null}
            {roleLabels.map((role) => (
              <span
                key={role}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={mapMessages.metrics.warehouses}
          value={formatCount(warehouses.length, locale)}
        />
        <MetricCard
          label={mapMessages.metrics.zones}
          value={formatCount(zones.length, locale)}
        />
        <MetricCard
          label={mapMessages.metrics.occupiedLocations}
          value={interpolateMessage(mapMessages.metrics.visibleTemplate, {
            visible: formatCount(filteredOccupiedCount, locale),
            total: formatCount(occupiedLocationCount, locale),
          })}
        />
        <MetricCard
          label={mapMessages.metrics.productSlots}
          value={interpolateMessage(mapMessages.metrics.visibleTemplate, {
            visible: formatCount(filteredSkuRows, locale),
            total: formatCount(totalSkuRows, locale),
          })}
        />
      </section>

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.7fr_0.7fr_0.6fr_0.6fr]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {mapMessages.filters.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={mapMessages.filters.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {mapMessages.filters.warehouseLabel}
            </span>
            <select
              value={selectedWarehouseId}
              onChange={(event) => {
                setSelectedWarehouseId(event.target.value);
                setSelectedZoneId("");
              }}
              className={inputClassName}
            >
              <option value="">{mapMessages.filters.allWarehouses}</option>
              {warehouseOptions.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.code} - {warehouse.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {mapMessages.filters.zoneLabel}
            </span>
            <select
              value={selectedZoneId}
              onChange={(event) => setSelectedZoneId(event.target.value)}
              className={inputClassName}
            >
              <option value="">{mapMessages.filters.allZones}</option>
              {zoneOptions.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.warehouseCode} / {zone.code} - {zone.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {mapMessages.filters.occupancyLabel}
            </span>
            <select
              value={occupancyFilter}
              onChange={(event) =>
                setOccupancyFilter(event.target.value as OccupancyFilter)
              }
              className={inputClassName}
            >
              <option value="all">{mapMessages.filters.allLocations}</option>
              <option value="occupied">{mapMessages.filters.occupiedOnly}</option>
              <option value="empty">{mapMessages.filters.emptyOnly}</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {mapMessages.filters.statusLabel}
            </span>
            <select
              value={stateFilter}
              onChange={(event) =>
                setStateFilter(event.target.value as LocationStateFilter)
              }
              className={inputClassName}
            >
              <option value="all">{mapMessages.filters.allStates}</option>
              <option value="active">{mapMessages.filters.activeOnly}</option>
              <option value="inactive">{mapMessages.filters.inactiveOnly}</option>
              <option value="blocked">{mapMessages.filters.blockedOnly}</option>
              <option value="unblocked">{mapMessages.filters.unblockedOnly}</option>
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <div className="space-y-6">
          {groupedWarehouses.length === 0 ? (
            <EmptyState
              eyebrow={mapMessages.empty.eyebrow}
              title={mapMessages.empty.title}
              message={mapMessages.empty.message}
            />
          ) : (
            groupedWarehouses.map(({ warehouse, zones: groupedZones }) => {
              const warehouseLocationCount = groupedZones.reduce(
                (current, item) => current + item.locations.length,
                0,
              );
              const warehouseOccupiedCount = groupedZones.reduce(
                (current, item) =>
                  current +
                  item.locations.filter((summary) => summary.isOccupied).length,
                0,
              );

              return (
                <article
                  key={warehouse.id}
                  className="overflow-hidden rounded-[30px] border border-line bg-white/84 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
                >
                  <div className="border-b border-line/80 px-6 py-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                            {warehouse.code}
                          </span>
                          <StatusBadge
                            label={
                              warehouse.isActive
                                ? messages.common.states.active
                                : messages.common.states.inactive
                            }
                            tone={warehouse.isActive ? "success" : "muted"}
                          />
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                          {warehouse.name}
                        </h2>
                        <p className="mt-2 text-sm text-muted">
                          {mapMessages.warehouse.statusDescription}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <CompactMetric
                          label={mapMessages.warehouse.visibleZones}
                          value={formatCount(groupedZones.length, locale)}
                        />
                        <CompactMetric
                          label={mapMessages.warehouse.visibleLocations}
                          value={formatCount(warehouseLocationCount, locale)}
                        />
                        <CompactMetric
                          label={mapMessages.warehouse.occupied}
                          value={formatCount(warehouseOccupiedCount, locale)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 px-6 py-6">
                    {groupedZones.map(({ zone, locations: zoneLocations }) => (
                      <ZoneGrid
                        key={zone.id}
                        zone={zone}
                        locations={zoneLocations}
                        selectedLocationId={visibleSelectedLocationId}
                        onSelectLocation={setSelectedLocationId}
                      />
                    ))}
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <LocationDetailPanel summary={selectedLocation} />
        </div>
      </div>
    </section>
  );
}

function ZoneGrid({
  zone,
  locations,
  selectedLocationId,
  onSelectLocation,
}: {
  zone: Zone;
  locations: readonly LocationSummary[];
  selectedLocationId: string | null;
  onSelectLocation: (locationId: string) => void;
}) {
  const { locale, messages } = useLocaleContext();
  const mapMessages = messages.warehouseMap;
  const locationTypeLabels = messages.warehouseSetup.forms.locationTypes;
  const cellMap = new Map<string, LocationSummary[]>();

  for (const summary of locations) {
    const key = buildCoordinateKey(
      summary.location.mapRow,
      summary.location.mapColumn,
    );
    const current = cellMap.get(key);

    if (current) {
      current.push(summary);
    } else {
      cellMap.set(key, [summary]);
    }
  }

  const distinctRows = [...new Set(locations.map((item) => item.location.mapRow))]
    .toSorted((left, right) => left - right);
  const distinctColumns = [
    ...new Set(locations.map((item) => item.location.mapColumn)),
  ].toSorted((left, right) => left - right);

  const minRow = distinctRows[0] ?? 1;
  const maxRow = distinctRows[distinctRows.length - 1] ?? minRow;
  const minColumn = distinctColumns[0] ?? 1;
  const maxColumn = distinctColumns[distinctColumns.length - 1] ?? minColumn;

  const rowValues =
    maxRow - minRow + 1 <= 12
      ? Array.from(
          { length: maxRow - minRow + 1 },
          (_, index) => minRow + index,
        )
      : distinctRows;
  const columnValues =
    maxColumn - minColumn + 1 <= 12
      ? Array.from(
          { length: maxColumn - minColumn + 1 },
          (_, index) => minColumn + index,
        )
      : distinctColumns;

  const occupiedCount = locations.filter((summary) => summary.isOccupied).length;
  const duplicateCellCount = [...cellMap.values()].filter(
    (summaries) => summaries.length > 1,
  ).length;

  return (
    <section className="space-y-4 rounded-[26px] border border-line/80 bg-surface/70 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
              {zone.code}
            </span>
            <StatusBadge
              label={
                zone.isActive
                  ? messages.common.states.active
                  : messages.common.states.inactive
              }
              tone={zone.isActive ? "success" : "muted"}
            />
          </div>
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
            {zone.name}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {mapMessages.zone.coordinateDescription}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <CompactMetric
            label={mapMessages.zone.visibleLocations}
            value={formatCount(locations.length, locale)}
          />
          <CompactMetric
            label={mapMessages.zone.occupied}
            value={formatCount(occupiedCount, locale)}
          />
          <CompactMetric
            label={mapMessages.zone.sharedCells}
            value={formatCount(duplicateCellCount, locale)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="inline-grid min-w-full gap-3"
          style={{
            gridTemplateColumns: `72px repeat(${columnValues.length}, minmax(220px, 1fr))`,
          }}
        >
          <div className="rounded-2xl border border-dashed border-line/70 bg-white/60 px-3 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {mapMessages.zone.rowLabel}
          </div>

          {columnValues.map((column) => (
            <div
              key={`column-${zone.id}-${column}`}
              className="rounded-2xl border border-dashed border-line/70 bg-white/60 px-3 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted"
            >
              {interpolateMessage(mapMessages.zone.columnTemplate, {
                column: formatCount(column, locale),
              })}
            </div>
          ))}

          {rowValues.map((row) => (
            <Fragment key={`row-${zone.id}-${row}`}>
              <div
                key={`row-label-${zone.id}-${row}`}
                className="rounded-2xl border border-dashed border-line/70 bg-white/60 px-3 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted"
              >
                {formatCount(row, locale)}
              </div>

              {columnValues.map((column) => {
                const cellSummaries =
                  cellMap.get(buildCoordinateKey(row, column)) ?? [];

                return (
                  <div
                    key={`cell-${zone.id}-${row}-${column}`}
                    className="min-h-[172px] rounded-[24px] border border-line/80 bg-white/84 p-3 shadow-[0_10px_40px_rgba(29,41,56,0.05)]"
                  >
                    {cellSummaries.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center rounded-[20px] border border-dashed border-line/80 bg-surface/70 px-4 py-6 text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                          {mapMessages.zone.emptyCell}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-muted">
                          {interpolateMessage(
                            mapMessages.zone.emptyCellTemplate,
                            {
                              row: formatCount(row, locale),
                              column: formatCount(column, locale),
                            },
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cellSummaries.length > 1 ? (
                          <p className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                            {interpolateMessage(
                              mapMessages.zone.sharedCellTemplate,
                              { count: formatCount(cellSummaries.length, locale) },
                            )}
                          </p>
                        ) : null}

                        {cellSummaries
                          .toSorted((left, right) =>
                            left.location.code.localeCompare(right.location.code),
                          )
                          .map((summary) => (
                            <button
                              key={summary.location.id}
                              type="button"
                              onClick={() => onSelectLocation(summary.location.id)}
                              className={`w-full rounded-[20px] border px-4 py-4 text-left transition ${
                                selectedLocationId === summary.location.id
                                  ? "border-accent bg-accent-soft/70 shadow-[0_10px_32px_rgba(12,146,211,0.16)]"
                                  : "border-line bg-white hover:border-accent/60 hover:shadow-[0_10px_32px_rgba(29,41,56,0.08)]"
                              }`}
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-base font-semibold text-ink">
                                    {summary.location.code}
                                  </p>
                                  <p className="mt-1 text-xs text-muted">
                                    {summary.location.name}
                                  </p>
                                </div>
                                <StatusBadge
                                  label={
                                    summary.isOccupied
                                      ? messages.common.states.occupied
                                      : messages.common.states.empty
                                  }
                                  tone={
                                    summary.isOccupied ? "accent" : "outline"
                                  }
                                />
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <StatusBadge
                                  label={formatLocationTypeLabel(
                                    summary.location.locationType,
                                    locationTypeLabels,
                                  )}
                                  tone="outline"
                                />
                                <StatusBadge
                                  label={
                                    summary.location.isActive
                                      ? messages.common.states.active
                                      : messages.common.states.inactive
                                  }
                                  tone={
                                    summary.location.isActive
                                      ? "success"
                                      : "muted"
                                  }
                                />
                                <StatusBadge
                                  label={
                                    summary.location.isBlocked
                                      ? messages.common.states.blocked
                                      : messages.common.states.unblocked
                                  }
                                  tone={
                                    summary.location.isBlocked
                                      ? "danger"
                                      : "success"
                                  }
                                />
                              </div>

                              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                <MiniMetric
                                  label={mapMessages.zone.productRows}
                                  value={formatCount(summary.productCount, locale)}
                                />
                                <MiniMetric
                                  label={mapMessages.zone.onHand}
                                  value={formatQuantity(summary.totalOnHand, locale)}
                                />
                                <MiniMetric
                                  label={mapMessages.zone.available}
                                  value={formatQuantity(
                                    summary.totalAvailable,
                                    locale,
                                  )}
                                />
                                <MiniMetric
                                  label={mapMessages.zone.picked}
                                  value={formatQuantity(summary.totalPicked, locale)}
                                />
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationDetailPanel({
  summary,
}: {
  summary: LocationSummary | null;
}) {
  const { locale, messages } = useLocaleContext();
  const mapMessages = messages.warehouseMap;
  const locationTypeLabels = messages.warehouseSetup.forms.locationTypes;

  return (
    <aside className="overflow-hidden rounded-[30px] border border-line bg-white/84 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div className="border-b border-line/80 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          {mapMessages.detail.eyebrow}
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
          {summary
            ? interpolateMessage(mapMessages.detail.titleSelectedTemplate, {
                code: summary.location.code,
              })
            : mapMessages.detail.titleEmpty}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          {mapMessages.detail.description}
        </p>
      </div>

      <div className="px-6 py-6">
        {!summary ? (
          <EmptyState
            eyebrow={mapMessages.detail.eyebrow}
            title={mapMessages.detail.noSelectionTitle}
            message={mapMessages.detail.noSelectionMessage}
            compact
          />
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  label={formatLocationTypeLabel(
                    summary.location.locationType,
                    locationTypeLabels,
                  )}
                  tone="outline"
                />
                <StatusBadge
                  label={
                    summary.isOccupied
                      ? messages.common.states.occupied
                      : messages.common.states.empty
                  }
                  tone={summary.isOccupied ? "accent" : "outline"}
                />
                <StatusBadge
                  label={
                    summary.location.isActive
                      ? messages.common.states.active
                      : messages.common.states.inactive
                  }
                  tone={summary.location.isActive ? "success" : "muted"}
                />
                <StatusBadge
                  label={
                    summary.location.isBlocked
                      ? messages.common.states.blocked
                      : messages.common.states.unblocked
                  }
                  tone={summary.location.isBlocked ? "danger" : "success"}
                />
              </div>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                {summary.location.name}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {summary.location.warehouseCode} / {summary.location.zoneCode} /{" "}
                {summary.location.code}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailMetric
                label={mapMessages.detail.coordinates}
                value={interpolateMessage(
                  messages.warehouseSetup.editor.rowColumnTemplate,
                  {
                    row: formatCount(summary.location.mapRow, locale),
                    column: formatCount(summary.location.mapColumn, locale),
                  },
                )}
              />
              <DetailMetric
                label={mapMessages.detail.balanceRows}
                value={formatCount(summary.balances.length, locale)}
              />
              <DetailMetric
                label={mapMessages.detail.onHand}
                value={formatQuantity(summary.totalOnHand, locale)}
              />
              <DetailMetric
                label={mapMessages.detail.available}
                value={formatQuantity(summary.totalAvailable, locale)}
              />
              <DetailMetric
                label={mapMessages.detail.reserved}
                value={formatQuantity(summary.totalReserved, locale)}
              />
              <DetailMetric
                label={mapMessages.detail.picked}
                value={formatQuantity(summary.totalPicked, locale)}
              />
            </div>

            {summary.latestUpdatedAtUtc ? (
              <p className="rounded-2xl border border-line bg-surface/70 px-4 py-3 text-sm text-muted">
                {interpolateMessage(mapMessages.detail.lastUpdatedTemplate, {
                  value: formatLocalizedDateTime(
                    summary.latestUpdatedAtUtc,
                    locale,
                    { dateStyle: "medium", timeStyle: "short" },
                  ),
                })}
              </p>
            ) : (
              <p className="rounded-2xl border border-line bg-surface/70 px-4 py-3 text-sm text-muted">
                {mapMessages.detail.noBalanceRows}
              </p>
            )}

            {summary.balances.length === 0 ? (
              <EmptyState
                eyebrow={mapMessages.detail.eyebrow}
                title={mapMessages.detail.locationEmptyTitle}
                message={mapMessages.detail.locationEmptyMessage}
                compact
              />
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                  {mapMessages.detail.visibleStockRows}
                </h4>

                {summary.balances.map((balance) => (
                  <article
                    key={balance.id}
                    className="rounded-[24px] border border-line bg-surface/70 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-ink">
                          {balance.productName}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                          {balance.productSku}
                        </p>
                      </div>

                      <StatusBadge
                        label={formatLocationTypeLabel(
                          balance.locationType,
                          locationTypeLabels,
                        )}
                        tone="outline"
                      />
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <MiniMetric
                        label={mapMessages.detail.onHand}
                        value={formatQuantity(balance.onHandQuantity, locale)}
                      />
                      <MiniMetric
                        label={mapMessages.detail.available}
                        value={formatQuantity(balance.availableQuantity, locale)}
                      />
                      <MiniMetric
                        label={mapMessages.detail.reserved}
                        value={formatQuantity(balance.reservedQuantity, locale)}
                      />
                      <MiniMetric
                        label={mapMessages.detail.picked}
                        value={formatQuantity(balance.pickedQuantity, locale)}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[26px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
        {value}
      </p>
    </article>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/80 bg-white/70 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/80 bg-surface/80 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/70 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-base font-semibold text-ink">{value}</p>
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "accent" | "success" | "danger" | "muted" | "outline";
}) {
  const className =
    tone === "accent"
      ? "border-accent/20 bg-accent-soft text-accent"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : tone === "danger"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : tone === "muted"
            ? "border-zinc-200 bg-zinc-100 text-zinc-600"
            : "border-line bg-white text-ink";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function EmptyState({
  eyebrow,
  title,
  message,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  message: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[28px] border border-dashed border-line bg-white/72 text-center shadow-[0_18px_70px_rgba(29,41,56,0.05)] ${
        compact ? "px-5 py-8" : "px-6 py-12"
      }`}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
        {eyebrow}
      </p>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
    </div>
  );
}

function matchesLocationState(
  location: Location,
  filter: LocationStateFilter,
) {
  switch (filter) {
    case "active":
      return location.isActive;
    case "inactive":
      return !location.isActive;
    case "blocked":
      return location.isBlocked;
    case "unblocked":
      return !location.isBlocked;
    case "all":
    default:
      return true;
  }
}

function buildCoordinateKey(row: number, column: number) {
  return `${row}:${column}`;
}

function formatLocationTypeLabel(
  locationType: string,
  labels: Messages["warehouseSetup"]["forms"]["locationTypes"],
) {
  return labels[locationType as keyof typeof labels] ?? locationType;
}

function formatCount(value: number, locale: "en" | "ro") {
  return formatLocalizedNumber(value, locale, { maximumFractionDigits: 0 });
}

function formatQuantity(value: number, locale: "en" | "ro") {
  return formatLocalizedNumber(value, locale, { maximumFractionDigits: 2 });
}
