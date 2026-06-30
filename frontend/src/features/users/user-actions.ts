"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  activateUser,
  createUser,
  deactivateUser,
  updateUser,
} from "@/lib/api/user-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, interpolateMessage } from "@/lib/i18n/messages";
import type { AppRole } from "@/types/auth";
import {
  assignableUserRoles,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UserWorkflowFormState,
} from "@/types/user";

const initialState: UserWorkflowFormState = {
  error: null,
  successMessage: null,
};

const supportedRoleSet = new Set<string>(assignableUserRoles);

export async function createUserAction(
  _: UserWorkflowFormState,
  formData: FormData,
): Promise<UserWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseCreatePayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createUser(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.users.actions.createFallback,
    };
  }

  revalidateUserPages(result.data.id);
  redirect(`/users/${result.data.id}`);
}

export async function updateUserAction(
  userId: string,
  _: UserWorkflowFormState,
  formData: FormData,
): Promise<UserWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseUpdatePayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await updateUser(userId, parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.users.actions.updateFallback,
    };
  }

  revalidateUserPages(userId);
  redirect(`/users/${userId}`);
}

export async function activateUserAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runUserStateAction(
    formData,
    activateUser,
    messages,
    messages.users.actions.activateFallback,
  );
}

export async function deactivateUserAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runUserStateAction(
    formData,
    deactivateUser,
    messages,
    messages.users.actions.deactivateFallback,
  );
}

async function runUserStateAction(
  formData: FormData,
  action: (userId: string) => ReturnType<typeof activateUser>,
  messages: ReturnType<typeof getMessages>,
  fallbackMessage: string,
) {
  const { userId, redirectTo } = readWorkflowActionInput(formData);

  if (!userId) {
    redirect(withActionError(redirectTo, messages.users.actions.userIdRequired));
  }

  const result = await action(userId);

  if (!result.ok) {
    redirect(withActionError(redirectTo, result.message ?? fallbackMessage));
  }

  revalidateUserPages(result.data.id);
  redirect(redirectTo);
}

function parseCreatePayload(
  formData: FormData,
  messages: ReturnType<typeof getMessages>,
):
  | { ok: true; payload: CreateUserPayload }
  | { ok: false; error: string } {
  const userName = readUserName(formData);
  const password = String(formData.get("password") ?? "").trim();
  const roles = readRoles(formData, messages);

  if (!userName) {
    return {
      ok: false,
      error: messages.users.actions.userNameRequired,
    };
  }

  if (!password) {
    return {
      ok: false,
      error: messages.users.actions.initialPasswordRequired,
    };
  }

  if (!roles.ok) {
    return roles;
  }

  return {
    ok: true,
    payload: {
      userName,
      password,
      roles: roles.roles,
    },
  };
}

function parseUpdatePayload(
  formData: FormData,
  messages: ReturnType<typeof getMessages>,
):
  | { ok: true; payload: UpdateUserPayload }
  | { ok: false; error: string } {
  const userName = readUserName(formData);
  const password = String(formData.get("password") ?? "").trim();
  const roles = readRoles(formData, messages);

  if (!userName) {
    return {
      ok: false,
      error: messages.users.actions.userNameRequired,
    };
  }

  if (!roles.ok) {
    return roles;
  }

  return {
    ok: true,
    payload: {
      userName,
      ...(password ? { password } : {}),
      roles: roles.roles,
    },
  };
}

function readUserName(formData: FormData) {
  return String(formData.get("userName") ?? "").trim();
}

function readRoles(
  formData: FormData,
  messages: ReturnType<typeof getMessages>,
): { ok: true; roles: AppRole[] } | { ok: false; error: string } {
  const roles = Array.from(
    new Set(
      formData
        .getAll("roles")
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );

  if (roles.length === 0) {
    return {
      ok: false,
      error: messages.users.actions.atLeastOneRole,
    };
  }

  const invalidRole = roles.find((role) => !supportedRoleSet.has(role));

  if (invalidRole) {
    return {
      ok: false,
      error: interpolateMessage(messages.users.actions.unsupportedRoleTemplate, {
        role: invalidRole,
      }),
    };
  }

  return {
    ok: true,
    roles: roles as AppRole[],
  };
}

function readWorkflowActionInput(formData: FormData) {
  return {
    userId: String(formData.get("userId") ?? "").trim(),
    redirectTo: String(formData.get("redirectTo") ?? "").trim() || "/users",
  };
}

function revalidateUserPages(userId: string) {
  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
}

function withActionError(path: string, message: string) {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("actionError", message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}
