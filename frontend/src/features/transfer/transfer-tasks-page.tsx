"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { TransferTaskForm } from "@/features/transfer/transfer-task-form";
import {
  formatLocalizedDateTime,
  formatLocalizedQuantity,
} from "@/lib/format/locale-format";
import { formatExecutionStatusLabel } from "@/lib/format/workflow-status";
import { interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { AppRole } from "@/types/auth";
import type { InventoryBalance } from "@/types/inventory";
import type {
  TransferTask,
  TransferTaskStatus,
  TransferWorkflowFormState,
} from "@/types/transfer";
import type { Location } from "@/types/warehouse-structure";

type TransferTasksPageProps = {
  currentRoles: readonly string[];
  transferTasks: readonly TransferTask[];
  canCreate: boolean;
  canExecute: boolean;
  sourceBalances: readonly InventoryBalance[];
  destinationLocations: readonly Location[];
  createAction: (
    state: TransferWorkflowFormState,
    formData: FormData,
  ) => Promise<TransferWorkflowFormState>;
  startAction: (formData: FormData) => Promise<void>;
  completeAction: (formData: FormData) => Promise<void>;
  cancelAction: (formData: FormData) => Promise<void>;
  createDataError: string | null;
  actionError: string | null;
};

type TransferStatusFilter = "all" | "open" | TransferTaskStatus;

export function TransferTasksPage({
  currentRoles,
  transferTasks,
  canCreate,
  canExecute,
  sourceBalances,
  destinationLocations,
  createAction,
  startAction,
  completeAction,
  cancelAction,
  createDataError,
  actionError,
}: TransferTasksPageProps) {
  const { locale, messages } = useLocaleContext();
  const transferMessages = messages.transferTasks;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransferStatusFilter>("open");
  const deferredSearch = useDeferredValue(search);

  const filteredTasks = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...transferTasks]
      .filter((task) => {
        const matchesSearch =
          !query ||
          [
            task.productSku,
            task.productName,
            task.status,
            task.sourceWarehouseCode,
            task.sourceZoneCode,
            task.sourceLocationCode,
            task.sourceLocationName,
            task.destinationWarehouseCode,
            task.destinationZoneCode,
            task.destinationLocationCode,
            task.destinationLocationName,
            task.reason,
          ]
            .filter((value): value is string => Boolean(value))
            .some((value) => value.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "open"
              ? task.status === "Pending" || task.status === "InProgress"
              : task.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => {
        const priority = getStatusPriority(left.status) - getStatusPriority(right.status);

        if (priority !== 0) {
          return priority;
        }

        return right.createdAtUtc.localeCompare(left.createdAtUtc);
      });
  }, [deferredSearch, statusFilter, transferTasks]);

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {transferMessages.list.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {transferMessages.list.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentRoles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink"
              >
                {formatRoleLabel(role, messages.roles)}
              </span>
            ))}
          </div>
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {transferMessages.list.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.7fr]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {transferMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={transferMessages.list.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {transferMessages.list.statusLabel}
            </span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as TransferStatusFilter)
              }
              className={inputClassName}
            >
              <option value="open">{transferMessages.list.openTasksFirst}</option>
              <option value="all">{transferMessages.list.allTasks}</option>
              <option value="Pending">
                {formatExecutionStatusLabel("Pending", locale)}
              </option>
              <option value="InProgress">
                {formatExecutionStatusLabel("InProgress", locale)}
              </option>
              <option value="Completed">
                {formatExecutionStatusLabel("Completed", locale)}
              </option>
              <option value="Cancelled">
                {formatExecutionStatusLabel("Cancelled", locale)}
              </option>
            </select>
          </label>

          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {transferMessages.list.resultsLabel}
            </p>
            <p className="mt-3 text-sm font-medium text-ink">
              {interpolateMessage(transferMessages.list.resultsTemplate, {
                filtered: filteredTasks.length,
                total: transferTasks.length,
              })}
            </p>
          </div>
        </div>
      </section>

      <div className={`grid gap-6 ${canCreate ? "xl:grid-cols-[1.1fr_0.9fr]" : ""}`}>
        <section className="space-y-4">
          {filteredTasks.length === 0 ? (
            <EmptyState />
          ) : (
            filteredTasks.map((task) => {
              const canStart = canExecute && task.status === "Pending";
              const canComplete = canExecute && task.status === "InProgress";
              const canCancel =
                canExecute &&
                (task.status === "Pending" || task.status === "InProgress");

              return (
                <article
                  key={task.id}
                  className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                          {task.productSku}
                        </span>
                        <StatusBadge status={task.status} />
                      </div>

                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                        {task.productName}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {interpolateMessage(transferMessages.list.sourceDestination, {
                          source: formatSourceLabel(task),
                          destination: formatDestinationLabel(task),
                        })}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {interpolateMessage(transferMessages.list.quantityLabel, {
                          quantity: formatQuantity(task.quantity, locale),
                        })}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {task.reason || transferMessages.list.noReason}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <Link
                        href={`/transfer-tasks/${task.id}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                      >
                        {transferMessages.list.viewDetails}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Metric
                      label={transferMessages.list.metrics.created}
                      value={formatTimestamp(task.createdAtUtc, locale)}
                    />
                    <Metric
                      label={transferMessages.list.metrics.started}
                      value={
                        task.startedAtUtc
                          ? formatTimestamp(task.startedAtUtc, locale)
                          : transferMessages.list.notStarted
                      }
                    />
                    <Metric
                      label={transferMessages.list.metrics.completed}
                      value={
                        task.completedAtUtc
                          ? formatTimestamp(task.completedAtUtc, locale)
                          : transferMessages.list.notCompleted
                      }
                    />
                    <Metric
                      label={transferMessages.list.metrics.cancelled}
                      value={
                        task.cancelledAtUtc
                          ? formatTimestamp(task.cancelledAtUtc, locale)
                          : transferMessages.list.notCancelled
                      }
                    />
                  </div>

                  {canStart || canComplete || canCancel ? (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {canStart ? (
                        <WorkflowForm
                          action={startAction}
                          transferTaskId={task.id}
                          redirectTo="/transfer-tasks"
                          label={transferMessages.list.start}
                          tone="secondary"
                        />
                      ) : null}

                      {canComplete ? (
                        <WorkflowForm
                          action={completeAction}
                          transferTaskId={task.id}
                          redirectTo="/transfer-tasks"
                          label={transferMessages.list.complete}
                          tone="primary"
                        />
                      ) : null}

                      {canCancel ? (
                        <WorkflowForm
                          action={cancelAction}
                          transferTaskId={task.id}
                          redirectTo="/transfer-tasks"
                          label={transferMessages.list.cancel}
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
            ) : null}

            <TransferTaskForm
              action={createAction}
              sourceBalances={sourceBalances}
              destinationLocations={destinationLocations}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function WorkflowForm({
  action,
  transferTaskId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  transferTaskId: string;
  redirectTo: string;
  label: string;
  tone: "primary" | "secondary" | "muted";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="transferTaskId" value={transferTaskId} />
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

function StatusBadge({ status }: { status: TransferTaskStatus }) {
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

function EmptyState() {
  const { messages } = useLocaleContext();
  const transferMessages = messages.transferTasks;

  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {transferMessages.list.emptyEyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        {transferMessages.list.emptyMessage}
      </p>
    </div>
  );
}

function getStatusPriority(status: TransferTaskStatus) {
  switch (status) {
    case "Pending":
      return 0;
    case "InProgress":
      return 1;
    case "Completed":
      return 2;
    case "Cancelled":
      return 3;
  }
}

function formatSourceLabel(task: TransferTask) {
  return `${task.sourceWarehouseCode} / ${task.sourceZoneCode} / ${task.sourceLocationCode}`;
}

function formatDestinationLabel(task: TransferTask) {
  return `${task.destinationWarehouseCode} / ${task.destinationZoneCode} / ${task.destinationLocationCode}`;
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

function formatRoleLabel(role: string, roleMessages: Messages["roles"]) {
  return roleMessages[role as AppRole] ?? role;
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
