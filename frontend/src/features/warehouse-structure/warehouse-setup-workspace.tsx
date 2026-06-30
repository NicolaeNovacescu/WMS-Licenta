"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { LocationForm } from "@/features/warehouse-structure/location-form";
import { WarehouseForm } from "@/features/warehouse-structure/warehouse-form";
import { ZoneForm } from "@/features/warehouse-structure/zone-form";
import { interpolateMessage } from "@/lib/i18n/messages";
import type {
  Location,
  Warehouse,
  WarehouseStructureFormState,
  Zone,
} from "@/types/warehouse-structure";

type FormAction = (
  state: WarehouseStructureFormState,
  formData: FormData,
) => Promise<WarehouseStructureFormState>;

type EntityAction = (
  entityId: string,
  state: WarehouseStructureFormState,
  formData: FormData,
) => Promise<WarehouseStructureFormState>;

type WarehouseSetupWorkspaceProps = {
  warehouses: readonly Warehouse[];
  zones: readonly Zone[];
  locations: readonly Location[];
  createWarehouseAction: FormAction;
  updateWarehouseAction: EntityAction;
  createZoneAction: FormAction;
  updateZoneAction: EntityAction;
  createLocationAction: FormAction;
  updateLocationAction: EntityAction;
  blockLocationInlineAction: EntityAction;
  unblockLocationInlineAction: EntityAction;
};

const initialState: WarehouseStructureFormState = {
  error: null,
  successMessage: null,
};

export function WarehouseSetupWorkspace({
  warehouses,
  zones,
  locations,
  createWarehouseAction,
  updateWarehouseAction,
  createZoneAction,
  updateZoneAction,
  createLocationAction,
  updateLocationAction,
  blockLocationInlineAction,
  unblockLocationInlineAction,
}: WarehouseSetupWorkspaceProps) {
  const { messages } = useLocaleContext();
  const setupMessages = messages.warehouseSetup;
  const sortedWarehouses = useMemo(
    () =>
      [...warehouses].toSorted((left, right) => left.code.localeCompare(right.code)),
    [warehouses],
  );
  const sortedZones = useMemo(
    () =>
      [...zones].toSorted((left, right) => {
        const warehouseCompare = left.warehouseCode.localeCompare(right.warehouseCode);

        if (warehouseCompare !== 0) {
          return warehouseCompare;
        }

        return left.code.localeCompare(right.code);
      }),
    [zones],
  );
  const sortedLocations = useMemo(
    () =>
      [...locations].toSorted((left, right) => {
        const warehouseCompare = left.warehouseCode.localeCompare(right.warehouseCode);

        if (warehouseCompare !== 0) {
          return warehouseCompare;
        }

        const zoneCompare = left.zoneCode.localeCompare(right.zoneCode);

        if (zoneCompare !== 0) {
          return zoneCompare;
        }

        return left.code.localeCompare(right.code);
      }),
    [locations],
  );

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(
    sortedWarehouses[0]?.id ?? "",
  );
  const [selectedZoneId, setSelectedZoneId] = useState(sortedZones[0]?.id ?? "");
  const [selectedLocationId, setSelectedLocationId] = useState(
    sortedLocations[0]?.id ?? "",
  );

  const selectedWarehouse =
    sortedWarehouses.find((warehouse) => warehouse.id === selectedWarehouseId) ?? null;
  const selectedZone =
    sortedZones.find((zone) => zone.id === selectedZoneId) ?? null;
  const selectedLocation =
    sortedLocations.find((location) => location.id === selectedLocationId) ?? null;
  const visibleSelectedWarehouse = selectedWarehouse ?? sortedWarehouses[0] ?? null;
  const visibleSelectedZone = selectedZone ?? sortedZones[0] ?? null;
  const visibleSelectedLocation = selectedLocation ?? sortedLocations[0] ?? null;

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {setupMessages.header.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {setupMessages.header.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/warehouse-map"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {setupMessages.header.openWarehouseMap}
            </Link>
            <Link
              href="/locations"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {setupMessages.header.openLocations}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <MetricCard
            label={setupMessages.header.metrics.warehouses}
            value={String(sortedWarehouses.length)}
          />
          <MetricCard
            label={setupMessages.header.metrics.zones}
            value={String(sortedZones.length)}
          />
          <MetricCard
            label={setupMessages.header.metrics.locations}
            value={String(sortedLocations.length)}
          />
        </div>
      </header>

      <StructureSection
        eyebrow={setupMessages.sections.warehouses.eyebrow}
        title={setupMessages.sections.warehouses.title}
        createTitle={setupMessages.editor.create}
        updateTitle={setupMessages.editor.update}
        createPanel={<WarehouseForm action={createWarehouseAction} mode="create" />}
        editPanel={
          <div className="space-y-5">
            <SelectionField
              label={setupMessages.editor.warehouseToEdit}
              value={visibleSelectedWarehouse?.id ?? ""}
              onChange={setSelectedWarehouseId}
              options={sortedWarehouses.map((warehouse) => ({
                value: warehouse.id,
                label: `${warehouse.code} - ${warehouse.name}`,
              }))}
              emptyLabel={setupMessages.editor.noWarehouses}
            />

            {visibleSelectedWarehouse ? (
              <>
                <StatusRow
                  items={[
                    { label: visibleSelectedWarehouse.code, tone: "accent" },
                    {
                      label: visibleSelectedWarehouse.isActive
                        ? messages.common.states.active
                        : messages.common.states.inactive,
                      tone: visibleSelectedWarehouse.isActive ? "success" : "muted",
                    },
                  ]}
                />

                <WarehouseForm
                  key={`warehouse-${visibleSelectedWarehouse.id}-${visibleSelectedWarehouse.code}-${visibleSelectedWarehouse.name}-${visibleSelectedWarehouse.isActive ? "active" : "inactive"}`}
                  action={updateWarehouseAction.bind(null, visibleSelectedWarehouse.id)}
                  warehouse={visibleSelectedWarehouse}
                  mode="edit"
                />
              </>
            ) : (
              <EmptyEditorMessage message={setupMessages.editor.firstWarehouseMessage} />
            )}
          </div>
        }
      />

      <StructureSection
        eyebrow={setupMessages.sections.zones.eyebrow}
        title={setupMessages.sections.zones.title}
        createTitle={setupMessages.editor.create}
        updateTitle={setupMessages.editor.update}
        createPanel={
          <ZoneForm
            action={createZoneAction}
            warehouses={sortedWarehouses}
            mode="create"
          />
        }
        editPanel={
          <div className="space-y-5">
            <SelectionField
              label={setupMessages.editor.zoneToEdit}
              value={visibleSelectedZone?.id ?? ""}
              onChange={setSelectedZoneId}
              options={sortedZones.map((zone) => ({
                value: zone.id,
                label: `${zone.warehouseCode} / ${zone.code} - ${zone.name}`,
              }))}
              emptyLabel={setupMessages.editor.noZones}
            />

            {visibleSelectedZone ? (
              <>
                <StatusRow
                  items={[
                    { label: visibleSelectedZone.warehouseCode, tone: "outline" },
                    { label: visibleSelectedZone.code, tone: "accent" },
                    {
                      label: visibleSelectedZone.isActive
                        ? messages.common.states.active
                        : messages.common.states.inactive,
                      tone: visibleSelectedZone.isActive ? "success" : "muted",
                    },
                  ]}
                />

                <ZoneForm
                  key={`zone-${visibleSelectedZone.id}-${visibleSelectedZone.warehouseId}-${visibleSelectedZone.code}-${visibleSelectedZone.name}-${visibleSelectedZone.isActive ? "active" : "inactive"}`}
                  action={updateZoneAction.bind(null, visibleSelectedZone.id)}
                  warehouses={sortedWarehouses}
                  zone={visibleSelectedZone}
                  mode="edit"
                />
              </>
            ) : (
              <EmptyEditorMessage message={setupMessages.editor.firstZoneMessage} />
            )}
          </div>
        }
      />

      <StructureSection
        eyebrow={setupMessages.sections.locations.eyebrow}
        title={setupMessages.sections.locations.title}
        createTitle={setupMessages.editor.create}
        updateTitle={setupMessages.editor.update}
        createPanel={
          <LocationForm
            action={createLocationAction}
            warehouses={sortedWarehouses}
            zones={sortedZones}
            mode="create"
          />
        }
        editPanel={
          <div className="space-y-5">
            <SelectionField
              label={setupMessages.editor.locationToEdit}
              value={visibleSelectedLocation?.id ?? ""}
              onChange={setSelectedLocationId}
              options={sortedLocations.map((location) => ({
                value: location.id,
                label: `${location.warehouseCode} / ${location.zoneCode} / ${location.code}`,
              }))}
              emptyLabel={setupMessages.editor.noLocations}
            />

            {visibleSelectedLocation ? (
              <>
                <StatusRow
                  items={[
                    {
                      label: setupMessages.forms.locationTypes[
                        visibleSelectedLocation.locationType as keyof typeof setupMessages.forms.locationTypes
                      ] ?? visibleSelectedLocation.locationType,
                      tone: "outline",
                    },
                    {
                      label: visibleSelectedLocation.isActive
                        ? messages.common.states.active
                        : messages.common.states.inactive,
                      tone: visibleSelectedLocation.isActive ? "success" : "muted",
                    },
                    {
                      label: visibleSelectedLocation.isBlocked
                        ? messages.common.states.blocked
                        : messages.common.states.unblocked,
                      tone: visibleSelectedLocation.isBlocked ? "danger" : "success",
                    },
                    {
                      label: interpolateMessage(
                        setupMessages.editor.rowColumnTemplate,
                        {
                          row: visibleSelectedLocation.mapRow,
                          column: visibleSelectedLocation.mapColumn,
                        },
                      ),
                      tone: "outline",
                    },
                  ]}
                />

                <LocationStateForm
                  key={`location-state-${visibleSelectedLocation.id}-${visibleSelectedLocation.isBlocked ? "blocked" : "unblocked"}`}
                  location={visibleSelectedLocation}
                  blockAction={blockLocationInlineAction}
                  unblockAction={unblockLocationInlineAction}
                />

                <LocationForm
                  key={`location-${visibleSelectedLocation.id}-${visibleSelectedLocation.warehouseId}-${visibleSelectedLocation.zoneId}-${visibleSelectedLocation.code}-${visibleSelectedLocation.mapRow}-${visibleSelectedLocation.mapColumn}-${visibleSelectedLocation.isActive ? "active" : "inactive"}`}
                  action={updateLocationAction.bind(null, visibleSelectedLocation.id)}
                  warehouses={sortedWarehouses}
                  zones={sortedZones}
                  location={visibleSelectedLocation}
                  mode="edit"
                />
              </>
            ) : (
              <EmptyEditorMessage message={setupMessages.editor.firstLocationMessage} />
            )}
          </div>
        }
      />
    </section>
  );
}

function StructureSection({
  eyebrow,
  title,
  createTitle,
  updateTitle,
  createPanel,
  editPanel,
}: {
  eyebrow: string;
  title: string;
  createTitle: string;
  updateTitle: string;
  createPanel: ReactNode;
  editPanel: ReactNode;
}) {
  return (
    <section className="rounded-[32px] border border-line bg-white/84 p-6 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <EditorCard title={createTitle}>{createPanel}</EditorCard>
        <EditorCard title={updateTitle}>{editPanel}</EditorCard>
      </div>
    </section>
  );
}

function EditorCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-line bg-surface/70 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        {title}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SelectionField({
  label,
  value,
  onChange,
  options,
  emptyLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  emptyLabel: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={options.length === 0}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:cursor-not-allowed disabled:bg-surface"
      >
        {options.length === 0 ? (
          <option value="">{emptyLabel}</option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusRow({
  items,
}: {
  items: readonly {
    label: string;
    tone: "accent" | "success" | "danger" | "muted" | "outline";
  }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={`${item.tone}-${item.label}`}
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            item.tone === "accent"
              ? "border-accent/20 bg-accent-soft text-accent"
              : item.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : item.tone === "danger"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : item.tone === "muted"
                    ? "border-zinc-200 bg-zinc-100 text-zinc-600"
                    : "border-line bg-white text-ink"
          }`}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}

function EmptyEditorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-line bg-white/70 px-4 py-6 text-sm leading-6 text-muted">
      {message}
    </p>
  );
}

function LocationStateForm({
  location,
  blockAction,
  unblockAction,
}: {
  location: Location;
  blockAction: EntityAction;
  unblockAction: EntityAction;
}) {
  const { messages } = useLocaleContext();
  const setupMessages = messages.warehouseSetup;
  const [state, formAction] = useActionState(
    (location.isBlocked ? unblockAction : blockAction).bind(null, location.id),
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-2xl border border-line bg-white px-4 py-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">
            {setupMessages.forms.blockStateTitle}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            {setupMessages.forms.blockStateDescription}
          </p>
        </div>

        <button
          type="submit"
          className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            location.isBlocked
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
              : "border border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100"
          }`}
        >
          {location.isBlocked
            ? setupMessages.forms.unblockLocation
            : setupMessages.forms.blockLocation}
        </button>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
          {state.error}
        </p>
      ) : null}

      {state.successMessage ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {state.successMessage}
        </p>
      ) : null}
    </form>
  );
}
