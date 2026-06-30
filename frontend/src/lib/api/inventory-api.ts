import "server-only";

import { getWmsJson } from "@/lib/api/wms-api";
import type {
  InventoryBalance,
  InventoryByLocation,
  InventoryByProduct,
  InventoryMovement,
  InventoryMovementFilters,
} from "@/types/inventory";

export function listInventoryByProduct() {
  return getWmsJson<InventoryByProduct[]>("/api/inventory/by-product");
}

export function listInventoryByLocation() {
  return getWmsJson<InventoryByLocation[]>("/api/inventory/by-location");
}

export function listInventoryBalances() {
  return getWmsJson<InventoryBalance[]>("/api/inventory/balances");
}

export function listInventoryMovements(filters?: InventoryMovementFilters) {
  const params = new URLSearchParams();

  if (filters?.productId) {
    params.set("productId", filters.productId);
  }

  if (filters?.locationId) {
    params.set("locationId", filters.locationId);
  }

  if (filters?.movementType) {
    params.set("movementType", filters.movementType);
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  return getWmsJson<InventoryMovement[]>(`/api/inventory/movements${suffix}`);
}
