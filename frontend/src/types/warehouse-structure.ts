export type Warehouse = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type Zone = {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type Location = {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  zoneId: string;
  zoneCode: string;
  code: string;
  name: string;
  locationType: string;
  isActive: boolean;
  isBlocked: boolean;
  mapRow: number;
  mapColumn: number;
};

export type WarehousePayload = {
  code: string;
  name: string;
  isActive: boolean;
};

export type ZonePayload = {
  warehouseId: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type LocationPayload = {
  warehouseId: string;
  zoneId: string;
  code: string;
  name: string;
  locationType: string;
  isActive: boolean;
  mapRow: number;
  mapColumn: number;
};

export type WarehouseStructureFormState = {
  error: string | null;
  successMessage: string | null;
};
