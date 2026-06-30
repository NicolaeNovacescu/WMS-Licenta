"use client";

import Link from "next/link";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { formatLocalizedDateTime } from "@/lib/format/locale-format";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { AuditLog } from "@/types/audit";

type AuditLogDetailPageProps = {
  auditLog: AuditLog;
};

export function AuditLogDetailPage({ auditLog }: AuditLogDetailPageProps) {
  const { locale, messages } = useLocaleContext();
  const auditMessages = messages.auditLogs;
  const metadata = formatMetadata(auditLog.metadataJson);
  const actionLabel = formatMappedLabel(
    auditLog.actionType,
    auditMessages.shared.actionTypes,
  );
  const entityLabel = formatMappedLabel(
    auditLog.entityType,
    auditMessages.shared.entityTypes,
  );
  const actorDisplay = formatActorLabel(auditLog, messages);
  const actorRoles = formatActorRolesSummary(auditLog.actorRolesSummary, messages);

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
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

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {interpolateMessage(auditMessages.detail.titleTemplate, {
                id: auditLog.id.slice(0, 8),
              })}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/audit-logs"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {auditMessages.detail.backToAuditLogs}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric
            label={auditMessages.detail.metrics.performed}
            value={formatTimestamp(auditLog.performedAtUtc, locale)}
          />
          <Metric
            label={auditMessages.detail.metrics.actor}
            value={actorDisplay}
          />
          <Metric
            label={auditMessages.detail.metrics.actionType}
            value={actionLabel}
          />
          <Metric
            label={auditMessages.detail.metrics.entityType}
            value={entityLabel}
          />
          <Metric
            label={auditMessages.detail.metrics.entityId}
            value={auditLog.entityId}
            mono
          />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {auditMessages.detail.summaryEyebrow}
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
              {auditLog.summary}
            </h2>
          </section>

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {auditMessages.detail.actorContextEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow
                label={auditMessages.detail.actorDisplay}
                value={actorDisplay}
              />
              <DetailRow
                label={auditMessages.detail.actorUserName}
                value={
                  normalizeValue(auditLog.actorUserName) ??
                  auditMessages.detail.notRecorded
                }
              />
              <DetailRow
                label={auditMessages.detail.actorRoles}
                value={actorRoles ?? auditMessages.detail.notRecorded}
              />
              <DetailRow
                label={auditMessages.detail.actorUserId}
                value={auditLog.actorUserId ?? auditMessages.detail.notRecorded}
                mono={Boolean(auditLog.actorUserId)}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {auditMessages.detail.entityContextEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow
                label={auditMessages.detail.auditEntryId}
                value={auditLog.id}
                mono
              />
              <DetailRow
                label={auditMessages.detail.performedAt}
                value={formatTimestamp(auditLog.performedAtUtc, locale)}
              />
              <DetailRow
                label={auditMessages.detail.metrics.actionType}
                value={actionLabel}
              />
              <DetailRow
                label={auditMessages.detail.metrics.entityType}
                value={entityLabel}
              />
              <DetailRow
                label={auditMessages.detail.metrics.entityId}
                value={auditLog.entityId}
                mono
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {auditMessages.detail.metadataEyebrow}
            </p>

            {metadata ? (
              <>
                <pre className="mt-5 overflow-x-auto rounded-[24px] border border-line bg-surface p-5 text-sm leading-7 text-ink">
                  <code>{metadata}</code>
                </pre>
              </>
            ) : (
              <p className="mt-4 text-sm leading-7 text-muted">
                {auditMessages.detail.noMetadata}
              </p>
            )}
          </section>
        </div>
      </div>
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

function DetailRow({
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
      <p className={`mt-3 text-sm text-ink ${mono ? "break-all font-mono" : ""}`}>
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

function formatMetadata(metadataJson: string | null) {
  if (!metadataJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(metadataJson) as unknown;

    if (typeof parsed === "string") {
      return parsed;
    }

    if (
      typeof parsed === "number" ||
      typeof parsed === "boolean" ||
      parsed === null
    ) {
      return String(parsed);
    }

    return JSON.stringify(parsed, null, 2);
  } catch {
    return metadataJson;
  }
}
