"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelReceipt,
  confirmReceipt,
  createReceipt,
  startReceipt,
} from "@/lib/api/inbound-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import type {
  InboundWorkflowFormState,
  ReceiptPayload,
} from "@/types/inbound";

const initialState: InboundWorkflowFormState = {
  error: null,
  successMessage: null,
};

export async function createReceiptAction(
  _: InboundWorkflowFormState,
  formData: FormData,
): Promise<InboundWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseReceiptPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createReceipt(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.receipts.actions.createFallback,
    };
  }

  revalidateReceiptPages();
  revalidatePath("/inbound-orders");
  revalidatePath(`/inbound-orders/${result.data.inboundOrderId}`);
  redirect(`/receipts/${result.data.id}`);
}

export async function startReceiptAction(receiptId: string, redirectTo: string) {
  const messages = getMessages(await getRequestLocale());
  const result = await startReceipt(receiptId);

  if (!result.ok) {
    redirect(
      withActionError(
        redirectTo,
        result.message ?? messages.receipts.actions.startFallback,
      ),
    );
  }

  revalidateReceiptPages();
  revalidatePath(`/receipts/${receiptId}`);
  redirect(redirectTo);
}

export async function confirmReceiptAction(
  receiptId: string,
  redirectTo: string,
) {
  const messages = getMessages(await getRequestLocale());
  const result = await confirmReceipt(receiptId);

  if (!result.ok) {
    redirect(
      withActionError(
        redirectTo,
        result.message ?? messages.receipts.actions.confirmFallback,
      ),
    );
  }

  revalidateReceiptPages();
  revalidatePath(`/receipts/${receiptId}`);
  revalidatePath("/inbound-orders");
  revalidatePath(`/inbound-orders/${result.data.inboundOrderId}`);
  revalidatePath("/inventory");
  redirect(redirectTo);
}

export async function cancelReceiptAction(receiptId: string, redirectTo: string) {
  const messages = getMessages(await getRequestLocale());
  const result = await cancelReceipt(receiptId);

  if (!result.ok) {
    redirect(
      withActionError(
        redirectTo,
        result.message ?? messages.receipts.actions.cancelFallback,
      ),
    );
  }

  revalidateReceiptPages();
  revalidatePath(`/receipts/${receiptId}`);
  redirect(redirectTo);
}

function revalidateReceiptPages() {
  revalidatePath("/receipts");
  revalidatePath("/inbound-orders");
}

function parseReceiptPayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: ReceiptPayload }
  | { ok: false; error: string } {
  const inboundOrderId = String(formData.get("inboundOrderId") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const inboundOrderLineIds = formData
    .getAll("lineInboundOrderLineId")
    .map((value) => String(value).trim());
  const receivingLocationIds = formData
    .getAll("lineReceivingLocationId")
    .map((value) => String(value).trim());
  const quantityInputs = formData
    .getAll("lineQuantity")
    .map((value) => String(value).trim());

  if (!inboundOrderId) {
    return {
      ok: false,
      error: messages.receipts.actions.inboundOrderRequired,
    };
  }

  const lines = inboundOrderLineIds
    .map((inboundOrderLineId, index) => ({
      inboundOrderLineId,
      receivingLocationId: receivingLocationIds[index] ?? "",
      quantity: Number(quantityInputs[index] ?? ""),
    }))
    .filter((line) => line.inboundOrderLineId && line.quantity > 0);

  if (lines.length === 0) {
    return {
      ok: false,
      error: messages.receipts.actions.lineRequired,
    };
  }

  for (const line of lines) {
    if (!line.receivingLocationId) {
      return {
        ok: false,
        error: messages.receipts.actions.receivingLocationRequired,
      };
    }

    if (Number.isNaN(line.quantity) || line.quantity <= 0) {
      return {
        ok: false,
        error: messages.receipts.actions.quantityValid,
      };
    }
  }

  return {
    ok: true,
    payload: {
      inboundOrderId,
      notes,
      lines,
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
