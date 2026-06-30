"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { ExportCsvButton } from "@/features/reports/export-csv-button";
import { BalanceInventoryView } from "@/features/inventory/balance-inventory-view";
import { InventoryFilters } from "@/features/inventory/inventory-filters";
import { InventorySummary } from "@/features/inventory/inventory-summary";
import { LocationInventoryView } from "@/features/inventory/location-inventory-view";
import { MovementHistoryFilters } from "@/features/inventory/movement-history-filters";
import { MovementHistoryView } from "@/features/inventory/movement-history-view";
import { ProductInventoryView } from "@/features/inventory/product-inventory-view";
import type { CsvExportColumn, CsvExportRow } from "@/lib/export/csv";
import {
  formatLocalizedDateTime,
  formatLocalizedNumber,
} from "@/lib/format/locale-format";
import type { Locale } from "@/lib/i18n/locale";
import type { Messages } from "@/lib/i18n/messages";
import { formatRoleLabels } from "@/lib/navigation/app-navigation";
import type {
  InventoryBalance,
  InventoryByLocation,
  InventoryByProduct,
  InventoryMovement,
  InventoryMovementType,
  InventoryView,
  LocationStateFilter,
} from "@/types/inventory";

type InventoryPageProps = {
  currentRoles: readonly string[];
  canViewDetailed: boolean;
  productInventory: readonly InventoryByProduct[];
  locationInventory: readonly InventoryByLocation[];
  balanceRows: readonly InventoryBalance[];
  movementRows: readonly InventoryMovement[];
  locationError: string | null;
  balanceError: string | null;
  movementError: string | null;
};

export function InventoryPage({
  currentRoles,
  canViewDetailed,
  productInventory,
  locationInventory,
  balanceRows,
  movementRows,
  locationError,
  balanceError,
  movementError,
}: InventoryPageProps) {
  const { locale, messages } = useLocaleContext();
  const inventoryMessages = messages.inventory;
  const exportMessages = inventoryMessages.export;
  const [activeView, setActiveView] = useState<InventoryView>("product");
  const [search, setSearch] = useState("");
  const [locationStateFilter, setLocationStateFilter] =
    useState<LocationStateFilter>("all");
  const [movementProductId, setMovementProductId] = useState("all");
  const [movementLocationId, setMovementLocationId] = useState("all");
  const [movementType, setMovementType] = useState<InventoryMovementType | "all">(
    "all",
  );
  const deferredSearch = useDeferredValue(search);

  const filteredProductInventory = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return productInventory.filter((row) => {
      if (!query) {
        return true;
      }

      return [row.productSku, row.productName].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [deferredSearch, productInventory]);

  const filteredLocationInventory = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return locationInventory.filter((row) => {
      const matchesSearch =
        !query ||
        [
          row.warehouseCode,
          row.zoneCode,
          row.locationCode,
          row.locationName,
          row.locationType,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesSearch && matchesLocationState(row, locationStateFilter);
    });
  }, [deferredSearch, locationInventory, locationStateFilter]);

  const filteredBalanceRows = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return balanceRows.filter((row) => {
      const matchesSearch =
        !query ||
        [
          row.productSku,
          row.productName,
          row.warehouseCode,
          row.zoneCode,
          row.locationCode,
          row.locationName,
          row.locationType,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesSearch && matchesLocationState(row, locationStateFilter);
    });
  }, [balanceRows, deferredSearch, locationStateFilter]);

  const movementProductOptions = useMemo(
    () =>
      Array.from(
        new Map(
          movementRows.map((row) => [
            row.productId,
            {
              value: row.productId,
              label: `${row.productSku} - ${row.productName}`,
            },
          ]),
        ).values(),
      ),
    [movementRows],
  );

  const movementLocationOptions = useMemo(() => {
    const options = new Map<string, { value: string; label: string }>();

    for (const row of movementRows) {
      for (const location of [
        {
          id: row.sourceLocationId,
          warehouseCode: row.sourceWarehouseCode,
          zoneCode: row.sourceZoneCode,
          locationCode: row.sourceLocationCode,
          locationName: row.sourceLocationName,
        },
        {
          id: row.destinationLocationId,
          warehouseCode: row.destinationWarehouseCode,
          zoneCode: row.destinationZoneCode,
          locationCode: row.destinationLocationCode,
          locationName: row.destinationLocationName,
        },
      ]) {
        if (!location.id || !location.locationCode) {
          continue;
        }

        options.set(location.id, {
          value: location.id,
          label: formatLocationLabel(location),
        });
      }
    }

    return Array.from(options.values());
  }, [movementRows]);

  const filteredMovementRows = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return movementRows.filter((row) => {
      const matchesSearch =
        !query ||
        [
          row.productSku,
          row.productName,
          row.movementType,
          row.sourceWarehouseCode,
          row.sourceZoneCode,
          row.sourceLocationCode,
          row.sourceLocationName,
          row.destinationWarehouseCode,
          row.destinationZoneCode,
          row.destinationLocationCode,
          row.destinationLocationName,
          row.referenceType,
          row.referenceId,
          row.performedByUserName,
          row.notes,
        ]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(query));

      const matchesProduct =
        movementProductId === "all" || row.productId === movementProductId;
      const matchesLocation =
        movementLocationId === "all" ||
        row.sourceLocationId === movementLocationId ||
        row.destinationLocationId === movementLocationId;
      const matchesType =
        movementType === "all" || row.movementType === movementType;

      return matchesSearch && matchesProduct && matchesLocation && matchesType;
    });
  }, [
    deferredSearch,
    movementLocationId,
    movementProductId,
    movementRows,
    movementType,
  ]);

  const showLocationStateFilter =
    canViewDetailed &&
    (activeView === "location" || activeView === "balance");
  const visibleViews = canViewDetailed
    ? ([
        { id: "product", label: inventoryMessages.views.product },
        { id: "location", label: inventoryMessages.views.location },
        { id: "balance", label: inventoryMessages.views.balance },
        { id: "movement", label: inventoryMessages.views.movement },
      ] as const)
    : ([{ id: "product", label: inventoryMessages.views.product }] as const);

  const totalCount =
    activeView === "product"
      ? productInventory.length
      : activeView === "location"
        ? locationInventory.length
        : activeView === "balance"
          ? balanceRows.length
          : movementRows.length;

  const filteredCount =
    activeView === "product"
      ? filteredProductInventory.length
      : activeView === "location"
        ? filteredLocationInventory.length
        : activeView === "balance"
          ? filteredBalanceRows.length
          : filteredMovementRows.length;

  const roleLabels = formatRoleLabels(currentRoles, locale);
  const exportConfig = useMemo(() => {
    if (activeView === "product") {
      return {
        label: exportMessages.productLabel,
        fileName: "inventory-product-snapshot.csv",
        columns: getProductInventoryExportColumns(exportMessages.columns),
        rows: filteredProductInventory.map<CsvExportRow>((row) => ({
          productSku: row.productSku,
          productName: row.productName,
          onHandQuantity: formatQuantity(row.onHandQuantity, locale),
          reservedQuantity: formatQuantity(row.reservedQuantity, locale),
          pickedQuantity: formatQuantity(row.pickedQuantity, locale),
          availableQuantity: formatQuantity(row.availableQuantity, locale),
          updatedAtUtc: formatTimestamp(row.updatedAtUtc, locale),
        })),
      } as const;
    }

    if (activeView === "location") {
      return {
        label: exportMessages.locationLabel,
        fileName: "inventory-location-snapshot.csv",
        columns: getLocationInventoryExportColumns(exportMessages.columns),
        rows: filteredLocationInventory.map<CsvExportRow>((row) => ({
          warehouseCode: row.warehouseCode,
          zoneCode: row.zoneCode,
          locationCode: row.locationCode,
          locationName: row.locationName,
          locationType: row.locationType,
          locationIsActive: formatBooleanFlag(
            row.locationIsActive,
            messages.common.yes,
            messages.common.no,
          ),
          locationIsBlocked: formatBooleanFlag(
            row.locationIsBlocked,
            messages.common.yes,
            messages.common.no,
          ),
          onHandQuantity: formatQuantity(row.onHandQuantity, locale),
          reservedQuantity: formatQuantity(row.reservedQuantity, locale),
          pickedQuantity: formatQuantity(row.pickedQuantity, locale),
          availableQuantity: formatQuantity(row.availableQuantity, locale),
          updatedAtUtc: formatTimestamp(row.updatedAtUtc, locale),
        })),
      } as const;
    }

    if (activeView === "balance") {
      return {
        label: exportMessages.balanceLabel,
        fileName: "inventory-balance-snapshot.csv",
        columns: getBalanceInventoryExportColumns(exportMessages.columns),
        rows: filteredBalanceRows.map<CsvExportRow>((row) => ({
          productSku: row.productSku,
          productName: row.productName,
          warehouseCode: row.warehouseCode,
          zoneCode: row.zoneCode,
          locationCode: row.locationCode,
          locationName: row.locationName,
          locationType: row.locationType,
          locationIsActive: formatBooleanFlag(
            row.locationIsActive,
            messages.common.yes,
            messages.common.no,
          ),
          locationIsBlocked: formatBooleanFlag(
            row.locationIsBlocked,
            messages.common.yes,
            messages.common.no,
          ),
          onHandQuantity: formatQuantity(row.onHandQuantity, locale),
          reservedQuantity: formatQuantity(row.reservedQuantity, locale),
          pickedQuantity: formatQuantity(row.pickedQuantity, locale),
          availableQuantity: formatQuantity(row.availableQuantity, locale),
          updatedAtUtc: formatTimestamp(row.updatedAtUtc, locale),
        })),
      } as const;
    }

    return null;
  }, [
    activeView,
    exportMessages.balanceLabel,
    exportMessages.columns,
    exportMessages.locationLabel,
    exportMessages.productLabel,
    filteredBalanceRows,
    filteredLocationInventory,
    filteredProductInventory,
    locale,
    messages.common.no,
    messages.common.yes,
  ]);

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {inventoryMessages.header.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {inventoryMessages.header.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
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

      <InventorySummary
        productInventory={productInventory}
        locationInventory={locationInventory}
        canViewDetailed={canViewDetailed}
      />

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {visibleViews.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveView(view.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeView === view.id
                    ? "bg-accent text-white"
                    : "border border-line bg-white text-ink hover:border-accent hover:text-accent"
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          {exportConfig ? (
            <ExportCsvButton
              label={exportConfig.label}
              emptyLabel={exportMessages.emptyLabel}
              fileName={exportConfig.fileName}
              columns={exportConfig.columns}
              rows={exportConfig.rows}
            />
          ) : null}
        </div>
      </section>

      <InventoryFilters
        activeView={activeView}
        search={search}
        onSearchChange={setSearch}
        locationStateFilter={locationStateFilter}
        onLocationStateFilterChange={setLocationStateFilter}
        showLocationStateFilter={showLocationStateFilter}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      {activeView === "movement" && !movementError ? (
        <MovementHistoryFilters
          productOptions={movementProductOptions}
          locationOptions={movementLocationOptions}
          selectedProductId={movementProductId}
          onProductIdChange={setMovementProductId}
          selectedLocationId={movementLocationId}
          onLocationIdChange={setMovementLocationId}
          selectedMovementType={movementType}
          onMovementTypeChange={setMovementType}
        />
      ) : null}

      {activeView === "product" ? (
        <ProductInventoryView products={filteredProductInventory} />
      ) : null}

      {activeView === "location" ? (
        <LocationInventoryView
          locations={filteredLocationInventory}
          errorMessage={locationError}
        />
      ) : null}

      {activeView === "balance" ? (
        <BalanceInventoryView
          balances={filteredBalanceRows}
          errorMessage={balanceError}
        />
      ) : null}

      {activeView === "movement" ? (
        <MovementHistoryView
          movements={filteredMovementRows}
          errorMessage={movementError}
        />
      ) : null}
    </section>
  );
}

function matchesLocationState(
  row: {
    locationIsActive: boolean;
    locationIsBlocked: boolean;
  },
  filter: LocationStateFilter,
) {
  switch (filter) {
    case "active":
      return row.locationIsActive;
    case "inactive":
      return !row.locationIsActive;
    case "blocked":
      return row.locationIsBlocked;
    case "unblocked":
      return !row.locationIsBlocked;
    default:
      return true;
  }
}

function formatLocationLabel(location: {
  warehouseCode: string | null;
  zoneCode: string | null;
  locationCode: string | null;
  locationName: string | null;
}) {
  const path = [
    location.warehouseCode,
    location.zoneCode,
    location.locationCode,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" / ");

  if (location.locationName) {
    return `${path} - ${location.locationName}`;
  }

  return path;
}

function formatTimestamp(value: string, locale: Locale) {
  return formatLocalizedDateTime(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatQuantity(value: number, locale: Locale) {
  return formatLocalizedNumber(value, locale, {
    maximumFractionDigits: 2,
  });
}

function formatBooleanFlag(value: boolean, yesLabel: string, noLabel: string) {
  return value ? yesLabel : noLabel;
}

function getProductInventoryExportColumns(
  columns: Messages["inventory"]["export"]["columns"],
): readonly CsvExportColumn[] {
  return [
    { key: "productSku", header: columns.productSku },
    { key: "productName", header: columns.productName },
    { key: "onHandQuantity", header: columns.onHand },
    { key: "reservedQuantity", header: columns.reserved },
    { key: "pickedQuantity", header: columns.picked },
    { key: "availableQuantity", header: columns.available },
    { key: "updatedAtUtc", header: columns.updatedAt },
  ] as const;
}

function getLocationInventoryExportColumns(
  columns: Messages["inventory"]["export"]["columns"],
): readonly CsvExportColumn[] {
  return [
    { key: "warehouseCode", header: columns.warehouse },
    { key: "zoneCode", header: columns.zone },
    { key: "locationCode", header: columns.locationCode },
    { key: "locationName", header: columns.locationName },
    { key: "locationType", header: columns.locationType },
    { key: "locationIsActive", header: columns.locationActive },
    { key: "locationIsBlocked", header: columns.locationBlocked },
    { key: "onHandQuantity", header: columns.onHand },
    { key: "reservedQuantity", header: columns.reserved },
    { key: "pickedQuantity", header: columns.picked },
    { key: "availableQuantity", header: columns.available },
    { key: "updatedAtUtc", header: columns.updatedAt },
  ] as const;
}

function getBalanceInventoryExportColumns(
  columns: Messages["inventory"]["export"]["columns"],
): readonly CsvExportColumn[] {
  return [
    { key: "productSku", header: columns.productSku },
    { key: "productName", header: columns.productName },
    { key: "warehouseCode", header: columns.warehouse },
    { key: "zoneCode", header: columns.zone },
    { key: "locationCode", header: columns.locationCode },
    { key: "locationName", header: columns.locationName },
    { key: "locationType", header: columns.locationType },
    { key: "locationIsActive", header: columns.locationActive },
    { key: "locationIsBlocked", header: columns.locationBlocked },
    { key: "onHandQuantity", header: columns.onHand },
    { key: "reservedQuantity", header: columns.reserved },
    { key: "pickedQuantity", header: columns.picked },
    { key: "availableQuantity", header: columns.available },
    { key: "updatedAtUtc", header: columns.updatedAt },
  ] as const;
}
