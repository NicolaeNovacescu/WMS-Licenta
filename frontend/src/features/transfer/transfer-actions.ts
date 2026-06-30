"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelTransferTask,
  completeTransferTask,
  createTransferTask,
  startTransferTask,
} from "@/lib/api/transfer-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import type {
  TransferTaskPayload,
  TransferWorkflowFormState,
} from "@/types/transfer";

const initialState: TransferWorkflowFormState = {
  error: null,
  successMessage: null,
};

export async function createTransferTaskAction(
  _: TransferWorkflowFormState,
  formData: FormData,
): Promise<TransferWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseTransferPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createTransferTask(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.transferTasks.actions.createFallback,
    };
  }

  revalidateTransferPages();
  redirect(`/transfer-tasks/${result.data.id}`);
}

export async function startTransferTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runTransferWorkflowAction(
    formData,
    startTransferTask,
    messages.transferTasks.actions.startFallback,
    messages.transferTasks.actions.idRequired,
  );
}

export async function completeTransferTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  const { transferTaskId, redirectTo } = readWorkflowActionInput(formData);

  if (!transferTaskId) {
    redirect(withActionError(redirectTo, messages.transferTasks.actions.idRequired));
  }

  const result = await completeTransferTask(transferTaskId);

  if (!result.ok) {
    redirect(
      withActionError(
        redirectTo,
        result.message ??
          messages.transferTasks.actions.completeFallback,
      ),
    );
  }

  revalidateTransferPages();
  revalidatePath("/inventory");
  redirect(redirectTo);
}

export async function cancelTransferTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runTransferWorkflowAction(
    formData,
    cancelTransferTask,
    messages.transferTasks.actions.cancelFallback,
    messages.transferTasks.actions.idRequired,
  );
}

async function runTransferWorkflowAction(
  formData: FormData,
  action: (transferTaskId: string) => ReturnType<typeof startTransferTask>,
  fallbackMessage: string,
  missingIdMessage: string,
) {
  const { transferTaskId, redirectTo } = readWorkflowActionInput(formData);

  if (!transferTaskId) {
    redirect(withActionError(redirectTo, missingIdMessage));
  }

  const result = await action(transferTaskId);

  if (!result.ok) {
    redirect(withActionError(redirectTo, result.message ?? fallbackMessage));
  }

  revalidateTransferPages();
  redirect(redirectTo);
}

function revalidateTransferPages() {
  revalidatePath("/transfer-tasks");
}

function parseTransferPayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: TransferTaskPayload }
  | { ok: false; error: string } {
  const productId = String(formData.get("productId") ?? "").trim();
  const sourceLocationId = String(formData.get("sourceLocationId") ?? "").trim();
  const destinationLocationId = String(
    formData.get("destinationLocationId") ?? "",
  ).trim();
  const quantity = Number(String(formData.get("quantity") ?? "").trim());
  const reason = String(formData.get("reason") ?? "").trim();

  if (!productId || !sourceLocationId || !destinationLocationId) {
    return {
      ok: false,
      error: messages.transferTasks.actions.fieldsRequired,
    };
  }

  if (sourceLocationId === destinationLocationId) {
    return {
      ok: false,
      error: messages.transferTasks.actions.destinationDifferent,
    };
  }

  if (Number.isNaN(quantity) || quantity <= 0) {
    return {
      ok: false,
      error: messages.transferTasks.actions.quantityValid,
    };
  }

  return {
    ok: true,
    payload: {
      productId,
      sourceLocationId,
      destinationLocationId,
      quantity,
      reason,
    },
  };
}

function readWorkflowActionInput(formData: FormData) {
  return {
    transferTaskId: String(formData.get("transferTaskId") ?? "").trim(),
    redirectTo:
      String(formData.get("redirectTo") ?? "").trim() || "/transfer-tasks",
  };
}

function withActionError(path: string, message: string) {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("actionError", message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}
