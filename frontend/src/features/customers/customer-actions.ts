"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  activateCustomer,
  createCustomer,
  deactivateCustomer,
  updateCustomer,
} from "@/lib/api/customer-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import type {
  CustomerPayload,
  CustomerWorkflowFormState,
} from "@/types/customer";

const initialState: CustomerWorkflowFormState = {
  error: null,
  successMessage: null,
};

export async function createCustomerAction(
  _: CustomerWorkflowFormState,
  formData: FormData,
): Promise<CustomerWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseCustomerPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createCustomer(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.customers.actions.createFallback,
    };
  }

  revalidateCustomerPages(result.data.id);
  redirect(`/customers/${result.data.id}`);
}

export async function updateCustomerAction(
  customerId: string,
  _: CustomerWorkflowFormState,
  formData: FormData,
): Promise<CustomerWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseCustomerPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await updateCustomer(customerId, parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.customers.actions.updateFallback,
    };
  }

  revalidateCustomerPages(customerId);
  redirect(`/customers/${customerId}`);
}

export async function activateCustomerAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runCustomerStateAction(
    formData,
    activateCustomer,
    messages.customers.actions.activateFallback,
    messages.customers.actions.idRequired,
  );
}

export async function deactivateCustomerAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runCustomerStateAction(
    formData,
    deactivateCustomer,
    messages.customers.actions.deactivateFallback,
    messages.customers.actions.idRequired,
  );
}

async function runCustomerStateAction(
  formData: FormData,
  action: (customerId: string) => ReturnType<typeof activateCustomer>,
  fallbackMessage: string,
  missingIdMessage: string,
) {
  const { customerId, redirectTo } = readWorkflowActionInput(formData);

  if (!customerId) {
    redirect(withActionError(redirectTo, missingIdMessage));
  }

  const result = await action(customerId);

  if (!result.ok) {
    redirect(withActionError(redirectTo, result.message ?? fallbackMessage));
  }

  revalidateCustomerPages(result.data.id);
  redirect(redirectTo);
}

function parseCustomerPayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: CustomerPayload }
  | { ok: false; error: string } {
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!code || !name) {
    return {
      ok: false,
      error: messages.customers.actions.codeNameRequired,
    };
  }

  return {
    ok: true,
    payload: {
      code,
      name,
    },
  };
}

function readWorkflowActionInput(formData: FormData) {
  return {
    customerId: String(formData.get("customerId") ?? "").trim(),
    redirectTo: String(formData.get("redirectTo") ?? "").trim() || "/customers",
  };
}

function revalidateCustomerPages(customerId: string) {
  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/sales-orders");
}

function withActionError(path: string, message: string) {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("actionError", message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}
