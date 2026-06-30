"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelInboundOrder,
  createInboundOrder,
  markInboundOrderReady,
  updateInboundOrder,
} from "@/lib/api/inbound-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import type {
  InboundOrderPayload,
  InboundWorkflowFormState,
} from "@/types/inbound";

const initialState: InboundWorkflowFormState = {
  error: null,
  successMessage: null,
};

export async function createInboundOrderAction(
  _: InboundWorkflowFormState,
  formData: FormData,
): Promise<InboundWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseInboundOrderPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createInboundOrder(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.inboundOrders.actions.createFallback,
    };
  }

  revalidateInboundPages();
  redirect(`/inbound-orders/${result.data.id}`);
}

export async function updateInboundOrderAction(
  inboundOrderId: string,
  _: InboundWorkflowFormState,
  formData: FormData,
): Promise<InboundWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseInboundOrderPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await updateInboundOrder(inboundOrderId, parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.inboundOrders.actions.updateFallback,
    };
  }

  revalidateInboundPages();
  revalidatePath(`/inbound-orders/${inboundOrderId}`);
  redirect(`/inbound-orders/${inboundOrderId}`);
}

export async function markInboundOrderReadyAction(
  inboundOrderId: string,
  redirectTo: string,
) {
  const messages = getMessages(await getRequestLocale());
  const result = await markInboundOrderReady(inboundOrderId);

  if (!result.ok) {
    redirect(withActionError(
      redirectTo,
      result.message ?? messages.inboundOrders.actions.readyFallback,
    ));
  }

  revalidateInboundPages();
  revalidatePath(`/inbound-orders/${inboundOrderId}`);
  redirect(redirectTo);
}

export async function cancelInboundOrderAction(
  inboundOrderId: string,
  redirectTo: string,
) {
  const messages = getMessages(await getRequestLocale());
  const result = await cancelInboundOrder(inboundOrderId);

  if (!result.ok) {
    redirect(withActionError(
      redirectTo,
      result.message ?? messages.inboundOrders.actions.cancelFallback,
    ));
  }

  revalidateInboundPages();
  revalidatePath(`/inbound-orders/${inboundOrderId}`);
  redirect(redirectTo);
}

function revalidateInboundPages() {
  revalidatePath("/inbound-orders");
  revalidatePath("/receipts");
}

function parseInboundOrderPayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: InboundOrderPayload }
  | { ok: false; error: string } {
  const supplierId = String(formData.get("supplierId") ?? "").trim();
  const supplierInvoiceReference = String(
    formData.get("supplierInvoiceReference") ?? "",
  ).trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const productIds = formData
    .getAll("lineProductId")
    .map((value) => String(value).trim());
  const quantityInputs = formData
    .getAll("lineExpectedQuantity")
    .map((value) => String(value).trim());

  if (!supplierId || !supplierInvoiceReference) {
    return {
      ok: false,
      error: messages.inboundOrders.actions.supplierReferenceRequired,
    };
  }

  if (productIds.length === 0 || quantityInputs.length === 0) {
    return {
      ok: false,
      error: messages.inboundOrders.actions.lineRequired,
    };
  }

  const lines = productIds
    .map((productId, index) => {
      const expectedQuantityInput = quantityInputs[index] ?? "";

      return {
        productId,
        expectedQuantityInput,
        expectedQuantity: Number(expectedQuantityInput),
      };
    })
    .filter(
      (line) => line.productId.length > 0 || line.expectedQuantityInput.length > 0,
    );

  if (lines.length === 0) {
    return {
      ok: false,
      error: messages.inboundOrders.actions.validLineRequired,
    };
  }

  for (const line of lines) {
    if (!line.productId) {
      return {
        ok: false,
        error: messages.inboundOrders.actions.productRequired,
      };
    }

    if (Number.isNaN(line.expectedQuantity) || line.expectedQuantity <= 0) {
      return {
        ok: false,
        error: messages.inboundOrders.actions.quantityValid,
      };
    }
  }

  return {
    ok: true,
    payload: {
      supplierId,
      supplierInvoiceReference,
      notes,
      lines: lines.map((line) => ({
        productId: line.productId,
        expectedQuantity: line.expectedQuantity,
      })),
    },
  };
}

function withActionError(path: string, message: string) {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("actionError", message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}
