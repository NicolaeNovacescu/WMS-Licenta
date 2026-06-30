"use server";

import { lookupBarcode } from "@/lib/api/barcode-api";
import type { BarcodeLookupViewState } from "@/types/barcode";

export async function resolveProductBarcodeAction(
  _: BarcodeLookupViewState,
  formData: FormData,
): Promise<BarcodeLookupViewState> {
  const value = String(formData.get("value") ?? "").trim();

  if (!value) {
    return {
      kind: "error",
      value: "",
      message: "Enter or paste a barcode value before starting an exact lookup.",
    };
  }

  const lookupResult = await lookupBarcode(value);

  if (lookupResult.ok) {
    return {
      kind: "success",
      value,
      result: lookupResult.data,
      navigationHref: null,
    };
  }

  if (lookupResult.status === 404) {
    return {
      kind: "not-found",
      value,
      message: lookupResult.message,
    };
  }

  if (lookupResult.status === 409) {
    return {
      kind: "conflict",
      value,
      message: lookupResult.message,
    };
  }

  return {
    kind: "error",
    value,
    message:
      lookupResult.message ?? "The backend did not return a usable barcode result.",
  };
}
