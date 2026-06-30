import Link from "next/link";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatLocalizedDateTime,
  formatLocalizedNumber,
} from "@/lib/format/locale-format";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { InventoryByLocation } from "@/types/inventory";

type LocationInventoryViewProps = {
  locations: readonly InventoryByLocation[];
  errorMessage: string | null;
};

export function LocationInventoryView({
  locations,
  errorMessage,
}: LocationInventoryViewProps) {
  const { locale, messages } = useLocaleContext();
  const inventoryMessages = messages.inventory;

  if (errorMessage) {
    return (
      <SectionErrorState
        eyebrow={messages.common.backendUnavailable}
        title={inventoryMessages.locationView.unavailableTitle}
        message={errorMessage}
      />
    );
  }

  if (locations.length === 0) {
    return (
      <EmptyState
        eyebrow={inventoryMessages.locationView.emptyEyebrow}
        label={inventoryMessages.locationView.emptyMessage}
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {locations.map((location) => (
        <article
          key={location.locationId}
          className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  {location.locationCode}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {location.locationType}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                {location.locationName}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {location.warehouseCode} / {location.zoneCode}
              </p>
            </div>

            <Link
              href={`/locations/${location.locationId}`}
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {inventoryMessages.locationView.openLocation}
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <StatusChip
              label={
                location.locationIsActive
                  ? messages.common.states.active
                  : messages.common.states.inactive
              }
              tone={location.locationIsActive ? "success" : "muted"}
            />
            <StatusChip
              label={
                location.locationIsBlocked
                  ? messages.common.states.blocked
                  : messages.common.states.unblocked
              }
              tone={location.locationIsBlocked ? "danger" : "success"}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricTile
              label={inventoryMessages.summary.onHand}
              value={formatLocalizedNumber(location.onHandQuantity, locale, {
                maximumFractionDigits: 2,
              })}
              tone="default"
            />
            <MetricTile
              label={inventoryMessages.summary.reserved}
              value={formatLocalizedNumber(location.reservedQuantity, locale, {
                maximumFractionDigits: 2,
              })}
              tone="warning"
            />
            <MetricTile
              label={inventoryMessages.summary.available}
              value={formatLocalizedNumber(location.availableQuantity, locale, {
                maximumFractionDigits: 2,
              })}
              tone="success"
            />
          </div>

          <p className="mt-5 text-sm text-muted">
            {interpolateMessage(inventoryMessages.locationView.updatedTemplate, {
              value: formatLocalizedDateTime(location.updatedAtUtc, locale, {
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

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "muted" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "bg-rose-50 text-rose-700"
      : tone === "success"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-zinc-100 text-zinc-600";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
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

function SectionErrorState({
  eyebrow,
  title,
  message,
}: {
  eyebrow: string;
  title: string;
  message: string;
}) {
  return (
    <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-muted">{message}</p>
    </section>
  );
}
