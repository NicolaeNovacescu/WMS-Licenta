"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { formatLocalizedDateTime } from "@/lib/format/locale-format";
import { UserForm } from "@/features/users/user-form";
import type { ManagedUser, UserWorkflowFormState } from "@/types/user";

type UserDetailPageProps = {
  user: ManagedUser;
  actionError: string | null;
  updateAction: (
    state: UserWorkflowFormState,
    formData: FormData,
  ) => Promise<UserWorkflowFormState>;
  activateAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
};

export function UserDetailPage({
  user,
  actionError,
  updateAction,
  activateAction,
  deactivateAction,
}: UserDetailPageProps) {
  const { locale, messages } = useLocaleContext();
  const userMessages = messages.users;

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-line bg-white/84 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge isActive={user.isActive} />
              {user.roles.map((role) => (
                <RoleBadge
                  key={`${user.id}-${role}`}
                  label={formatRoleLabel(role, messages.roles)}
                />
              ))}
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {user.userName}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/users"
              className="inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {userMessages.detail.backToUsers}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label={userMessages.detail.userName} value={user.userName} />
          <Metric
            label={userMessages.detail.state}
            value={
              user.isActive
                ? messages.common.states.active
                : messages.common.states.inactive
            }
          />
          <Metric
            label={userMessages.detail.assignedRoles}
            value={user.roles
              .map((role) => formatRoleLabel(role, messages.roles))
              .join(", ")}
          />
          <Metric
            label={userMessages.detail.created}
            value={formatTimestamp(user.createdAtUtc, locale)}
          />
        </div>
      </header>

      {actionError ? (
        <section className="rounded-[28px] border border-amber-300 bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {userMessages.detail.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {userMessages.detail.referenceEyebrow}
            </p>
            <div className="mt-5 grid gap-3">
              <DetailRow label={userMessages.detail.userId} value={user.id} mono />
              <DetailRow label={userMessages.detail.userName} value={user.userName} />
              <DetailRow
                label={userMessages.detail.operationalAccessState}
                value={
                  user.isActive
                    ? messages.common.states.active
                    : messages.common.states.inactive
                }
              />
              <DetailRow
                label={userMessages.detail.createdAt}
                value={formatTimestamp(user.createdAtUtc, locale)}
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {userMessages.detail.accessStateEyebrow}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {userMessages.detail.accessStateDescription}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {user.isActive ? (
                <WorkflowForm
                  action={deactivateAction}
                  userId={user.id}
                  redirectTo={`/users/${user.id}`}
                  label={userMessages.detail.deactivateButton}
                  tone="muted"
                />
              ) : (
                <WorkflowForm
                  action={activateAction}
                  userId={user.id}
                  redirectTo={`/users/${user.id}`}
                  label={userMessages.detail.activateButton}
                  tone="secondary"
                />
              )}
            </div>
          </section>
        </div>

        <UserForm
          action={updateAction}
          submitLabel={userMessages.detail.saveChangesSubmit}
          title={userMessages.detail.editTitle}
          description={userMessages.detail.editDescription}
          user={user}
        />
      </div>
    </section>
  );
}

function WorkflowForm({
  action,
  userId,
  redirectTo,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  userId: string;
  redirectTo: string;
  label: string;
  tone: "secondary" | "muted";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
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
  tone: "secondary" | "muted";
}) {
  const { messages } = useLocaleContext();
  const { pending } = useFormStatus();
  const toneClass =
    tone === "secondary"
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

function StatusBadge({ isActive }: { isActive: boolean }) {
  const { messages } = useLocaleContext();

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-stone-100 text-stone-700"
      }`}
    >
      {isActive ? messages.common.states.active : messages.common.states.inactive}
    </span>
  );
}

function RoleBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
      {label}
    </span>
  );
}

function formatRoleLabel<T extends Record<string, string>>(
  role: string,
  labels: T,
) {
  return labels[role as keyof T] ?? role;
}

function formatTimestamp(value: string, locale: "en" | "ro") {
  return formatLocalizedDateTime(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
