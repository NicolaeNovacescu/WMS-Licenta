import type { InventoryView, LocationStateFilter } from "@/types/inventory";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import { interpolateMessage } from "@/lib/i18n/messages";

type InventoryFiltersProps = {
  activeView: InventoryView;
  search: string;
  onSearchChange: (value: string) => void;
  locationStateFilter: LocationStateFilter;
  onLocationStateFilterChange: (value: LocationStateFilter) => void;
  showLocationStateFilter: boolean;
  totalCount: number;
  filteredCount: number;
};

export function InventoryFilters({
  activeView,
  search,
  onSearchChange,
  locationStateFilter,
  onLocationStateFilterChange,
  showLocationStateFilter,
  totalCount,
  filteredCount,
}: InventoryFiltersProps) {
  const { messages } = useLocaleContext();
  const filtersMessages = messages.inventory.filters;
  const searchPlaceholder =
    activeView === "product"
      ? filtersMessages.searchPlaceholderProduct
      : activeView === "location"
        ? filtersMessages.searchPlaceholderLocation
        : activeView === "balance"
          ? filtersMessages.searchPlaceholderBalance
          : filtersMessages.searchPlaceholderMovement;

  return (
    <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
      <div
        className={`grid gap-4 ${
          showLocationStateFilter
            ? "lg:grid-cols-[1.4fr_0.8fr_0.7fr]"
            : "lg:grid-cols-[1.7fr_0.7fr]"
        }`}
      >
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {filtersMessages.searchLabel}
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
        </label>

        {showLocationStateFilter ? (
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {filtersMessages.locationStateLabel}
            </span>
            <select
              value={locationStateFilter}
              onChange={(event) =>
                onLocationStateFilterChange(event.target.value as LocationStateFilter)
              }
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            >
              <option value="all">{filtersMessages.locationStates.all}</option>
              <option value="active">{filtersMessages.locationStates.active}</option>
              <option value="inactive">{filtersMessages.locationStates.inactive}</option>
              <option value="blocked">{filtersMessages.locationStates.blocked}</option>
              <option value="unblocked">
                {filtersMessages.locationStates.unblocked}
              </option>
            </select>
          </label>
        ) : null}

        <div className="rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {filtersMessages.resultsLabel}
          </p>
          <p className="mt-3 text-sm font-medium text-ink">
            {interpolateMessage(filtersMessages.resultsTemplate, {
              filtered: filteredCount,
              total: totalCount,
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
