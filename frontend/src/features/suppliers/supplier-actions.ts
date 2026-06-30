"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  activateSupplier,
  createSupplier,
  deactivateSupplier,
  updateSupplier,
} from "@/lib/api/supplier-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import type {
  SupplierPayload,
  SupplierWorkflowFormState,
} from "@/types/supplier";

const initialState: SupplierWorkflowFormState = {
  error: null,
  successMessage: null,
};

export async function createSupplierAction(
  _: SupplierWorkflowFormState,
  formData: FormData,
): Promise<SupplierWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseSupplierPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createSupplier(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.suppliers.actions.createFallback,
    };
  }

  revalidateSupplierPages(result.data.id);
  redirect(`/suppliers/${result.data.id}`);
}

export async function updateSupplierAction(
  supplierId: string,
  _: SupplierWorkflowFormState,
  formData: FormData,
): Promise<SupplierWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseSupplierPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await updateSupplier(supplierId, parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.suppliers.actions.updateFallback,
    };
  }

  revalidateSupplierPages(supplierId);
  redirect(`/suppliers/${supplierId}`);
}

export async function activateSupplierAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runSupplierStateAction(
    formData,
    activateSupplier,
    messages.suppliers.actions.activateFallback,
    messages.suppliers.actions.idRequired,
  );
}

export async function deactivateSupplierAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runSupplierStateAction(
    formData,
    deactivateSupplier,
    messages.suppliers.actions.deactivateFallback,
    messages.suppliers.actions.idRequired,
  );
}

async function runSupplierStateAction(
  formData: FormData,
  action: (supplierId: string) => ReturnType<typeof activateSupplier>,
  fallbackMessage: string,
  missingIdMessage: string,
) {
  const { supplierId, redirectTo } = readWorkflowActionInput(formData);

  if (!supplierId) {
    redirect(withActionError(redirectTo, missingIdMessage));
  }

  const result = await action(supplierId);

  if (!result.ok) {
    redirect(withActionError(redirectTo, result.message ?? fallbackMessage));
  }

  revalidateSupplierPages(result.data.id);
  redirect(redirectTo);
}

function parseSupplierPayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: SupplierPayload }
  | { ok: false; error: string } {
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!code || !name) {
    return {
      ok: false,
      error: messages.suppliers.actions.codeNameRequired,
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
    supplierId: String(formData.get("supplierId") ?? "").trim(),
    redirectTo: String(formData.get("redirectTo") ?? "").trim() || "/suppliers",
  };
}

function revalidateSupplierPages(supplierId: string) {
  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${supplierId}`);
  revalidatePath("/inbound-orders");
}

function withActionError(path: string, message: string) {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("actionError", message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}
