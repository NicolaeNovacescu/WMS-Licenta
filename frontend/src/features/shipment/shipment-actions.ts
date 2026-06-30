"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelShipment,
  completeShipment,
  createShipment,
  startShipment,
} from "@/lib/api/shipment-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import {
  getMessages,
  interpolateMessage,
  type Messages,
} from "@/lib/i18n/messages";
import type { ShipmentPayload, ShipmentWorkflowFormState } from "@/types/shipment";

const initialState: ShipmentWorkflowFormState = {
  error: null,
  successMessage: null,
};

export async function createShipmentAction(
  _: ShipmentWorkflowFormState,
  formData: FormData,
): Promise<ShipmentWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseShipmentPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createShipment(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.shipments.actions.createFallback,
    };
  }

  revalidateShipmentPages(result.data.id, result.data.salesOrderId);
  redirect(`/shipments/${result.data.id}`);
}

export async function startShipmentAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runShipmentWorkflowAction(
    formData,
    startShipment,
    messages.shipments.actions.startFallback,
    messages.shipments.actions.idRequired,
  );
}

export async function completeShipmentAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  const { shipmentId, redirectTo } = readWorkflowActionInput(formData);

  if (!shipmentId) {
    redirect(withActionError(redirectTo, messages.shipments.actions.idRequired));
  }

  const result = await completeShipment(shipmentId);

  if (!result.ok) {
    redirect(
      withActionError(
        redirectTo,
        result.message ?? messages.shipments.actions.completeFallback,
      ),
    );
  }

  revalidateShipmentPages(result.data.id, result.data.salesOrderId);
  revalidatePath("/inventory");
  redirect(redirectTo);
}

export async function cancelShipmentAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runShipmentWorkflowAction(
    formData,
    cancelShipment,
    messages.shipments.actions.cancelFallback,
    messages.shipments.actions.idRequired,
  );
}

async function runShipmentWorkflowAction(
  formData: FormData,
  action: (shipmentId: string) => ReturnType<typeof startShipment>,
  fallbackMessage: string,
  missingIdMessage: string,
) {
  const { shipmentId, redirectTo } = readWorkflowActionInput(formData);

  if (!shipmentId) {
    redirect(withActionError(redirectTo, missingIdMessage));
  }

  const result = await action(shipmentId);

  if (!result.ok) {
    redirect(withActionError(redirectTo, result.message ?? fallbackMessage));
  }

  revalidateShipmentPages(result.data.id, result.data.salesOrderId);
  redirect(redirectTo);
}

function parseShipmentPayload(
  formData: FormData,
  messages: Messages,
): { ok: true; payload: ShipmentPayload } | { ok: false; error: string } {
  const salesOrderId = String(formData.get("salesOrderId") ?? "").trim();
  const pickingTaskLineIds = formData
    .getAll("linePickingTaskLineId")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const quantities = formData
    .getAll("lineQuantityToShip")
    .map((value) => Number(String(value).trim()));

  if (!salesOrderId) {
    return {
      ok: false,
      error: messages.shipments.actions.salesOrderRequired,
    };
  }

  if (pickingTaskLineIds.length === 0 || quantities.length === 0) {
    return {
      ok: false,
      error: messages.shipments.actions.lineRequired,
    };
  }

  if (pickingTaskLineIds.length !== quantities.length) {
    return {
      ok: false,
      error: messages.shipments.actions.lineParseError,
    };
  }

  const lines: ShipmentPayload["lines"] = [];
  const seenPickingTaskLineIds = new Set<string>();

  for (const [index, pickingTaskLineId] of pickingTaskLineIds.entries()) {
    const quantityToShip = quantities[index];

    if (!pickingTaskLineId) {
      return {
        ok: false,
        error: interpolateMessage(
          messages.shipments.actions.pickedLineRequired,
          {
            index: index + 1,
          },
        ),
      };
    }

    if (seenPickingTaskLineIds.has(pickingTaskLineId)) {
      return {
        ok: false,
        error: messages.shipments.actions.pickedLineUnique,
      };
    }

    if (Number.isNaN(quantityToShip) || quantityToShip <= 0) {
      return {
        ok: false,
        error: interpolateMessage(messages.shipments.actions.quantityValid, {
          index: index + 1,
        }),
      };
    }

    seenPickingTaskLineIds.add(pickingTaskLineId);
    lines.push({
      pickingTaskLineId,
      quantityToShip,
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
    shipmentId: String(formData.get("shipmentId") ?? "").trim(),
    redirectTo: String(formData.get("redirectTo") ?? "").trim() || "/shipments",
  };
}

function revalidateShipmentPages(shipmentId: string, salesOrderId: string) {
  revalidatePath("/shipments");
  revalidatePath(`/shipments/${shipmentId}`);
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
