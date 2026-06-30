import "server-only";

import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";
import type {
  CustomerPayload,
  ManagedCustomer,
  ManagedCustomerDetail,
} from "@/types/customer";

export function listCustomers() {
  return getWmsJson<ManagedCustomer[]>("/api/customers");
}

export function getCustomer(customerId: string) {
  return getWmsJson<ManagedCustomerDetail>(`/api/customers/${customerId}`);
}

export function createCustomer(payload: CustomerPayload) {
  return mutateWmsJson<ManagedCustomer>("/api/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCustomer(customerId: string, payload: CustomerPayload) {
  return mutateWmsJson<ManagedCustomer>(`/api/customers/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function activateCustomer(customerId: string) {
  return mutateWmsJson<ManagedCustomer>(`/api/customers/${customerId}/activate`, {
    method: "PATCH",
  });
}

export function deactivateCustomer(customerId: string) {
  return mutateWmsJson<ManagedCustomer>(`/api/customers/${customerId}/deactivate`, {
    method: "PATCH",
  });
}
