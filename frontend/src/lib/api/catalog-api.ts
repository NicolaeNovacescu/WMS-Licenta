import "server-only";

import type {
  Product,
  ProductCategory,
  ProductCategoryPayload,
  ProductPayload,
  UnitOfMeasure,
  UnitOfMeasurePayload,
} from "@/types/catalog";
import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";

export function listProducts() {
  return getWmsJson<Product[]>("/api/products");
}

export function getProduct(productId: string) {
  return getWmsJson<Product>(`/api/products/${productId}`);
}

export function listProductCategories() {
  return getWmsJson<ProductCategory[]>("/api/product-categories");
}

export function createProductCategory(payload: ProductCategoryPayload) {
  return mutateWmsJson<ProductCategory>("/api/product-categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listUnitsOfMeasure() {
  return getWmsJson<UnitOfMeasure[]>("/api/units-of-measure");
}

export function createUnitOfMeasure(payload: UnitOfMeasurePayload) {
  return mutateWmsJson<UnitOfMeasure>("/api/units-of-measure", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createProduct(payload: ProductPayload) {
  return mutateWmsJson<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(productId: string, payload: ProductPayload) {
  return mutateWmsJson<Product>(`/api/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deactivateProduct(productId: string) {
  return mutateWmsJson<void>(`/api/products/${productId}/deactivate`, {
    method: "PATCH",
  });
}
