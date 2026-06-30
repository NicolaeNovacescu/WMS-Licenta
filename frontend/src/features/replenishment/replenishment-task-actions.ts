"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelReplenishmentTask,
  completeReplenishmentTask,
  createReplenishmentTask,
  startReplenishmentTask,
} from "@/lib/api/replenishment-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import type {
  ReplenishmentTaskFormState,
  ReplenishmentTaskPayload,
} from "@/types/replenishment";

const initialState: ReplenishmentTaskFormState = {
  error: null,
  successMessage: null,
};

export async function createReplenishmentTaskAction(
  _: ReplenishmentTaskFormState,
  formData: FormData,
): Promise<ReplenishmentTaskFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseReplenishmentTaskPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createReplenishmentTask(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.replenishmentTasks.actions.createFallback,
    };
  }

  revalidateReplenishmentTaskPages();
  redirect(`/replenishment-tasks/${result.data.id}`);
}

export async function startReplenishmentTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runReplenishmentWorkflowAction(
    formData,
    startReplenishmentTask,
    messages.replenishmentTasks.actions.startFallback,
    messages.replenishmentTasks.actions.idRequired,
  );
}

export async function completeReplenishmentTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  const { replenishmentTaskId, redirectTo } = readWorkflowActionInput(formData);

  if (!replenishmentTaskId) {
    redirect(withActionError(redirectTo, messages.replenishmentTasks.actions.idRequired));
  }

  const result = await completeReplenishmentTask(replenishmentTaskId);

  if (!result.ok) {
    redirect(
      withActionError(
        redirectTo,
        result.message ??
          messages.replenishmentTasks.actions.completeFallback,
      ),
    );
  }

  revalidateReplenishmentTaskPages();
  revalidatePath("/inventory");
  redirect(redirectTo);
}

export async function cancelReplenishmentTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runReplenishmentWorkflowAction(
    formData,
    cancelReplenishmentTask,
    messages.replenishmentTasks.actions.cancelFallback,
    messages.replenishmentTasks.actions.idRequired,
  );
}

async function runReplenishmentWorkflowAction(
  formData: FormData,
  action: (replenishmentTaskId: string) => ReturnType<typeof startReplenishmentTask>,
  fallbackMessage: string,
  missingIdMessage: string,
) {
  const { replenishmentTaskId, redirectTo } = readWorkflowActionInput(formData);

  if (!replenishmentTaskId) {
    redirect(withActionError(redirectTo, missingIdMessage));
  }

  const result = await action(replenishmentTaskId);

  if (!result.ok) {
    redirect(withActionError(redirectTo, result.message ?? fallbackMessage));
  }

  revalidateReplenishmentTaskPages();
  redirect(redirectTo);
}

function parseReplenishmentTaskPayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: ReplenishmentTaskPayload }
  | { ok: false; error: string } {
  const productId = String(formData.get("productId") ?? "").trim();
  const sourceLocationId = String(formData.get("sourceLocationId") ?? "").trim();
  const targetLocationId = String(formData.get("targetLocationId") ?? "").trim();
  const quantity = Number(String(formData.get("quantity") ?? "").trim());

  if (!productId || !sourceLocationId || !targetLocationId) {
    return {
      ok: false,
      error: messages.replenishmentTasks.actions.fieldsRequired,
    };
  }

  if (sourceLocationId === targetLocationId) {
    return {
      ok: false,
      error: messages.replenishmentTasks.actions.targetDifferent,
    };
  }

  if (Number.isNaN(quantity) || quantity <= 0) {
    return {
      ok: false,
      error: messages.replenishmentTasks.actions.quantityValid,
    };
  }

  return {
    ok: true,
    payload: {
      productId,
      sourceLocationId,
      targetLocationId,
      quantity,
    },
  };
}

function readWorkflowActionInput(formData: FormData) {
  return {
    replenishmentTaskId: String(formData.get("replenishmentTaskId") ?? "").trim(),
    redirectTo:
      String(formData.get("redirectTo") ?? "").trim() ||
      "/replenishment-tasks",
  };
}

function revalidateReplenishmentTaskPages() {
  revalidatePath("/replenishment-tasks");
}

function withActionError(path: string, message: string) {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("actionError", message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}
