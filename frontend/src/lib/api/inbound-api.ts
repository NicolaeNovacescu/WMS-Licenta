import "server-only";

import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";
import type {
  InboundOrder,
  InboundOrderPayload,
  Receipt,
  ReceiptPayload,
} from "@/types/inbound";

export function listInboundOrders() {
  return getWmsJson<InboundOrder[]>("/api/inbound-orders");
}

export function getInboundOrder(inboundOrderId: string) {
  return getWmsJson<InboundOrder>(`/api/inbound-orders/${inboundOrderId}`);
}

export function createInboundOrder(payload: InboundOrderPayload) {
  return mutateWmsJson<InboundOrder>("/api/inbound-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateInboundOrder(
  inboundOrderId: string,
  payload: InboundOrderPayload,
) {
  return mutateWmsJson<InboundOrder>(`/api/inbound-orders/${inboundOrderId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function markInboundOrderReady(inboundOrderId: string) {
  return mutateWmsJson<InboundOrder>(
    `/api/inbound-orders/${inboundOrderId}/mark-ready`,
    {
      method: "PATCH",
    },
  );
}

export function cancelInboundOrder(inboundOrderId: string) {
  return mutateWmsJson<InboundOrder>(
    `/api/inbound-orders/${inboundOrderId}/cancel`,
    {
      method: "PATCH",
    },
  );
}

export function listReceipts() {
  return getWmsJson<Receipt[]>("/api/receipts");
}

export function getReceipt(receiptId: string) {
  return getWmsJson<Receipt>(`/api/receipts/${receiptId}`);
}

export function createReceipt(payload: ReceiptPayload) {
  return mutateWmsJson<Receipt>("/api/receipts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function startReceipt(receiptId: string) {
  return mutateWmsJson<Receipt>(`/api/receipts/${receiptId}/start`, {
    method: "PATCH",
  });
}

export function confirmReceipt(receiptId: string) {
  return mutateWmsJson<Receipt>(`/api/receipts/${receiptId}/confirm`, {
    method: "PATCH",
  });
}

export function cancelReceipt(receiptId: string) {
  return mutateWmsJson<Receipt>(`/api/receipts/${receiptId}/cancel`, {
    method: "PATCH",
  });
}
