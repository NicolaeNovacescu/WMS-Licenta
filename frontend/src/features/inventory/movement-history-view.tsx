import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatLocalizedDateTime,
  formatLocalizedNumber,
} from "@/lib/format/locale-format";
import type { InventoryMovement } from "@/types/inventory";

type MovementHistoryViewProps = {
  movements: readonly InventoryMovement[];
  errorMessage: string | null;
};

export function MovementHistoryView({
  movements,
  errorMessage,
}: MovementHistoryViewProps) {
  const { locale, messages } = useLocaleContext();
  const inventoryMessages = messages.inventory;
  const movementMessages = inventoryMessages.movementHistory;

  if (errorMessage) {
    return (
      <SectionErrorState
        eyebrow={messages.common.backendUnavailable}
        title={movementMessages.unavailableTitle}
        message={errorMessage}
      />
    );
  }

  if (movements.length === 0) {
    return (
      <EmptyState
        eyebrow={movementMessages.emptyEyebrow}
        label={movementMessages.emptyMessage}
      />
    );
  }

  return (
    <div className="space-y-4">
      {movements.map((movement) => (
        <article
          key={movement.id}
          className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
        >
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr_0.95fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  {movement.productSku}
                </span>
                <TypeChip movementType={movement.movementType} />
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                {movement.productName}
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MetaTile
                  label={messages.common.quantity}
                  value={formatLocalizedNumber(movement.quantity, locale, {
                    maximumFractionDigits: 2,
                  })}
                />
                <MetaTile
                  label={messages.common.performed}
                  value={formatLocalizedDateTime(movement.performedAtUtc, locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MetaTile
                  label={messages.common.reference}
                  value={formatReferenceValue(movement, messages.common.notLinked)}
                />
                <MetaTile
                  label={messages.common.performedBy}
                  value={movement.performedByUserName ?? movementMessages.notRecorded}
                />
              </div>
            </div>

            <LocationColumn
              label={messages.common.source}
              warehouseCode={movement.sourceWarehouseCode}
              zoneCode={movement.sourceZoneCode}
              locationCode={movement.sourceLocationCode}
              locationName={movement.sourceLocationName}
              emptyLabel={movementMessages.noSourceLocation}
            />

            <LocationColumn
              label={messages.common.destination}
              warehouseCode={movement.destinationWarehouseCode}
              zoneCode={movement.destinationZoneCode}
              locationCode={movement.destinationLocationCode}
              locationName={movement.destinationLocationName}
              emptyLabel={movementMessages.noDestinationLocation}
            />
          </div>

          {movement.notes ? (
            <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {messages.common.notes}
              </p>
              <p className="mt-3 text-sm leading-7 text-ink">{movement.notes}</p>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function LocationColumn({
  label,
  warehouseCode,
  zoneCode,
  locationCode,
  locationName,
  emptyLabel,
}: {
  label: string;
  warehouseCode: string | null;
  zoneCode: string | null;
  locationCode: string | null;
  locationName: string | null;
  emptyLabel: string;
}) {
  const locationPath = [warehouseCode, zoneCode, locationCode]
    .filter((value): value is string => Boolean(value))
    .join(" / ");

  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        {label}
      </p>
      {locationPath ? (
        <>
          <p className="mt-4 text-lg font-semibold tracking-tight text-ink">
            {locationCode}
          </p>
          <p className="mt-2 text-sm text-muted">{locationPath}</p>
          {locationName ? (
            <p className="mt-4 text-sm leading-7 text-ink">{locationName}</p>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-sm leading-7 text-muted">{emptyLabel}</p>
      )}
    </div>
  );
}

function MetaTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-4 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function TypeChip({
  movementType,
}: {
  movementType: InventoryMovement["movementType"];
}) {
  const toneClass =
    movementType === "Addition"
      ? "bg-emerald-50 text-emerald-700"
      : movementType === "Removal"
        ? "bg-rose-50 text-rose-700"
        : "bg-sky-50 text-sky-700";
  const { messages } = useLocaleContext();

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {messages.inventory.movementHistory.types[movementType]}
    </span>
  );
}

function formatReferenceValue(
  movement: InventoryMovement,
  notLinkedLabel: string,
) {
  if (movement.referenceType && movement.referenceId) {
    return `${movement.referenceType}: ${movement.referenceId}`;
  }

  if (movement.referenceType) {
    return movement.referenceType;
  }

  if (movement.referenceId) {
    return movement.referenceId;
  }

  return notLinkedLabel;
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
