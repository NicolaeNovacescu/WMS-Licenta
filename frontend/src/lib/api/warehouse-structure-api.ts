import "server-only";

import type {
  Location,
  LocationPayload,
  Warehouse,
  WarehousePayload,
  Zone,
  ZonePayload,
} from "@/types/warehouse-structure";
import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";

export function listWarehouses() {
  return getWmsJson<Warehouse[]>("/api/warehouses");
}

export function createWarehouse(payload: WarehousePayload) {
  return mutateWmsJson<Warehouse>("/api/warehouses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateWarehouse(warehouseId: string, payload: WarehousePayload) {
  return mutateWmsJson<Warehouse>(`/api/warehouses/${warehouseId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function listZones() {
  return getWmsJson<Zone[]>("/api/zones");
}

export function createZone(payload: ZonePayload) {
  return mutateWmsJson<Zone>("/api/zones", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateZone(zoneId: string, payload: ZonePayload) {
  return mutateWmsJson<Zone>(`/api/zones/${zoneId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function listLocations() {
  return getWmsJson<Location[]>("/api/locations");
}

export function getLocation(locationId: string) {
  return getWmsJson<Location>(`/api/locations/${locationId}`);
}

export function createLocation(payload: LocationPayload) {
  return mutateWmsJson<Location>("/api/locations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateLocation(locationId: string, payload: LocationPayload) {
  return mutateWmsJson<Location>(`/api/locations/${locationId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function blockLocation(locationId: string) {
  return mutateWmsJson<void>(`/api/locations/${locationId}/block`, {
    method: "PATCH",
  });
}

export function unblockLocation(locationId: string) {
  return mutateWmsJson<void>(`/api/locations/${locationId}/unblock`, {
    method: "PATCH",
  });
}
