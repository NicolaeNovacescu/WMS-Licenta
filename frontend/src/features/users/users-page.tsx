"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { formatLocalizedDateTime } from "@/lib/format/locale-format";
import { UserForm } from "@/features/users/user-form";
import type { ManagedUser, UserWorkflowFormState } from "@/types/user";

type UsersPageProps = {
  currentRoles: readonly string[];
  users: readonly ManagedUser[];
  actionError: string | null;
  createAction: (
    state: UserWorkflowFormState,
    formData: FormData,
  ) => Promise<UserWorkflowFormState>;
  activateAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
};

export function UsersPage({
  currentRoles,
  users,
  actionError,
  createAction,
  activateAction,
  deactivateAction,
}: UsersPageProps) {
  const { locale, messages } = useLocaleContext();
  const userMessages = messages.users;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filteredUsers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...users]
      .filter((user) => {
        if (!query) {
          return true;
        }

        return [
          user.id,
          user.userName,
          user.isActive ? "active" : "inactive",
          user.roles.join(" "),
          formatTimestamp(user.createdAtUtc, locale),
        ].some((value) => value.toLowerCase().includes(query));
      })
      .sort((left, right) => left.userName.localeCompare(right.userName));
  }, [deferredSearch, locale, users]);

  const activeUsers = users.filter((user) => user.isActive).length;

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[32px] border border-line bg-white/82 p-8 shadow-[0_20px_70px_rgba(29,41,56,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {userMessages.list.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {userMessages.list.title}
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
            {userMessages.list.actionBlockedEyebrow}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{actionError}</p>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-line bg-white/82 p-5 shadow-[0_18px_70px_rgba(29,41,56,0.06)] backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_repeat(3,minmax(0,0.35fr))]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {userMessages.list.searchLabel}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={userMessages.list.searchPlaceholder}
              className={inputClassName}
            />
          </label>

          <Metric label={userMessages.list.visibleUsers} value={String(filteredUsers.length)} />
          <Metric label={userMessages.list.activeUsers} value={String(activeUsers)} />
          <Metric
            label={userMessages.list.inactiveUsers}
            value={String(users.length - activeUsers)}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-4">
          {filteredUsers.length === 0 ? (
            <EmptyState />
          ) : (
            filteredUsers.map((user) => (
              <article
                key={user.id}
                className="rounded-[28px] border border-line bg-white/82 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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

                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                      {user.userName}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {userMessages.list.createdTemplate.replace(
                        "{timestamp}",
                        formatTimestamp(user.createdAtUtc, locale),
                      )}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {userMessages.list.accessStateDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/users/${user.id}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
                    >
                      {userMessages.list.viewDetail}
                    </Link>

                    {user.isActive ? (
                      <WorkflowForm
                        action={deactivateAction}
                        userId={user.id}
                        redirectTo="/users"
                        label={userMessages.list.deactivateButton}
                        tone="muted"
                      />
                    ) : (
                      <WorkflowForm
                        action={activateAction}
                        userId={user.id}
                        redirectTo="/users"
                        label={userMessages.list.activateButton}
                        tone="secondary"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Metric label={userMessages.list.userName} value={user.userName} />
                  <Metric
                    label={userMessages.list.state}
                    value={
                      user.isActive
                        ? messages.common.states.active
                        : messages.common.states.inactive
                    }
                  />
                  <Metric
                    label={userMessages.list.roles}
                    value={user.roles.map((role) => formatRoleLabel(role, messages.roles)).join(", ")}
                  />
                  <Metric
                    label={userMessages.list.created}
                    value={formatTimestamp(user.createdAtUtc, locale)}
                  />
                </div>
              </article>
            ))
          )}
        </section>

        <UserForm
          action={createAction}
          submitLabel={userMessages.list.createSubmit}
          title={userMessages.list.createTitle}
          description={userMessages.list.createDescription}
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

function EmptyState() {
  const { messages } = useLocaleContext();

  return (
    <div className="rounded-[28px] border border-dashed border-line bg-white/80 px-6 py-10 text-center shadow-[0_18px_70px_rgba(29,41,56,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {messages.users.list.emptyEyebrow}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        {messages.users.list.emptyMessage}
      </p>
    </div>
  );
}

function formatTimestamp(value: string, locale: "en" | "ro") {
  return formatLocalizedDateTime(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
