"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelPutawayTask,
  completePutawayTask,
  createPutawayTask,
  startPutawayTask,
} from "@/lib/api/putaway-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import type {
  PutawayTaskPayload,
  PutawayWorkflowFormState,
} from "@/types/putaway";

const initialState: PutawayWorkflowFormState = {
  error: null,
  successMessage: null,
};

export async function createPutawayTaskAction(
  _: PutawayWorkflowFormState,
  formData: FormData,
): Promise<PutawayWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parsePutawayPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createPutawayTask(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.putawayTasks.actions.createFallback,
    };
  }

  revalidatePutawayPages();
  redirect(`/putaway-tasks/${result.data.id}`);
}

export async function startPutawayTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runPutawayWorkflowAction(
    formData,
    startPutawayTask,
    messages.putawayTasks.actions.startFallback,
    messages.putawayTasks.actions.idRequired,
  );
}

export async function completePutawayTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  const { putawayTaskId, redirectTo } = readWorkflowActionInput(formData);

  if (!putawayTaskId) {
    redirect(withActionError(redirectTo, messages.putawayTasks.actions.idRequired));
  }

  const result = await completePutawayTask(putawayTaskId);

  if (!result.ok) {
    redirect(
      withActionError(
        redirectTo,
        result.message ?? messages.putawayTasks.actions.completeFallback,
      ),
    );
  }

  revalidatePutawayPages();
  revalidatePath("/inventory");
  redirect(redirectTo);
}

export async function cancelPutawayTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runPutawayWorkflowAction(
    formData,
    cancelPutawayTask,
    messages.putawayTasks.actions.cancelFallback,
    messages.putawayTasks.actions.idRequired,
  );
}

async function runPutawayWorkflowAction(
  formData: FormData,
  action: (putawayTaskId: string) => ReturnType<typeof startPutawayTask>,
  fallbackMessage: string,
  missingIdMessage: string,
) {
  const { putawayTaskId, redirectTo } = readWorkflowActionInput(formData);

  if (!putawayTaskId) {
    redirect(withActionError(redirectTo, missingIdMessage));
  }

  const result = await action(putawayTaskId);

  if (!result.ok) {
    redirect(withActionError(redirectTo, result.message ?? fallbackMessage));
  }

  revalidatePutawayPages();
  redirect(redirectTo);
}

function revalidatePutawayPages() {
  revalidatePath("/putaway-tasks");
}

function parsePutawayPayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: PutawayTaskPayload }
  | { ok: false; error: string } {
  const productId = String(formData.get("productId") ?? "").trim();
  const sourceLocationId = String(formData.get("sourceLocationId") ?? "").trim();
  const destinationLocationId = String(
    formData.get("destinationLocationId") ?? "",
  ).trim();
  const quantity = Number(String(formData.get("quantity") ?? "").trim());
  const notes = String(formData.get("notes") ?? "").trim();

  if (!productId || !sourceLocationId || !destinationLocationId) {
    return {
      ok: false,
      error: messages.putawayTasks.actions.fieldsRequired,
    };
  }

  if (sourceLocationId === destinationLocationId) {
    return {
      ok: false,
      error: messages.putawayTasks.actions.destinationDifferent,
    };
  }

  if (Number.isNaN(quantity) || quantity <= 0) {
    return {
      ok: false,
      error: messages.putawayTasks.actions.quantityValid,
    };
  }

  return {
    ok: true,
    payload: {
      productId,
      sourceLocationId,
      destinationLocationId,
      receiptLineId: null,
      quantity,
      notes,
    },
  };
}

function readWorkflowActionInput(formData: FormData) {
  return {
    putawayTaskId: String(formData.get("putawayTaskId") ?? "").trim(),
    redirectTo:
      String(formData.get("redirectTo") ?? "").trim() || "/putaway-tasks",
  };
}

function withActionError(path: string, message: string) {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("actionError", message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}
