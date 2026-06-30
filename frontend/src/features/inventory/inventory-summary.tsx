import type {
  InventoryByLocation,
  InventoryByProduct,
} from "@/types/inventory";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import { formatLocalizedNumber } from "@/lib/format/locale-format";
import { interpolateMessage } from "@/lib/i18n/messages";

type InventorySummaryProps = {
  productInventory: readonly InventoryByProduct[];
  locationInventory: readonly InventoryByLocation[];
  canViewDetailed: boolean;
};

export function InventorySummary({
  productInventory,
  locationInventory,
  canViewDetailed,
}: InventorySummaryProps) {
  const { locale, messages } = useLocaleContext();
  const summaryMessages = messages.inventory.summary;
  const totalOnHand = productInventory.reduce(
    (sum, row) => sum + row.onHandQuantity,
    0,
  );
  const totalReserved = productInventory.reduce(
    (sum, row) => sum + row.reservedQuantity,
    0,
  );
  const totalAvailable = productInventory.reduce(
    (sum, row) => sum + row.availableQuantity,
    0,
  );

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={summaryMessages.productsVisible}
          value={String(productInventory.length)}
          tone="accent"
        />
        <MetricCard
          label={summaryMessages.onHand}
          value={formatLocalizedNumber(totalOnHand, locale, {
            maximumFractionDigits: 2,
          })}
          tone="default"
        />
        <MetricCard
          label={summaryMessages.reserved}
          value={formatLocalizedNumber(totalReserved, locale, {
            maximumFractionDigits: 2,
          })}
          tone="warning"
        />
        <MetricCard
          label={summaryMessages.available}
          value={formatLocalizedNumber(totalAvailable, locale, {
            maximumFractionDigits: 2,
          })}
          tone="success"
        />
      </div>

      <div className="rounded-[28px] border border-line bg-white/82 px-5 py-4 text-sm text-muted shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <span className="font-semibold text-ink">
          {summaryMessages.availabilityRuleLabel}:
        </span>{" "}
        {summaryMessages.availabilityRuleBody}
        {canViewDetailed ? (
          ` ${interpolateMessage(summaryMessages.locationAwareTemplate, {
            count: locationInventory.length,
          })}`
        ) : (
          ` ${summaryMessages.salesVisibilityNote}`
        )}
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "accent" | "default" | "warning" | "success";
}) {
  const toneClass =
    tone === "accent"
      ? "bg-accent-soft text-accent"
      : tone === "warning"
        ? "bg-warning-soft text-warning"
        : tone === "success"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-surface text-ink";

  return (
    <article className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <div
        className={`mt-4 inline-flex rounded-full px-4 py-2 text-xs font-semibold ${toneClass}`}
      >
        {label}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">{value}</p>
    </article>
  );
}
