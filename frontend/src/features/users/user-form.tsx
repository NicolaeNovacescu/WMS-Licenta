"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import { assignableUserRoles, type ManagedUser, type UserWorkflowFormState } from "@/types/user";

const initialState: UserWorkflowFormState = {
  error: null,
  successMessage: null,
};

type UserFormProps = {
  action: (
    state: UserWorkflowFormState,
    formData: FormData,
  ) => Promise<UserWorkflowFormState>;
  submitLabel: string;
  title: string;
  description: string;
  user?: ManagedUser;
};

export function UserForm({
  action,
  submitLabel,
  title,
  user,
}: UserFormProps) {
  const { messages } = useLocaleContext();
  const userMessages = messages.users;
  const [state, formAction] = useActionState(action, initialState);
  const isCreateMode = !user;

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {title}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
          {userMessages.form.scopeEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">
          {userMessages.form.scopeDescription}
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <Field label={userMessages.form.userNameLabel} htmlFor="userName">
          <input
            id="userName"
            name="userName"
            type="text"
            defaultValue={user?.userName ?? ""}
            className={inputClassName}
            placeholder={userMessages.form.userNamePlaceholder}
          />
        </Field>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold tracking-wide text-ink">
            {userMessages.form.assignedRolesLegend}
          </legend>
          <p className="text-sm leading-6 text-muted">
            {userMessages.form.assignedRolesDescription}
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            {assignableUserRoles.map((role) => (
              <label
                key={role}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink"
              >
                <input
                  name="roles"
                  type="checkbox"
                  value={role}
                  defaultChecked={user ? user.roles.includes(role) : false}
                  className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
                />
                {messages.roles[role]}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          label={
            isCreateMode
              ? userMessages.form.initialPasswordLabel
              : userMessages.form.optionalPasswordRotationLabel
          }
          htmlFor="password"
        >
          <input
            id="password"
            name="password"
            type="password"
            required={isCreateMode}
            className={inputClassName}
            placeholder={
              isCreateMode
                ? userMessages.form.initialPasswordPlaceholder
                : userMessages.form.optionalPasswordRotationPlaceholder
            }
          />
        </Field>

        {state.error ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {state.error}
          </div>
        ) : null}

        <SubmitButton label={submitLabel} />
      </form>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold tracking-wide text-ink"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { messages } = useLocaleContext();
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? messages.users.form.pending : label}
    </button>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
