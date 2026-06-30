import "server-only";

import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";
import type {
  ManagedSupplier,
  ManagedSupplierDetail,
  SupplierPayload,
} from "@/types/supplier";

export function listSuppliers() {
  return getWmsJson<ManagedSupplier[]>("/api/suppliers");
}

export function getSupplier(supplierId: string) {
  return getWmsJson<ManagedSupplierDetail>(`/api/suppliers/${supplierId}`);
}

export function createSupplier(payload: SupplierPayload) {
  return mutateWmsJson<ManagedSupplier>("/api/suppliers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSupplier(supplierId: string, payload: SupplierPayload) {
  return mutateWmsJson<ManagedSupplier>(`/api/suppliers/${supplierId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function activateSupplier(supplierId: string) {
  return mutateWmsJson<ManagedSupplier>(`/api/suppliers/${supplierId}/activate`, {
    method: "PATCH",
  });
}

export function deactivateSupplier(supplierId: string) {
  return mutateWmsJson<ManagedSupplier>(`/api/suppliers/${supplierId}/deactivate`, {
    method: "PATCH",
  });
}
