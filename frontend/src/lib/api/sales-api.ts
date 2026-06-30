import "server-only";

import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";
import type { SalesOrder, SalesOrderPayload } from "@/types/sales";

export function listSalesOrders() {
  return getWmsJson<SalesOrder[]>("/api/sales-orders");
}

export function getSalesOrder(salesOrderId: string) {
  return getWmsJson<SalesOrder>(`/api/sales-orders/${salesOrderId}`);
}

export function createSalesOrder(payload: SalesOrderPayload) {
  return mutateWmsJson<SalesOrder>("/api/sales-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSalesOrder(salesOrderId: string, payload: SalesOrderPayload) {
  return mutateWmsJson<SalesOrder>(`/api/sales-orders/${salesOrderId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function confirmSalesOrder(salesOrderId: string) {
  return mutateWmsJson<SalesOrder>(`/api/sales-orders/${salesOrderId}/confirm`, {
    method: "PATCH",
  });
}

export function cancelSalesOrder(salesOrderId: string) {
  return mutateWmsJson<SalesOrder>(`/api/sales-orders/${salesOrderId}/cancel`, {
    method: "PATCH",
  });
}
