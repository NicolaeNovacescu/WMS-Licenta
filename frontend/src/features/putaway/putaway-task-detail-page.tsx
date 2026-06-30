"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import { formatExecutionStatusLabel } from "@/lib/format/workflow-status";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { PutawayTask, PutawayTaskStatus } from "@/types/putaway";

type PutawayTaskDetailPageProps = {
  putawayTask: PutawayTask;
  canExecute: boolean;
  actionError: string | null;
  startAction: (formData: FormData) => Promise<void>;
  completeAction: (formData: FormData) => Promise<void>;
  cancelAction: (formData: FormData) => Promise<void>;
};

export function PutawayTaskDetailPage({
  putawayTask,
  canExecute,
  actionError,
  startAction,
  completeAction,
  cancelAction,
}: PutawayTaskDetailPageProps) {
  const { locale, messages } = useLocaleContext();
  const putawayMessages = messages.putawayTasks;
  const canStart = canExecute && putawayTask.status === "Pending";
  const canComplete = canExecute && putawayTask.status === "InProgress";
  const canCancel =
    canExecute &&
    (putawayTask.status === "Pending" || putawayTask.status === "InProgress");

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {putawayTask.productSku}
              </span>
              <StatusBadge status={putawayTask.status} />
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {interpolateMessage(putawayMessages.detail.title, {
                productName: putawayTask.productName,
              })}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              {putawayMessages.detail.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/putaway-tasks"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {putawayMessages.detail.backToList}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            label={putawayMessages.detail.metrics.quantity}
            value={formatQuantity(putawayTask.quantity, locale)}
          />
          <Metric
            label={putawayMessages.detail.metrics.created}
            value={formatTimestamp(putawayTask.createdAtUtc, locale)}
          />
          <Metric
            label={putawayMessages.detail.metrics.started}
            value={
              putawayTask.startedAtUtc
                ? formatTimestamp(putawayTask.startedAtUtc, locale)
                : putawayMessages.detail.notStarted
            }
          />
          <Metric
            label={putawayMessages.detail.metrics.completed}
            value={
              putawayTask.completedAtUtc
                ? formatTimestamp(putawayTask.completedAtUtc, locale)
                : putawayMessages.detail.notCompleted
            }
          />
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {putawayMessages.detail.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {putawayMessages.detail.workflowActionsEyebrow}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {putawayMessages.detail.workflowActionsDescription}
            </p>

            {canStart || canComplete || canCancel ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {canStart ? (
                  <WorkflowForm
                    action={startAction}
                    putawayTaskId={putawayTask.id}
                    redirectTo={`/putaway-tasks/${putawayTask.id}`}
                    label={putawayMessages.detail.start}
                    tone="secondary"
                  />
                ) : null}

                {canComplete ? (
                  <WorkflowForm
                    action={completeAction}
                    putawayTaskId={putawayTask.id}
                    redirectTo={`/putaway-tasks/${putawayTask.id}`}
                    label={putawayMessages.detail.complete}
                    tone="primary"
                  />
                ) : null}

                {canCancel ? (
                  <WorkflowForm
                    action={cancelAction}
                    putawayTaskId={putawayTask.id}
                    redirectTo={`/putaway-tasks/${putawayTask.id}`}
                    label={putawayMessages.detail.cancel}
                    tone="muted"
                  />
                ) : null}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-muted">
                {putawayMessages.detail.noFurtherAction}
              </p>
            )}
          </section>

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {putawayMessages.detail.traceabilityEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow
                label={putawayMessages.detail.putawayTaskId}
                value={putawayTask.id}
                mono
              />
              <DetailRow
                label={putawayMessages.detail.receiptId}
                value={putawayTask.receiptId ?? putawayMessages.detail.noLinkedReceipt}
                mono={Boolean(putawayTask.receiptId)}
              />
              <DetailRow
                label={putawayMessages.detail.receiptLineId}
                value={
                  putawayTask.receiptLineId ??
                  putawayMessages.detail.noLinkedReceiptLine
                }
                mono={Boolean(putawayTask.receiptLineId)}
              />
              <DetailRow
                label={putawayMessages.detail.cancelled}
                value={
                  putawayTask.cancelledAtUtc
                    ? formatTimestamp(putawayTask.cancelledAtUtc, locale)
                    : putawayMessages.detail.notCancelled
                }
              />
            </div>
          </section>

          {putawayTask.notes ? (
            <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {putawayMessages.detail.notesEyebrow}
              </p>
              <p className="mt-4 text-sm leading-7 text-ink">{putawayTask.notes}</p>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          <LocationCard
            eyebrow={putawayMessages.detail.sourceLocationEyebrow}
            title={`${putawayTask.sourceLocationCode} - ${putawayTask.sourceLocationName}`}
            path={`${putawayTask.sourceWarehouseCode} / ${putawayTask.sourceZoneCode}`}
            type={putawayTask.sourceLocationType}
            isActive={putawayTask.sourceLocationIsActive}
            isBlocked={putawayTask.sourceLocationIsBlocked}
            description={putawayMessages.detail.sourceLocationDescription}
          />

          <LocationCard
            eyebrow={putawayMessages.detail.destinationLocationEyebrow}
            title={`${putawayTask.destinationLocationCode} - ${putawayTask.destinationLocationName}`}
            path={`${putawayTask.destinationWarehouseCode} / ${putawayTask.destinationZoneCode}`}
            type={putawayTask.destinationLocationType}
            isActive={putawayTask.destinationLocationIsActive}
            isBlocked={putawayTask.destinationLocationIsBlocked}
            description={putawayMessages.detail.destinationLocationDescription}
          />
        </div>
      </div>
    </section>
  );
}

function WorkflowForm({
  action,
  putawayTaskId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  putawayTaskId: string;
  redirectTo: string;
  label: string;
  tone: "primary" | "secondary" | "muted";
}) {
  const { messages } = useLocaleContext();
  return (
    <form action={action}>
      <input type="hidden" name="putawayTaskId" value={putawayTaskId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <WorkflowButton
        label={label}
        pendingLabel={messages.common.working}
        tone={tone}
      />
    </form>
  );
}

function WorkflowButton({
  label,
  pendingLabel,
  tone,
}: {
  label: string;
  pendingLabel: string;
  tone: "primary" | "secondary" | "muted";
}) {
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
      {pending ? pendingLabel : label}
    </button>
  );
}

function LocationCard({
  eyebrow,
  title,
  path,
  type,
  isActive,
  isBlocked,
  description,
}: {
  eyebrow: string;
  title: string;
  path: string;
  type: string;
  isActive: boolean;
  isBlocked: boolean;
  description: string;
}) {
  const { messages } = useLocaleContext();
  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{path}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink">
          {formatLocationTypeLabel(type, messages.warehouseSetup.forms.locationTypes)}
        </span>
        <StateBadge
          label={isActive ? messages.common.states.active : messages.common.states.inactive}
          tone={isActive ? "ok" : "muted"}
        />
        <StateBadge
          label={
            isBlocked
              ? messages.common.states.blocked
              : messages.common.states.unblocked
          }
          tone={isBlocked ? "danger" : "ok"}
        />
      </div>
    </section>
  );
}

function StateBadge({
  label,
  tone,
}: {
  label: string;
  tone: "ok" | "muted" | "danger";
}) {
  const toneClass =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "danger"
        ? "bg-rose-50 text-rose-700"
        : "bg-stone-100 text-stone-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
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
      <p className={`mt-3 text-sm text-ink ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: PutawayTaskStatus }) {
  const { locale } = useLocaleContext();
  const toneClass =
    status === "Pending"
      ? "bg-stone-100 text-stone-700"
      : status === "InProgress"
        ? "bg-sky-50 text-sky-700"
        : status === "Completed"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {formatExecutionStatusLabel(status, locale)}
    </span>
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

function formatLocationTypeLabel(
  locationType: string,
  labels: Messages["warehouseSetup"]["forms"]["locationTypes"],
) {
  return labels[locationType as keyof typeof labels] ?? locationType;
}
