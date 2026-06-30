import "server-only";

import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";
import type {
  CompleteInventoryCountPayload,
  InventoryCount,
  InventoryCountPayload,
} from "@/types/inventory-count";

export function listInventoryCounts() {
  return getWmsJson<InventoryCount[]>("/api/inventory-counts");
}

export function getInventoryCount(inventoryCountId: string) {
  return getWmsJson<InventoryCount>(`/api/inventory-counts/${inventoryCountId}`);
}

export function createInventoryCount(payload: InventoryCountPayload) {
  return mutateWmsJson<InventoryCount>("/api/inventory-counts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function startInventoryCount(inventoryCountId: string) {
  return mutateWmsJson<InventoryCount>(
    `/api/inventory-counts/${inventoryCountId}/start`,
    {
      method: "PATCH",
    },
  );
}

export function completeInventoryCount(
  inventoryCountId: string,
  payload: CompleteInventoryCountPayload,
) {
  return mutateWmsJson<InventoryCount>(
    `/api/inventory-counts/${inventoryCountId}/complete`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function cancelInventoryCount(inventoryCountId: string) {
  return mutateWmsJson<InventoryCount>(
    `/api/inventory-counts/${inventoryCountId}/cancel`,
    {
      method: "PATCH",
    },
  );
}
