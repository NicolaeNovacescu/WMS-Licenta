"use client";

import { useFormStatus } from "react-dom";

import { logoutAction } from "@/features/auth/actions";
import { useLocaleContext } from "@/features/i18n/locale-provider";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
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
      className="inline-flex w-full items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? messages.shell.logout.pending : messages.shell.logout.idle}
    </button>
  );
}
