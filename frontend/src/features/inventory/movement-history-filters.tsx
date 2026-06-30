import type { InventoryMovementType } from "@/types/inventory";
import { useLocaleContext } from "@/features/i18n/locale-provider";

type MovementHistoryFiltersProps = {
  productOptions: readonly FilterOption[];
  locationOptions: readonly FilterOption[];
  selectedProductId: string;
  onProductIdChange: (value: string) => void;
  selectedLocationId: string;
  onLocationIdChange: (value: string) => void;
  selectedMovementType: InventoryMovementType | "all";
  onMovementTypeChange: (value: InventoryMovementType | "all") => void;
};

type FilterOption = {
  value: string;
  label: string;
};

const movementTypes: readonly InventoryMovementType[] = [
  "Addition",
  "Removal",
  "Relocation",
];

export function MovementHistoryFilters({
  productOptions,
  locationOptions,
  selectedProductId,
  onProductIdChange,
  selectedLocationId,
  onLocationIdChange,
  selectedMovementType,
  onMovementTypeChange,
}: MovementHistoryFiltersProps) {
  const { messages } = useLocaleContext();
  const movementMessages = messages.inventory.movementHistory;

  return (
    <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
      <div className="grid gap-4 lg:grid-cols-3">
        <FilterSelect
          label={movementMessages.filters.product}
          value={selectedProductId}
          onChange={onProductIdChange}
          defaultLabel={movementMessages.filters.allProducts}
          options={productOptions}
        />
        <FilterSelect
          label={movementMessages.filters.location}
          value={selectedLocationId}
          onChange={onLocationIdChange}
          defaultLabel={movementMessages.filters.allLocations}
          options={locationOptions}
        />
        <FilterSelect
          label={movementMessages.filters.movementType}
          value={selectedMovementType}
          onChange={(value) =>
            onMovementTypeChange(value as InventoryMovementType | "all")
          }
          defaultLabel={movementMessages.filters.allMovementTypes}
          options={movementTypes.map((value) => ({
            value,
            label: movementMessages.types[value],
          }))}
        />
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  defaultLabel,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  defaultLabel: string;
  options: readonly FilterOption[];
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
      >
        <option value="all">{defaultLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
