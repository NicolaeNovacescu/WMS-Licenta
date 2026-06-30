"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import type {
  Location,
  Warehouse,
  WarehouseStructureFormState,
  Zone,
} from "@/types/warehouse-structure";

type LocationFormProps = {
  action: (
    state: WarehouseStructureFormState,
    formData: FormData,
  ) => Promise<WarehouseStructureFormState>;
  warehouses: readonly Warehouse[];
  zones: readonly Zone[];
  location?: Location;
  mode: "create" | "edit";
};

const initialState: WarehouseStructureFormState = {
  error: null,
  successMessage: null,
};

const locationTypeOptions = [
  "PICKING",
  "BULK",
  "RECEIVING",
  "STAGING",
] as const;

export function LocationForm({
  action,
  warehouses,
  zones,
  location,
  mode,
}: LocationFormProps) {
  const { messages } = useLocaleContext();
  const setupMessages = messages.warehouseSetup;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(
    location?.warehouseId ?? warehouses[0]?.id ?? "",
  );

  const filteredZones = useMemo(
    () => zones.filter((zone) => zone.warehouseId === selectedWarehouseId),
    [selectedWarehouseId, zones],
  );

  useEffect(() => {
    if (mode === "create" && state.successMessage) {
      formRef.current?.reset();
    }
  }, [mode, state.successMessage]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {setupMessages.forms.locationWarehouse}
          </span>
          <select
            name="warehouseId"
            value={selectedWarehouseId}
            onChange={(event) => setSelectedWarehouseId(event.target.value)}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
          >
            <option value="">{setupMessages.forms.selectWarehouse}</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.code} - {warehouse.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {setupMessages.forms.locationZone}
          </span>
          <select
            name="zoneId"
            defaultValue={location?.zoneId ?? filteredZones[0]?.id ?? ""}
            key={`${selectedWarehouseId}-${location?.zoneId ?? "new"}`}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
          >
            <option value="">{setupMessages.forms.selectZone}</option>
            {filteredZones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.code} - {zone.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          label={setupMessages.forms.locationCode}
          name="code"
          defaultValue={location?.code ?? ""}
          placeholder="PICK-A-01"
        />
        <InputField
          label={setupMessages.forms.locationName}
          name="name"
          defaultValue={location?.name ?? ""}
          placeholder="Picking A-01"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {setupMessages.forms.locationType}
          </span>
          <select
            name="locationType"
            defaultValue={location?.locationType ?? locationTypeOptions[0]}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
          >
            {locationTypeOptions.map((option) => (
              <option key={option} value={option}>
                {setupMessages.forms.locationTypes[option]}
              </option>
            ))}
          </select>
        </label>

        <InputField
          label={setupMessages.forms.mapRow}
          name="mapRow"
          type="number"
          defaultValue={String(location?.mapRow ?? 0)}
        />
        <InputField
          label={setupMessages.forms.mapColumn}
          name="mapColumn"
          type="number"
          defaultValue={String(location?.mapColumn ?? 0)}
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={location?.isActive ?? true}
          className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
        />
        {setupMessages.forms.locationIsActive}
      </label>

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

      <SubmitButton
        label={
          mode === "create"
            ? setupMessages.forms.createLocation
            : setupMessages.forms.saveLocation
        }
        pendingLabel={setupMessages.forms.saving}
      />
    </form>
  );
}

function InputField({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  type?: "text" | "number";
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
      />
    </label>
  );
}

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
