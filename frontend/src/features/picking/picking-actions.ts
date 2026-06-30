"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelPickingTask,
  completePickingTask,
  createPickingTask,
  startPickingTask,
} from "@/lib/api/picking-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import {
  getMessages,
  interpolateMessage,
  type Messages,
} from "@/lib/i18n/messages";
import type { PickingTaskPayload, PickingWorkflowFormState } from "@/types/picking";

const initialState: PickingWorkflowFormState = {
  error: null,
  successMessage: null,
};

export async function createPickingTaskAction(
  _: PickingWorkflowFormState,
  formData: FormData,
): Promise<PickingWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parsePickingTaskPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createPickingTask(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.pickingTasks.actions.createFallback,
    };
  }

  revalidatePickingPages(result.data.id, result.data.salesOrderId);
  redirect(`/picking-tasks/${result.data.id}`);
}

export async function startPickingTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runPickingWorkflowAction(
    formData,
    startPickingTask,
    messages.pickingTasks.actions.startFallback,
    messages.pickingTasks.actions.idRequired,
  );
}

export async function completePickingTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  const { pickingTaskId, redirectTo } = readWorkflowActionInput(formData);

  if (!pickingTaskId) {
    redirect(withActionError(redirectTo, messages.pickingTasks.actions.idRequired));
  }

  const result = await completePickingTask(pickingTaskId);

  if (!result.ok) {
    redirect(
      withActionError(
        redirectTo,
        result.message ?? messages.pickingTasks.actions.completeFallback,
      ),
    );
  }

  revalidatePickingPages(result.data.id, result.data.salesOrderId);
  revalidatePath("/inventory");
  redirect(redirectTo);
}

export async function cancelPickingTaskAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runPickingWorkflowAction(
    formData,
    cancelPickingTask,
    messages.pickingTasks.actions.cancelFallback,
    messages.pickingTasks.actions.idRequired,
  );
}

async function runPickingWorkflowAction(
  formData: FormData,
  action: (pickingTaskId: string) => ReturnType<typeof startPickingTask>,
  fallbackMessage: string,
  missingIdMessage: string,
) {
  const { pickingTaskId, redirectTo } = readWorkflowActionInput(formData);

  if (!pickingTaskId) {
    redirect(withActionError(redirectTo, missingIdMessage));
  }

  const result = await action(pickingTaskId);

  if (!result.ok) {
    redirect(withActionError(redirectTo, result.message ?? fallbackMessage));
  }

  revalidatePickingPages(result.data.id, result.data.salesOrderId);
  redirect(redirectTo);
}

function parsePickingTaskPayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: PickingTaskPayload }
  | { ok: false; error: string } {
  const salesOrderId = String(formData.get("salesOrderId") ?? "").trim();
  const reservationIds = formData
    .getAll("lineReservationId")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const quantities = formData
    .getAll("lineQuantityToPick")
    .map((value) => Number(String(value).trim()));

  if (!salesOrderId) {
    return {
      ok: false,
      error: messages.pickingTasks.actions.salesOrderRequired,
    };
  }

  if (reservationIds.length === 0 || quantities.length === 0) {
    return {
      ok: false,
      error: messages.pickingTasks.actions.lineRequired,
    };
  }

  if (reservationIds.length !== quantities.length) {
    return {
      ok: false,
      error: messages.pickingTasks.actions.lineParseError,
    };
  }

  const lines: PickingTaskPayload["lines"] = [];
  const seenReservationIds = new Set<string>();

  for (const [index, reservationId] of reservationIds.entries()) {
    const quantityToPick = quantities[index];

    if (!reservationId) {
      return {
        ok: false,
        error: interpolateMessage(
          messages.pickingTasks.actions.reservationRequired,
          {
            index: index + 1,
          },
        ),
      };
    }

    if (seenReservationIds.has(reservationId)) {
      return {
        ok: false,
        error: messages.pickingTasks.actions.reservationUnique,
      };
    }

    if (Number.isNaN(quantityToPick) || quantityToPick <= 0) {
      return {
        ok: false,
        error: interpolateMessage(messages.pickingTasks.actions.quantityValid, {
          index: index + 1,
        }),
      };
    }

    seenReservationIds.add(reservationId);
    lines.push({
      salesOrderReservationId: reservationId,
      quantityToPick,
    });
  }

  return {
    ok: true,
    payload: {
      salesOrderId,
      lines,
    },
  };
}

function readWorkflowActionInput(formData: FormData) {
  return {
    pickingTaskId: String(formData.get("pickingTaskId") ?? "").trim(),
    redirectTo:
      String(formData.get("redirectTo") ?? "").trim() || "/picking-tasks",
  };
}

function revalidatePickingPages(pickingTaskId: string, salesOrderId: string) {
  revalidatePath("/picking-tasks");
  revalidatePath(`/picking-tasks/${pickingTaskId}`);
  revalidatePath("/sales-orders");
  revalidatePath(`/sales-orders/${salesOrderId}`);
}

function withActionError(path: string, message: string) {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("actionError", message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}
