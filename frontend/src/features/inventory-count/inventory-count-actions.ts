"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelInventoryCount,
  completeInventoryCount,
  createInventoryCount,
  startInventoryCount,
} from "@/lib/api/inventory-count-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type {
  InventoryCountPayload,
  InventoryCountWorkflowFormState,
} from "@/types/inventory-count";

const initialState: InventoryCountWorkflowFormState = {
  error: null,
  successMessage: null,
};

export async function createInventoryCountAction(
  _: InventoryCountWorkflowFormState,
  formData: FormData,
): Promise<InventoryCountWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseCreatePayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createInventoryCount(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.inventoryCounts.actions.createFallback,
    };
  }

  revalidateInventoryCountPages(result.data.id);
  redirect(`/inventory-counts/${result.data.id}`);
}

export async function completeInventoryCountAction(
  _: InventoryCountWorkflowFormState,
  formData: FormData,
): Promise<InventoryCountWorkflowFormState> {
  const messages = getMessages(await getRequestLocale());
  const inventoryCountId = String(formData.get("inventoryCountId") ?? "").trim();
  const redirectTo =
    String(formData.get("redirectTo") ?? "").trim() ||
    `/inventory-counts/${inventoryCountId}`;

  if (!inventoryCountId) {
    return {
      ...initialState,
      error: messages.inventoryCounts.actions.idRequired,
    };
  }

  const lineIds = formData
    .getAll("lineInventoryCountLineId")
    .map((value) => String(value).trim());
  const countedQuantities = formData
    .getAll("lineCountedQuantity")
    .map((value) => String(value).trim());

  if (lineIds.length === 0 || countedQuantities.length === 0) {
    return {
      ...initialState,
      error: messages.inventoryCounts.actions.countedLinesRequired,
    };
  }

  if (lineIds.length !== countedQuantities.length) {
    return {
      ...initialState,
      error: messages.inventoryCounts.actions.countedLineMatchError,
    };
  }

  const lines: Array<{
    inventoryCountLineId: string;
    countedQuantity: number;
  }> = [];

  for (const [index, inventoryCountLineId] of lineIds.entries()) {
    const countedQuantity = Number(countedQuantities[index]);

    if (!inventoryCountLineId) {
      return {
        ...initialState,
        error: interpolateMessage(
          messages.inventoryCounts.actions.countedLineIdMissing,
          {
            index: index + 1,
          },
        ),
      };
    }

    if (countedQuantities[index] === "") {
      return {
        ...initialState,
        error: interpolateMessage(
          messages.inventoryCounts.actions.countedQuantityRequired,
          {
            index: index + 1,
          },
        ),
      };
    }

    if (Number.isNaN(countedQuantity) || countedQuantity < 0) {
      return {
        ...initialState,
        error: interpolateMessage(
          messages.inventoryCounts.actions.countedQuantityValid,
          {
            index: index + 1,
          },
        ),
      };
    }

    lines.push({
      inventoryCountLineId,
      countedQuantity,
    });
  }

  const result = await completeInventoryCount(inventoryCountId, { lines });

  if (!result.ok) {
    return {
      ...initialState,
      error:
        result.message ??
        messages.inventoryCounts.actions.completeFallback,
    };
  }

  revalidateInventoryCountPages(result.data.id);
  revalidatePath("/inventory");
  redirect(redirectTo);
}

export async function startInventoryCountAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runInventoryCountWorkflowAction(
    formData,
    startInventoryCount,
    messages.inventoryCounts.actions.startFallback,
    messages,
  );
}

export async function cancelInventoryCountAction(formData: FormData) {
  const messages = getMessages(await getRequestLocale());
  await runInventoryCountWorkflowAction(
    formData,
    cancelInventoryCount,
    messages.inventoryCounts.actions.cancelFallback,
    messages,
  );
}

async function runInventoryCountWorkflowAction(
  formData: FormData,
  action: (inventoryCountId: string) => ReturnType<typeof startInventoryCount>,
  fallbackMessage: string,
  messages: Messages,
) {
  const { inventoryCountId, redirectTo } = readWorkflowActionInput(formData);

  if (!inventoryCountId) {
    redirect(withActionError(redirectTo, messages.inventoryCounts.actions.idRequired));
  }

  const result = await action(inventoryCountId);

  if (!result.ok) {
    redirect(withActionError(redirectTo, result.message ?? fallbackMessage));
  }

  revalidateInventoryCountPages(result.data.id);
  redirect(redirectTo);
}

function parseCreatePayload(
  formData: FormData,
  messages: Messages,
): { ok: true; payload: InventoryCountPayload } | { ok: false; error: string } {
  const productIds = formData
    .getAll("lineProductId")
    .map((value) => String(value).trim());
  const locationIds = formData
    .getAll("lineLocationId")
    .map((value) => String(value).trim());

  if (productIds.length === 0 || locationIds.length === 0) {
    return {
      ok: false,
      error: messages.inventoryCounts.actions.atLeastOneLine,
    };
  }

  if (productIds.length !== locationIds.length) {
    return {
      ok: false,
      error: messages.inventoryCounts.actions.lineParseError,
    };
  }

  const lines: InventoryCountPayload["lines"] = [];

  for (const [index, productId] of productIds.entries()) {
    const locationId = locationIds[index];

    if (!productId) {
      return {
        ok: false,
        error: interpolateMessage(messages.inventoryCounts.actions.productRequired, {
          index: index + 1,
        }),
      };
    }

    if (!locationId) {
      return {
        ok: false,
        error: interpolateMessage(messages.inventoryCounts.actions.locationRequired, {
          index: index + 1,
        }),
      };
    }

    lines.push({
      productId,
      locationId,
    });
  }

  return {
    ok: true,
    payload: { lines },
  };
}

function readWorkflowActionInput(formData: FormData) {
  return {
    inventoryCountId: String(formData.get("inventoryCountId") ?? "").trim(),
    redirectTo:
      String(formData.get("redirectTo") ?? "").trim() || "/inventory-counts",
  };
}

function revalidateInventoryCountPages(inventoryCountId: string) {
  revalidatePath("/inventory-counts");
  revalidatePath(`/inventory-counts/${inventoryCountId}`);
}

function withActionError(path: string, message: string) {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("actionError", message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}
