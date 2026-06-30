import "server-only";

import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";
import type { Shipment, ShipmentPayload } from "@/types/shipment";

export function listShipments() {
  return getWmsJson<Shipment[]>("/api/shipments");
}

export function getShipment(shipmentId: string) {
  return getWmsJson<Shipment>(`/api/shipments/${shipmentId}`);
}

export function createShipment(payload: ShipmentPayload) {
  return mutateWmsJson<Shipment>("/api/shipments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function startShipment(shipmentId: string) {
  return mutateWmsJson<Shipment>(`/api/shipments/${shipmentId}/start`, {
    method: "PATCH",
  });
}

export function completeShipment(shipmentId: string) {
  return mutateWmsJson<Shipment>(`/api/shipments/${shipmentId}/complete`, {
    method: "PATCH",
  });
}

export function cancelShipment(shipmentId: string) {
  return mutateWmsJson<Shipment>(`/api/shipments/${shipmentId}/cancel`, {
    method: "PATCH",
  });
}
