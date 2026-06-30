"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction } from "@/features/auth/actions";
import { useLocaleContext } from "@/features/i18n/locale-provider";
import type { LoginFormState } from "@/types/auth";

const initialState: LoginFormState = {
  error: null,
};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const { messages } = useLocaleContext();

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="userName"
          className="text-sm font-semibold tracking-wide text-ink"
        >
          {messages.auth.userNameLabel}
        </label>
        <input
          id="userName"
          name="userName"
          type="text"
          autoComplete="username"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
          placeholder={messages.auth.userNamePlaceholder}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-semibold tracking-wide text-ink"
        >
          {messages.auth.passwordLabel}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
          placeholder={messages.auth.passwordPlaceholder}
        />
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-amber-300 bg-warning-soft px-4 py-3 text-sm text-ink">
          {state.error}
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const { messages } = useLocaleContext();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? messages.auth.submitPending : messages.auth.submitIdle}
    </button>
  );
}
