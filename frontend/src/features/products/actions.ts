"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createProduct,
  createProductCategory,
  createUnitOfMeasure,
  deactivateProduct,
  updateProduct,
} from "@/lib/api/catalog-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages } from "@/lib/i18n/messages";
import type {
  CatalogSetupFormState,
  ProductCategoryPayload,
  ProductFormState,
  ProductPayload,
  UnitOfMeasurePayload,
} from "@/types/catalog";

const setupInitialState: CatalogSetupFormState = {
  error: null,
  successMessage: null,
};

export async function createProductAction(
  _: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const messages = getMessages(await getRequestLocale());
  const payload = parseProductPayload(formData, messages);

  if ("error" in payload) {
    return payload;
  }

  const result = await createProduct(payload);

  if (!result.ok) {
    return {
      error: result.message ?? messages.products.actions.createFallback,
      successMessage: null,
    };
  }

  revalidatePath("/products");
  redirect(`/products/${result.data.id}`);
}

export async function createProductCategoryAction(
  _: CatalogSetupFormState,
  formData: FormData,
): Promise<CatalogSetupFormState> {
  const messages = getMessages(await getRequestLocale());
  const payload = parseSetupNamePayload(
    formData,
    messages.products.setup.categoryNameRequired,
  );

  if ("error" in payload) {
    return payload;
  }

  const result = await createProductCategory(payload);

  if (!result.ok) {
    return {
      ...setupInitialState,
      error: result.message ?? messages.products.setup.categoryCreateFallback,
    };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function createUnitOfMeasureAction(
  _: CatalogSetupFormState,
  formData: FormData,
): Promise<CatalogSetupFormState> {
  const messages = getMessages(await getRequestLocale());
  const payload = parseSetupNamePayload(
    formData,
    messages.products.setup.unitNameRequired,
  );

  if ("error" in payload) {
    return payload;
  }

  const result = await createUnitOfMeasure(payload);

  if (!result.ok) {
    return {
      ...setupInitialState,
      error: result.message ?? messages.products.setup.unitCreateFallback,
    };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProductAction(
  productId: string,
  _: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const messages = getMessages(await getRequestLocale());
  const payload = parseProductPayload(formData, messages);

  if ("error" in payload) {
    return payload;
  }

  const result = await updateProduct(productId, payload);

  if (!result.ok) {
    return {
      error: result.message ?? messages.products.actions.updateFallback,
      successMessage: null,
    };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect(`/products/${productId}`);
}

export async function deactivateProductAction(productId: string) {
  const result = await deactivateProduct(productId);

  if (!result.ok) {
    return;
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect(`/products/${productId}`);
}

function parseProductPayload(
  formData: FormData,
  messages: ReturnType<typeof getMessages>,
): ProductPayload | ProductFormState {
  const sku = String(formData.get("sku") ?? "").trim();
  const barcode = String(formData.get("barcode") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const unitOfMeasureId = String(formData.get("unitOfMeasureId") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  const defaultMinPickingThreshold = Number(
    String(formData.get("defaultMinPickingThreshold") ?? "").trim(),
  );
  const defaultTargetPickingQuantity = Number(
    String(formData.get("defaultTargetPickingQuantity") ?? "").trim(),
  );

  if (!sku || !name || !categoryId || !unitOfMeasureId) {
    return {
      error: messages.products.actions.requiredFields,
      successMessage: null,
    };
  }

  if (barcode.length > 100) {
    return {
      error: messages.products.actions.barcodeMax,
      successMessage: null,
    };
  }

  if (
    Number.isNaN(defaultMinPickingThreshold) ||
    Number.isNaN(defaultTargetPickingQuantity)
  ) {
    return {
      error: messages.products.actions.thresholdsNumeric,
      successMessage: null,
    };
  }

  if (defaultMinPickingThreshold < 0 || defaultTargetPickingQuantity < 0) {
    return {
      error: messages.products.actions.thresholdsNonNegative,
      successMessage: null,
    };
  }

  return {
    sku,
    barcode,
    name,
    description,
    categoryId,
    unitOfMeasureId,
    imageUrl,
    isActive,
    defaultMinPickingThreshold,
    defaultTargetPickingQuantity,
  };
}

function parseSetupNamePayload(
  formData: FormData,
  requiredMessage: string,
): ProductCategoryPayload | UnitOfMeasurePayload | CatalogSetupFormState {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return {
      ...setupInitialState,
      error: requiredMessage,
    };
  }

  return { name };
}
