"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { ExportCsvButton } from "@/features/reports/export-csv-button";
import type { CsvExportColumn, CsvExportRow } from "@/lib/export/csv";
import { formatLocalizedDateTime } from "@/lib/format/locale-format";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { AuditLog } from "@/types/audit";

type AuditLogsPageProps = {
  currentRoles: readonly string[];
  auditLogs: readonly AuditLog[];
};

export function AuditLogsPage({
  currentRoles,
  auditLogs,
}: AuditLogsPageProps) {
  const { locale, messages } = useLocaleContext();
  const auditMessages = messages.auditLogs;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filteredAuditLogs = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...auditLogs]
      .filter((auditLog) => {
        if (!query) {
          return true;
        }

        return [
          auditLog.id,
          auditLog.actorUserId ?? "",
          auditLog.actorUserName ?? "",
          auditLog.actorRolesSummary ?? "",
          auditLog.actionType,
          auditLog.entityType,
          auditLog.entityId,
          auditLog.summary,
          auditLog.metadataJson ?? "",
        ].some((value) => value.toLowerCase().includes(query));
      })
      .sort((left, right) =>
        right.performedAtUtc.localeCompare(left.performedAtUtc),
      );
  }, [auditLogs, deferredSearch]);

  const exportRows = useMemo(
    () =>
      filteredAuditLogs.map<CsvExportRow>((auditLog) => ({
        performedAtUtc: formatTimestamp(auditLog.performedAtUtc, locale),
        actorUserId: auditLog.actorUserId ?? "",
        actorUserName: auditLog.actorUserName ?? "",
        actorRolesSummary:
          formatActorRolesSummary(auditLog.actorRolesSummary, messages) ?? "",
        actionType: formatMappedLabel(
          auditLog.actionType,
          auditMessages.shared.actionTypes,
        ),
        entityType: formatMappedLabel(
          auditLog.entityType,
          auditMessages.shared.entityTypes,
        ),
        entityId: auditLog.entityId,
        summary: auditLog.summary,
        metadataJson: auditLog.metadataJson ?? "",
      })),
    [auditMessages.shared.actionTypes, auditMessages.shared.entityTypes, filteredAuditLogs, locale, messages],
  );

  const exportColumns = useMemo<readonly CsvExportColumn[]>(
    () => [
      {
        key: "performedAtUtc",
        header: auditMessages.list.exportColumns.performedAtUtc,
      },
      {
        key: "actorUserId",
        header: auditMessages.list.exportColumns.actorUserId,
      },
      {
        key: "actorUserName",
        header: auditMessages.list.exportColumns.actorUserName,
      },
      {
        key: "actorRolesSummary",
        header: auditMessages.list.exportColumns.actorRolesSummary,
      },
      {
        key: "actionType",
        header: auditMessages.list.exportColumns.actionType,
      },
      {
        key: "entityType",
        header: auditMessages.list.exportColumns.entityType,
      },
      {
        key: "entityId",
        header: auditMessages.list.exportColumns.entityId,
      },
      {
        key: "summary",
        header: auditMessages.list.exportColumns.summary,
      },
      {
        key: "metadataJson",
        header: auditMessages.list.exportColumns.metadataJson,
      },
    ],
    [auditMessages.list.exportColumns],
  );

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {auditMessages.list.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {auditMessages.list.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentRoles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink"
              >
                {formatRoleLabel(role, messages)}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {auditMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={auditMessages.list.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {auditMessages.list.resultsLabel}
            </p>
            <p className="mt-3 text-sm font-medium text-ink">
              {interpolateMessage(auditMessages.list.resultsTemplate, {
                filtered: filteredAuditLogs.length,
                total: auditLogs.length,
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <ExportCsvButton
            label={auditMessages.list.exportLabel}
            emptyLabel={auditMessages.list.exportEmptyLabel}
            fileName="audit-log.csv"
            columns={exportColumns}
            rows={exportRows}
          />
        </div>
      </section>

      <section className="space-y-4">
        {filteredAuditLogs.length === 0 ? (
          <EmptyState />
        ) : (
          filteredAuditLogs.map((auditLog) => {
            const actionLabel = formatMappedLabel(
              auditLog.actionType,
              auditMessages.shared.actionTypes,
            );
            const entityLabel = formatMappedLabel(
              auditLog.entityType,
              auditMessages.shared.entityTypes,
            );

            return (
              <article
                key={auditLog.id}
                className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <TraceBadge label={actionLabel} tone="accent" />
                      <TraceBadge label={entityLabel} tone="neutral" />
                      {auditLog.metadataJson ? (
                        <TraceBadge
                          label={auditMessages.shared.metadataBadge}
                          tone="ok"
                        />
                      ) : null}
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                      {auditLog.summary}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {interpolateMessage(auditMessages.list.performedByTemplate, {
                        timestamp: formatTimestamp(auditLog.performedAtUtc, locale),
                        actor: formatActorLabel(auditLog, messages),
                      })}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {interpolateMessage(auditMessages.list.entityTemplate, {
                        entityType: entityLabel,
                        entityId: auditLog.entityId,
                      })}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {auditMessages.list.traceabilityDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/audit-logs/${auditLog.id}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                    >
                      {auditMessages.list.viewDetail}
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <Metric
                    label={auditMessages.list.metrics.performed}
                    value={formatTimestamp(auditLog.performedAtUtc, locale)}
                  />
                  <Metric
                    label={auditMessages.list.metrics.actor}
                    value={formatActorLabel(auditLog, messages)}
                  />
                  <Metric
                    label={auditMessages.list.metrics.actionType}
                    value={actionLabel}
                  />
                  <Metric
                    label={auditMessages.list.metrics.entityType}
                    value={entityLabel}
                  />
                  <Metric
                    label={auditMessages.list.metrics.entityId}
                    value={auditLog.entityId}
                    mono
                  />
                </div>
              </article>
            );
          })
        )}
      </section>
    </section>
  );
}

function Metric({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p
        className={`mt-3 text-sm font-semibold text-ink ${mono ? "break-all font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function TraceBadge({
  label,
  tone,
}: {
  label: string;
  tone: "accent" | "neutral" | "ok";
}) {
  const toneClass =
    tone === "accent"
      ? "bg-accent-soft text-accent"
      : tone === "ok"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-stone-100 text-stone-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
  );
}

function EmptyState() {
  const { messages } = useLocaleContext();
  const auditMessages = messages.auditLogs;

  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {auditMessages.list.emptyEyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        {auditMessages.list.emptyMessage}
      </p>
    </div>
  );
}

function formatTimestamp(value: string, locale: Locale) {
  return formatLocalizedDateTime(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatActorLabel(auditLog: AuditLog, messages: Messages) {
  const actorName = normalizeValue(auditLog.actorUserName);
  const roleSummary = formatActorRolesSummary(auditLog.actorRolesSummary, messages);
  const actorParts = [actorName, roleSummary].filter(
    (value): value is string => Boolean(value),
  );

  if (actorParts.length > 0) {
    return actorParts.join(" - ");
  }

  if (auditLog.actorUserId) {
    return interpolateMessage(messages.auditLogs.shared.unknownActorTemplate, {
      id: auditLog.actorUserId,
    });
  }

  return messages.auditLogs.shared.systemOrUnknownContext;
}

function formatActorRolesSummary(
  roleSummary: string | null,
  messages: Messages,
) {
  const roles = roleSummary
    ?.split(",")
    .map((role) => role.trim())
    .filter(Boolean);

  if (!roles || roles.length === 0) {
    return null;
  }

  return roles.map((role) => formatRoleLabel(role, messages)).join(", ");
}

function formatRoleLabel(role: string, messages: Messages) {
  return messages.roles[role as keyof typeof messages.roles] ?? role;
}

function normalizeValue(value: string | null) {
  return value && value.trim() ? value.trim() : null;
}

function formatMappedLabel(
  value: string,
  labels: Record<string, string>,
) {
  return labels[value] ?? value;
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
