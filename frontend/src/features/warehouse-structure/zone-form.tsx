"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import type {
  Warehouse,
  WarehouseStructureFormState,
} from "@/types/warehouse-structure";

type ZoneFormProps = {
  action: (
    state: WarehouseStructureFormState,
    formData: FormData,
  ) => Promise<WarehouseStructureFormState>;
  warehouses: readonly Warehouse[];
  zone?: {
    warehouseId: string;
    code: string;
    name: string;
    isActive: boolean;
  };
  mode: "create" | "edit";
};

const initialState: WarehouseStructureFormState = {
  error: null,
  successMessage: null,
};

export function ZoneForm({
  action,
  warehouses,
  zone,
  mode,
}: ZoneFormProps) {
  const { messages } = useLocaleContext();
  const setupMessages = messages.warehouseSetup;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (mode === "create" && state.successMessage) {
      formRef.current?.reset();
    }
  }, [mode, state.successMessage]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {setupMessages.forms.zoneWarehouse}
        </span>
        <select
          name="warehouseId"
          defaultValue={zone?.warehouseId ?? warehouses[0]?.id ?? ""}
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

      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          label={setupMessages.forms.zoneCode}
          name="code"
          placeholder="PICK"
          defaultValue={zone?.code ?? ""}
        />
        <InputField
          label={setupMessages.forms.zoneName}
          name="name"
          placeholder="Picking"
          defaultValue={zone?.name ?? ""}
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={zone?.isActive ?? true}
          className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
        />
        {setupMessages.forms.zoneIsActive}
      </label>

      <FormMessages state={state} />
      <SubmitButton
        label={
          mode === "create"
            ? setupMessages.forms.createZone
            : setupMessages.forms.saveZone
        }
        pendingLabel={setupMessages.forms.saving}
      />
    </form>
  );
}

function InputField({
  label,
  name,
  placeholder,
  defaultValue = "",
}: {
  label: string;
  name: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <input
        name={name}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
      />
    </label>
  );
}

function FormMessages({ state }: { state: WarehouseStructureFormState }) {
  return (
    <>
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
    </>
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
