import Link from "next/link";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatLocalizedDateTime,
  formatLocalizedNumber,
} from "@/lib/format/locale-format";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { InventoryByProduct } from "@/types/inventory";

type ProductInventoryViewProps = {
  products: readonly InventoryByProduct[];
};

export function ProductInventoryView({
  products,
}: ProductInventoryViewProps) {
  const { locale, messages } = useLocaleContext();
  const inventoryMessages = messages.inventory;

  if (products.length === 0) {
    return (
      <EmptyState
        eyebrow={inventoryMessages.productView.emptyEyebrow}
        label={inventoryMessages.productView.emptyMessage}
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {products.map((product) => (
        <article
          key={product.productId}
          className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  {product.productSku}
                </span>
                <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink">
                  {inventoryMessages.productView.derivedBadge}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                {product.productName}
              </h2>
            </div>

            <Link
              href={`/products/${product.productId}`}
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {inventoryMessages.productView.openProduct}
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricTile
              label={inventoryMessages.summary.onHand}
              value={formatLocalizedNumber(product.onHandQuantity, locale, {
                maximumFractionDigits: 2,
              })}
              tone="default"
            />
            <MetricTile
              label={inventoryMessages.summary.reserved}
              value={formatLocalizedNumber(product.reservedQuantity, locale, {
                maximumFractionDigits: 2,
              })}
              tone="warning"
            />
            <MetricTile
              label={inventoryMessages.summary.available}
              value={formatLocalizedNumber(product.availableQuantity, locale, {
                maximumFractionDigits: 2,
              })}
              tone="success"
            />
          </div>

          <p className="mt-5 text-sm text-muted">
            {interpolateMessage(inventoryMessages.productView.updatedTemplate, {
              value: formatLocalizedDateTime(product.updatedAtUtc, locale, {
                dateStyle: "medium",
                timeStyle: "short",
              }),
            })}
          </p>
        </article>
      ))}
    </div>
  );
}

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "default" | "warning" | "success";
}) {
  const toneClass =
    tone === "warning"
      ? "bg-warning-soft text-warning"
      : tone === "success"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-surface text-ink";

  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p
        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}
      >
        {label}
      </p>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}

function EmptyState({
  eyebrow,
  label,
}: {
  eyebrow: string;
  label: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/72 px-6 py-12 text-center shadow-[0_18px_70px_rgba(29,41,56,0.05)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
        {eyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">{label}</p>
    </div>
  );
}
