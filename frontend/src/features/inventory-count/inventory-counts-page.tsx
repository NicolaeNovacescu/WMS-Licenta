"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { ExportCsvButton } from "@/features/reports/export-csv-button";
import { InventoryCountForm } from "@/features/inventory-count/inventory-count-form";
import type { CsvExportColumn, CsvExportRow } from "@/lib/export/csv";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import { formatInventoryCountStatusLabel } from "@/lib/format/workflow-status";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { Product } from "@/types/catalog";
import type { InventoryBalance } from "@/types/inventory";
import type {
  InventoryCount,
  InventoryCountStatus,
  InventoryCountWorkflowFormState,
} from "@/types/inventory-count";
import type { Location } from "@/types/warehouse-structure";

type InventoryCountsPageProps = {
  currentRoles: readonly string[];
  inventoryCounts: readonly InventoryCount[];
  products: readonly Product[];
  locations: readonly Location[];
  inventoryBalances: readonly InventoryBalance[];
  canCreate: boolean;
  canExecute: boolean;
  createAction: (
    state: InventoryCountWorkflowFormState,
    formData: FormData,
  ) => Promise<InventoryCountWorkflowFormState>;
  startAction: (formData: FormData) => Promise<void>;
  cancelAction: (formData: FormData) => Promise<void>;
  createDataError: string | null;
  expectedPreviewWarning: string | null;
  actionError: string | null;
};

type CountStatusFilter = "all" | "open" | InventoryCountStatus;

const knownInventoryCountStatuses: readonly InventoryCountStatus[] = [
  "Draft",
  "InProgress",
  "Completed",
  "Cancelled",
];

export function InventoryCountsPage({
  currentRoles,
  inventoryCounts,
  products,
  locations,
  inventoryBalances,
  canCreate,
  canExecute,
  createAction,
  startAction,
  cancelAction,
  createDataError,
  expectedPreviewWarning,
  actionError,
}: InventoryCountsPageProps) {
  const { locale, messages } = useLocaleContext();
  const inventoryCountMessages = messages.inventoryCounts;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CountStatusFilter>("open");
  const deferredSearch = useDeferredValue(search);

  const filteredCounts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...inventoryCounts]
      .filter((inventoryCount) => {
        const matchesSearch =
          !query ||
          [
            inventoryCount.id,
            inventoryCount.status,
            ...inventoryCount.lines.flatMap((line) => [
              line.productSku,
              line.productName,
              line.warehouseCode,
              line.zoneCode,
              line.locationCode,
              line.locationName,
              line.locationType,
            ]),
          ].some((value) => value.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "open"
              ? inventoryCount.status === "Draft" ||
                inventoryCount.status === "InProgress"
              : inventoryCount.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => {
        const priority =
          getStatusPriority(left.status) - getStatusPriority(right.status);

        if (priority !== 0) {
          return priority;
        }

        return right.createdAtUtc.localeCompare(left.createdAtUtc);
      });
  }, [deferredSearch, inventoryCounts, statusFilter]);

  const exportRows = useMemo(
    () =>
      filteredCounts.flatMap((inventoryCount) => {
        const countLines =
          inventoryCount.lines.length > 0 ? inventoryCount.lines : [null];

        return countLines.map<CsvExportRow>((line) => ({
          inventoryCountId: inventoryCount.id,
          status: formatInventoryCountStatusLabel(inventoryCount.status, locale),
          createdAtUtc: formatTimestamp(inventoryCount.createdAtUtc, locale),
          startedAtUtc: inventoryCount.startedAtUtc
            ? formatTimestamp(inventoryCount.startedAtUtc, locale)
            : "",
          completedAtUtc: inventoryCount.completedAtUtc
            ? formatTimestamp(inventoryCount.completedAtUtc, locale)
            : "",
          cancelledAtUtc: inventoryCount.cancelledAtUtc
            ? formatTimestamp(inventoryCount.cancelledAtUtc, locale)
            : "",
          productSku: line?.productSku ?? "",
          productName: line?.productName ?? "",
          warehouseCode: line?.warehouseCode ?? "",
          zoneCode: line?.zoneCode ?? "",
          locationCode: line?.locationCode ?? "",
          locationName: line?.locationName ?? "",
          locationType:
            line == null
              ? ""
              : formatLocationTypeLabel(
                  line.locationType,
                  messages.warehouseSetup.forms.locationTypes,
                ),
          locationIsActive:
            line == null ? "" : formatBooleanFlag(line.locationIsActive, messages),
          locationIsBlocked:
            line == null ? "" : formatBooleanFlag(line.locationIsBlocked, messages),
          expectedSystemQuantity:
            line == null
              ? ""
              : formatQuantity(line.expectedSystemQuantity, locale),
          countedQuantity:
            line == null
              ? ""
              : formatNullableQuantity(line.countedQuantity, locale),
          varianceQuantity:
            line == null
              ? ""
              : formatNullableSignedQuantity(line.varianceQuantity, locale),
        }));
      }),
    [filteredCounts, locale, messages],
  );

  const exportColumns = useMemo<readonly CsvExportColumn[]>(
    () => [
      {
        key: "inventoryCountId",
        header: inventoryCountMessages.list.exportColumns.inventoryCountId,
      },
      {
        key: "status",
        header: inventoryCountMessages.list.exportColumns.status,
      },
      {
        key: "createdAtUtc",
        header: inventoryCountMessages.list.exportColumns.createdAtUtc,
      },
      {
        key: "startedAtUtc",
        header: inventoryCountMessages.list.exportColumns.startedAtUtc,
      },
      {
        key: "completedAtUtc",
        header: inventoryCountMessages.list.exportColumns.completedAtUtc,
      },
      {
        key: "cancelledAtUtc",
        header: inventoryCountMessages.list.exportColumns.cancelledAtUtc,
      },
      {
        key: "productSku",
        header: inventoryCountMessages.list.exportColumns.productSku,
      },
      {
        key: "productName",
        header: inventoryCountMessages.list.exportColumns.productName,
      },
      {
        key: "warehouseCode",
        header: inventoryCountMessages.list.exportColumns.warehouseCode,
      },
      {
        key: "zoneCode",
        header: inventoryCountMessages.list.exportColumns.zoneCode,
      },
      {
        key: "locationCode",
        header: inventoryCountMessages.list.exportColumns.locationCode,
      },
      {
        key: "locationName",
        header: inventoryCountMessages.list.exportColumns.locationName,
      },
      {
        key: "locationType",
        header: inventoryCountMessages.list.exportColumns.locationType,
      },
      {
        key: "locationIsActive",
        header: inventoryCountMessages.list.exportColumns.locationIsActive,
      },
      {
        key: "locationIsBlocked",
        header: inventoryCountMessages.list.exportColumns.locationIsBlocked,
      },
      {
        key: "expectedSystemQuantity",
        header: inventoryCountMessages.list.exportColumns.expectedSystemQuantity,
      },
      {
        key: "countedQuantity",
        header: inventoryCountMessages.list.exportColumns.countedQuantity,
      },
      {
        key: "varianceQuantity",
        header: inventoryCountMessages.list.exportColumns.varianceQuantity,
      },
    ],
    [inventoryCountMessages.list.exportColumns],
  );

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {inventoryCountMessages.list.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {inventoryCountMessages.list.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentRoles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink"
              >
                {messages.roles[role as keyof typeof messages.roles] ?? role}
              </span>
            ))}
          </div>
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {inventoryCountMessages.list.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.7fr]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {inventoryCountMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={inventoryCountMessages.list.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {inventoryCountMessages.list.statusLabel}
            </span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as CountStatusFilter)
              }
              className={inputClassName}
            >
              <option value="open">
                {inventoryCountMessages.list.openCountsFirst}
              </option>
              <option value="all">{inventoryCountMessages.list.allCounts}</option>
              {knownInventoryCountStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatInventoryCountStatusLabel(status, locale)}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {inventoryCountMessages.list.resultsLabel}
            </p>
            <p className="mt-3 text-sm font-medium text-ink">
              {interpolateMessage(inventoryCountMessages.list.resultsTemplate, {
                filtered: filteredCounts.length,
                total: inventoryCounts.length,
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <ExportCsvButton
            label={inventoryCountMessages.list.exportLabel}
            emptyLabel={inventoryCountMessages.list.exportEmptyLabel}
            fileName="inventory-counts.csv"
            columns={exportColumns}
            rows={exportRows}
          />
        </div>
      </section>

      <div className={`grid gap-6 ${canCreate ? "xl:grid-cols-[1.1fr_0.9fr]" : ""}`}>
        <section className="space-y-4">
          {filteredCounts.length === 0 ? (
            <EmptyState />
          ) : (
            filteredCounts.map((inventoryCount) => {
              const canStart = canExecute && inventoryCount.status === "Draft";
              const canCancel =
                canExecute &&
                (inventoryCount.status === "Draft" ||
                  inventoryCount.status === "InProgress");

              return (
                <article
                  key={inventoryCount.id}
                  className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                          {interpolateMessage(
                            inventoryCountMessages.list.countBadgeTemplate,
                            {
                              id: inventoryCount.id.slice(0, 8),
                            },
                          )}
                        </span>
                        <StatusBadge status={inventoryCount.status} />
                      </div>

                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                        {summarizeLineCount(
                          inventoryCount.lines.length,
                          inventoryCountMessages,
                          locale,
                        )}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {summarizeProducts(inventoryCount, inventoryCountMessages)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {interpolateMessage(
                          inventoryCountMessages.list.locationsTemplate,
                          {
                            locations: summarizeLocations(
                              inventoryCount,
                              inventoryCountMessages,
                            ),
                          },
                        )}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {inventoryCountMessages.list.workflowBoundary}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <Link
                        href={`/inventory-counts/${inventoryCount.id}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                      >
                        {canExecute && inventoryCount.status === "InProgress"
                          ? inventoryCountMessages.list.enterCountedQuantities
                          : inventoryCountMessages.list.viewDetails}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Metric
                      label={inventoryCountMessages.list.metrics.expected}
                      value={formatQuantity(sumExpectedQuantity(inventoryCount), locale)}
                    />
                    <Metric
                      label={inventoryCountMessages.list.metrics.counted}
                      value={formatOptionalQuantity(
                        sumCountedQuantity(inventoryCount),
                        locale,
                        inventoryCountMessages.detail.pendingEntry,
                      )}
                    />
                    <Metric
                      label={inventoryCountMessages.list.metrics.netVariance}
                      value={formatOptionalSignedQuantity(
                        sumVarianceQuantity(inventoryCount),
                        locale,
                        inventoryCountMessages.detail.pendingPreview,
                      )}
                    />
                    <Metric
                      label={inventoryCountMessages.list.metrics.created}
                      value={formatTimestamp(inventoryCount.createdAtUtc, locale)}
                    />
                    <Metric
                      label={inventoryCountMessages.list.metrics.completed}
                      value={
                        inventoryCount.completedAtUtc
                          ? formatTimestamp(inventoryCount.completedAtUtc, locale)
                          : inventoryCountMessages.list.notCompleted
                      }
                    />
                  </div>

                  {canStart || canCancel ? (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {canStart ? (
                        <WorkflowForm
                          action={startAction}
                          inventoryCountId={inventoryCount.id}
                          redirectTo="/inventory-counts"
                          label={inventoryCountMessages.list.start}
                          tone="secondary"
                        />
                      ) : null}

                      {canCancel ? (
                        <WorkflowForm
                          action={cancelAction}
                          inventoryCountId={inventoryCount.id}
                          redirectTo="/inventory-counts"
                          label={inventoryCountMessages.list.cancel}
                          tone="muted"
                        />
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </section>

        {canCreate ? (
          <div className="space-y-6">
            {createDataError ? (
              <div className="rounded-[28px] border border-amber-300 bg-warning-soft px-5 py-4 text-sm text-ink">
                {createDataError}
              </div>
            ) : (
              <InventoryCountForm
                action={createAction}
                products={products}
                locations={locations}
                inventoryBalances={inventoryBalances}
                expectedPreviewWarning={expectedPreviewWarning}
              />
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function WorkflowForm({
  action,
  inventoryCountId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  inventoryCountId: string;
  redirectTo: string;
  label: string;
  tone: "primary" | "secondary" | "muted";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="inventoryCountId" value={inventoryCountId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <WorkflowButton label={label} tone={tone} />
    </form>
  );
}

function WorkflowButton({
  label,
  tone,
}: {
  label: string;
  tone: "primary" | "secondary" | "muted";
}) {
  const { messages } = useLocaleContext();
  const { pending } = useFormStatus();
  const toneClass =
    tone === "primary"
      ? "bg-accent text-white hover:bg-accent/90"
      : tone === "secondary"
        ? "border border-line bg-white text-ink hover:border-accent hover:text-accent"
        : "border border-stone-300 bg-stone-100 text-stone-800 hover:border-stone-400 hover:bg-stone-200";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${toneClass}`}
    >
      {pending ? messages.common.working : label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: InventoryCountStatus }) {
  const { locale } = useLocaleContext();
  const toneClass =
    status === "Draft"
      ? "bg-stone-100 text-stone-700"
      : status === "InProgress"
        ? "bg-sky-50 text-sky-700"
        : status === "Completed"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {formatInventoryCountStatusLabel(status, locale)}
    </span>
  );
}

function EmptyState() {
  const { messages } = useLocaleContext();
  const inventoryCountMessages = messages.inventoryCounts;

  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {inventoryCountMessages.list.emptyEyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        {inventoryCountMessages.list.emptyMessage}
      </p>
    </div>
  );
}

function getStatusPriority(status: InventoryCountStatus) {
  switch (status) {
    case "Draft":
      return 0;
    case "InProgress":
      return 1;
    case "Completed":
      return 2;
    case "Cancelled":
      return 3;
  }
}

function summarizeLineCount(
  lineCount: number,
  inventoryCountMessages: Messages["inventoryCounts"],
  locale: Locale,
) {
  return interpolateMessage(inventoryCountMessages.list.lineCountTemplate, {
    count: lineCount,
    suffix: lineCount === 1 ? "" : locale === "ro" ? "i" : "s",
  });
}

function summarizeProducts(
  inventoryCount: InventoryCount,
  inventoryCountMessages: Messages["inventoryCounts"],
) {
  const products = Array.from(
    new Set(inventoryCount.lines.map((line) => line.productSku)),
  );
  const preview = products.slice(0, 3);

  if (products.length <= 3) {
    return preview.join(", ");
  }

  return interpolateMessage(inventoryCountMessages.list.moreTemplate, {
    preview: preview.join(", "),
    count: products.length - 3,
  });
}

function summarizeLocations(
  inventoryCount: InventoryCount,
  inventoryCountMessages: Messages["inventoryCounts"],
) {
  const locations = Array.from(
    new Set(
      inventoryCount.lines.map(
        (line) => `${line.warehouseCode} / ${line.zoneCode} / ${line.locationCode}`,
      ),
    ),
  );
  const preview = locations.slice(0, 2);

  if (locations.length <= 2) {
    return preview.join(", ");
  }

  return interpolateMessage(inventoryCountMessages.list.moreTemplate, {
    preview: preview.join(", "),
    count: locations.length - 2,
  });
}

function sumExpectedQuantity(inventoryCount: InventoryCount) {
  return inventoryCount.lines.reduce(
    (total, line) => total + line.expectedSystemQuantity,
    0,
  );
}

function sumCountedQuantity(inventoryCount: InventoryCount) {
  if (inventoryCount.lines.some((line) => line.countedQuantity === null)) {
    return null;
  }

  return inventoryCount.lines.reduce(
    (total, line) => total + (line.countedQuantity ?? 0),
    0,
  );
}

function sumVarianceQuantity(inventoryCount: InventoryCount) {
  if (inventoryCount.lines.some((line) => line.varianceQuantity === null)) {
    return null;
  }

  return inventoryCount.lines.reduce(
    (total, line) => total + (line.varianceQuantity ?? 0),
    0,
  );
}

function formatTimestamp(value: string, locale: Locale) {
  return formatLocalizedDateTime(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatQuantity(value: number, locale: Locale) {
  return formatLocalizedQuantity(value, locale);
}

function formatOptionalQuantity(
  value: number | null,
  locale: Locale,
  pendingLabel: string,
) {
  return value === null ? pendingLabel : formatQuantity(value, locale);
}

function formatOptionalSignedQuantity(
  value: number | null,
  locale: Locale,
  pendingLabel: string,
) {
  return value === null ? pendingLabel : formatSignedQuantity(value, locale);
}

function formatSignedQuantity(value: number, locale: Locale) {
  const formatted = formatQuantity(Math.abs(value), locale);

  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

function formatNullableQuantity(value: number | null, locale: Locale) {
  return value == null ? "" : formatQuantity(value, locale);
}

function formatNullableSignedQuantity(value: number | null, locale: Locale) {
  return value == null ? "" : formatSignedQuantity(value, locale);
}

function formatBooleanFlag(value: boolean, messages: Messages) {
  return value ? messages.common.yes : messages.common.no;
}

function formatLocationTypeLabel(
  locationType: string,
  labels: Messages["warehouseSetup"]["forms"]["locationTypes"],
) {
  return labels[locationType as keyof typeof labels] ?? locationType;
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
