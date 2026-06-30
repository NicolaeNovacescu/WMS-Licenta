"use client";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { interpolateMessage } from "@/lib/i18n/messages";

type ProductFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  totalCount: number;
  filteredCount: number;
};

export function ProductFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
}: ProductFiltersProps) {
  const { messages } = useLocaleContext();
  const productMessages = messages.products;

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <div className="space-y-2">
          <label
            htmlFor="product-search"
            className="text-sm font-semibold tracking-wide text-ink"
          >
            {productMessages.filters.searchLabel}
          </label>
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            placeholder={productMessages.filters.searchPlaceholder}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="product-status-filter"
            className="text-sm font-semibold tracking-wide text-ink"
          >
            {productMessages.filters.statusLabel}
          </label>
          <select
            id="product-status-filter"
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(
                event.target.value as "all" | "active" | "inactive",
              )
            }
            className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
          >
            <option value="all">{productMessages.filters.all}</option>
            <option value="active">{productMessages.filters.activeOnly}</option>
            <option value="inactive">{productMessages.filters.inactiveOnly}</option>
          </select>
        </div>

        <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">
          {interpolateMessage(productMessages.filters.showingTemplate, {
            filtered: filteredCount,
            total: totalCount,
          })}
        </div>
      </div>
    </section>
  );
}
