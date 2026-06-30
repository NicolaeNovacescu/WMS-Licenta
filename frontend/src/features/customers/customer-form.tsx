"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { useLocaleContext } from "@/features/i18n/locale-provider";
import type {
  CustomerWorkflowFormState,
  ManagedCustomer,
} from "@/types/customer";

const initialState: CustomerWorkflowFormState = {
  error: null,
  successMessage: null,
};

type CustomerFormProps = {
  action: (
    state: CustomerWorkflowFormState,
    formData: FormData,
  ) => Promise<CustomerWorkflowFormState>;
  submitLabel: string;
  title: string;
  description: string;
  customer?: ManagedCustomer;
};

export function CustomerForm({
  action,
  submitLabel,
  title,
  customer,
}: CustomerFormProps) {
  const { messages } = useLocaleContext();
  const customerMessages = messages.customers;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <section className="rounded-[28px] border border-line bg-white/84 p-6 shadow-[0_18px_70px_rgba(29,41,56,0.08)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {title}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
          {customerMessages.form.scopeEyebrow}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink">
          {customerMessages.form.scopeDescription}
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <Field label={customerMessages.form.codeLabel} htmlFor="code">
          <input
            id="code"
            name="code"
            type="text"
            defaultValue={customer?.code ?? ""}
            className={inputClassName}
            placeholder="CUST-ALPHA"
          />
        </Field>

        <Field label={customerMessages.form.nameLabel} htmlFor="name">
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={customer?.name ?? ""}
            className={inputClassName}
            placeholder="Demo Customer Alpha"
          />
        </Field>

        {state.error ? (
          <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
            {state.error}
          </div>
        ) : null}

        <SubmitButton
          label={submitLabel}
          pendingLabel={customerMessages.form.pending}
        />
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

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";
