"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createReplenishmentRule,
  deactivateReplenishmentRule,
  updateReplenishmentRule,
} from "@/lib/api/replenishment-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import type {
  ReplenishmentRuleFormState,
  ReplenishmentRulePayload,
} from "@/types/replenishment";

const initialState: ReplenishmentRuleFormState = {
  error: null,
  successMessage: null,
};

export async function createReplenishmentRuleAction(
  _: ReplenishmentRuleFormState,
  formData: FormData,
): Promise<ReplenishmentRuleFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseReplenishmentRulePayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createReplenishmentRule(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.replenishmentRules.actions.createFallback,
    };
  }

  revalidateReplenishmentPages();
  redirect(`/replenishment-rules/${result.data.id}`);
}

export async function updateReplenishmentRuleAction(
  replenishmentRuleId: string,
  _: ReplenishmentRuleFormState,
  formData: FormData,
): Promise<ReplenishmentRuleFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseReplenishmentRulePayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await updateReplenishmentRule(
    replenishmentRuleId,
    parsed.payload,
  );

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.replenishmentRules.actions.updateFallback,
    };
  }

  revalidateReplenishmentPages();
  revalidatePath(`/replenishment-rules/${replenishmentRuleId}`);
  redirect(`/replenishment-rules/${replenishmentRuleId}`);
}

export async function deactivateReplenishmentRuleAction(
  replenishmentRuleId: string,
  redirectTo: string,
) {
  const messages = getMessages(await getRequestLocale());
  const result = await deactivateReplenishmentRule(replenishmentRuleId);

  if (!result.ok) {
    redirect(
      withActionError(
        redirectTo,
        result.message ?? messages.replenishmentRules.actions.deactivateFallback,
      ),
    );
  }

  revalidateReplenishmentPages();
  revalidatePath(`/replenishment-rules/${replenishmentRuleId}`);
  redirect(redirectTo);
}

function parseReplenishmentRulePayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: ReplenishmentRulePayload }
  | { ok: false; error: string } {
  const productId = String(formData.get("productId") ?? "").trim();
  const targetLocationId = String(formData.get("targetLocationId") ?? "").trim();
  const minimumThreshold = Number(
    String(formData.get("minimumThreshold") ?? "").trim(),
  );
  const targetQuantity = Number(
    String(formData.get("targetQuantity") ?? "").trim(),
  );

  if (!productId || !targetLocationId) {
    return {
      ok: false,
      error: messages.replenishmentRules.actions.fieldsRequired,
    };
  }

  if (Number.isNaN(minimumThreshold) || minimumThreshold < 0) {
    return {
      ok: false,
      error: messages.replenishmentRules.actions.minimumThresholdValid,
    };
  }

  if (Number.isNaN(targetQuantity) || targetQuantity <= minimumThreshold) {
    return {
      ok: false,
      error: messages.replenishmentRules.actions.targetQuantityValid,
    };
  }

  return {
    ok: true,
    payload: {
      productId,
      targetLocationId,
      minimumThreshold,
      targetQuantity,
    },
  };
}

function revalidateReplenishmentPages() {
  revalidatePath("/replenishment-rules");
  revalidatePath("/replenishment-tasks");
}

function withActionError(path: string, message: string) {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("actionError", message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}
