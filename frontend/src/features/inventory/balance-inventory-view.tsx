import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatLocalizedDateTime,
  formatLocalizedNumber,
} from "@/lib/format/locale-format";
import { interpolateMessage } from "@/lib/i18n/messages";
import type { InventoryBalance } from "@/types/inventory";

type BalanceInventoryViewProps = {
  balances: readonly InventoryBalance[];
  errorMessage: string | null;
};

export function BalanceInventoryView({
  balances,
  errorMessage,
}: BalanceInventoryViewProps) {
  const { locale, messages } = useLocaleContext();
  const inventoryMessages = messages.inventory;

  if (errorMessage) {
    return (
      <SectionErrorState
        eyebrow={messages.common.backendUnavailable}
        title={inventoryMessages.balanceView.unavailableTitle}
        message={errorMessage}
      />
    );
  }

  if (balances.length === 0) {
    return (
      <EmptyState
        eyebrow={inventoryMessages.balanceView.emptyEyebrow}
        label={inventoryMessages.balanceView.emptyMessage}
      />
    );
  }

  return (
    <div className="space-y-4">
      {balances.map((balance) => (
        <article
          key={balance.id}
          className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
        >
          <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {inventoryMessages.balanceView.productSection}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  {balance.productSku}
                </span>
                <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink">
                  {inventoryMessages.balanceView.balanceRowBadge}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                {balance.productName}
              </h2>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {inventoryMessages.balanceView.locationSection}
              </p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink">
                {balance.locationName}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {balance.warehouseCode} / {balance.zoneCode} / {balance.locationCode}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusChip
                  label={
                    balance.locationIsActive
                      ? messages.common.states.active
                      : messages.common.states.inactive
                  }
                  tone={balance.locationIsActive ? "success" : "muted"}
                />
                <StatusChip
                  label={
                    balance.locationIsBlocked
                      ? messages.common.states.blocked
                      : messages.common.states.unblocked
                  }
                  tone={balance.locationIsBlocked ? "danger" : "success"}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <MetricTile
                label={inventoryMessages.summary.onHand}
                value={formatLocalizedNumber(balance.onHandQuantity, locale, {
                  maximumFractionDigits: 2,
                })}
                tone="default"
              />
              <MetricTile
                label={inventoryMessages.summary.reserved}
                value={formatLocalizedNumber(balance.reservedQuantity, locale, {
                  maximumFractionDigits: 2,
                })}
                tone="warning"
              />
              <MetricTile
                label={inventoryMessages.summary.available}
                value={formatLocalizedNumber(balance.availableQuantity, locale, {
                  maximumFractionDigits: 2,
                })}
                tone="success"
              />
            </div>
          </div>

          <p className="mt-5 text-sm text-muted">
            {interpolateMessage(inventoryMessages.balanceView.updatedTemplate, {
              value: formatLocalizedDateTime(balance.updatedAtUtc, locale, {
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
      <p className="mt-4 text-xl font-semibold tracking-tight text-ink">{value}</p>
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
