"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelSalesOrder,
  confirmSalesOrder,
  createSalesOrder,
  updateSalesOrder,
} from "@/lib/api/sales-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import {
  getMessages,
  interpolateMessage,
  type Messages,
} from "@/lib/i18n/messages";
import type { SalesOrderFormState, SalesOrderPayload } from "@/types/sales";

const initialState: SalesOrderFormState = {
  error: null,
  successMessage: null,
};

const genericAspNetProblemDetailsTitle =
  "An error occurred while processing your request.";

export async function createSalesOrderAction(
  _: SalesOrderFormState,
  formData: FormData,
): Promise<SalesOrderFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseSalesOrderPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createSalesOrder(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.salesOrders.actions.createFallback,
    };
  }

  revalidateSalesOrderPages(result.data.id);
  redirect(`/sales-orders/${result.data.id}`);
}

export async function updateSalesOrderAction(
  _: SalesOrderFormState,
  formData: FormData,
): Promise<SalesOrderFormState> {
  const messages = getMessages(await getRequestLocale());
  const salesOrderId = String(formData.get("salesOrderId") ?? "").trim();

  if (!salesOrderId) {
    return {
      ...initialState,
      error: messages.salesOrders.actions.idRequired,
    };
  }

  const parsed = parseSalesOrderPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await updateSalesOrder(salesOrderId, parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.salesOrders.actions.updateFallback,
    };
  }

  revalidateSalesOrderPages(salesOrderId);
  redirect(`/sales-orders/${salesOrderId}`);
}

export async function confirmSalesOrderAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  const { salesOrderId, redirectTo } = readWorkflowActionInput(formData);

  if (!salesOrderId) {
    redirect(withActionError(redirectTo, messages.salesOrders.actions.idRequired));
  }

  const result = await confirmSalesOrder(salesOrderId);

  if (!result.ok) {
    redirect(
      withActionError(
        redirectTo,
        getConfirmActionErrorMessage(result.message, messages),
      ),
    );
  }

  revalidateSalesOrderPages(salesOrderId);
  revalidatePath("/inventory");
  redirect(redirectTo);
}

export async function cancelSalesOrderAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  const { salesOrderId, redirectTo } = readWorkflowActionInput(formData);

  if (!salesOrderId) {
    redirect(withActionError(redirectTo, messages.salesOrders.actions.idRequired));
  }

  const result = await cancelSalesOrder(salesOrderId);

  if (!result.ok) {
    redirect(
      withActionError(
        redirectTo,
        result.message ?? messages.salesOrders.actions.cancelFallback,
      ),
    );
  }

  revalidateSalesOrderPages(salesOrderId);
  revalidatePath("/inventory");
  redirect(redirectTo);
}

function parseSalesOrderPayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: SalesOrderPayload }
  | { ok: false; error: string } {
  const productIds = formData
    .getAll("lineProductId")
    .map((value) => String(value).trim());
  const orderedQuantities = formData
    .getAll("lineOrderedQuantity")
    .map((value) => Number(String(value).trim()));
  const customerId = String(formData.get("customerId") ?? "").trim();

  if (!customerId) {
    return {
      ok: false,
      error: messages.salesOrders.actions.customerRequired,
    };
  }

  if (productIds.length === 0 || orderedQuantities.length === 0) {
    return {
      ok: false,
      error: messages.salesOrders.actions.atLeastOneLine,
    };
  }

  if (productIds.length !== orderedQuantities.length) {
    return {
      ok: false,
      error: messages.salesOrders.actions.lineParseError,
    };
  }

  const lines: SalesOrderPayload["lines"] = [];

  for (const [index, productId] of productIds.entries()) {
    const orderedQuantity = orderedQuantities[index];

    if (!productId) {
      return {
        ok: false,
        error: interpolateMessage(messages.salesOrders.actions.productRequired, {
          index: index + 1,
        }),
      };
    }

    if (Number.isNaN(orderedQuantity) || orderedQuantity <= 0) {
      return {
        ok: false,
        error: interpolateMessage(
          messages.salesOrders.actions.orderedQuantityValid,
          {
            index: index + 1,
          },
        ),
      };
    }

    lines.push({
      productId,
      orderedQuantity,
    });
  }

  return {
    ok: true,
    payload: {
      customerId,
      lines,
    },
  };
}

function readWorkflowActionInput(formData: FormData) {
  return {
    salesOrderId: String(formData.get("salesOrderId") ?? "").trim(),
    redirectTo:
      String(formData.get("redirectTo") ?? "").trim() || "/sales-orders",
  };
}

function revalidateSalesOrderPages(salesOrderId: string) {
  revalidatePath("/sales-orders");
  revalidatePath(`/sales-orders/${salesOrderId}`);
}

function getConfirmActionErrorMessage(
  message: string | null | undefined,
  messages: Messages,
) {
  const normalizedMessage = message?.trim();

  if (
    !normalizedMessage ||
    normalizedMessage === genericAspNetProblemDetailsTitle
  ) {
    return messages.salesOrders.actions.confirmFallback;
  }

  return normalizedMessage;
}

function withActionError(path: string, message: string) {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("actionError", message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}
