export type InventoryByProduct = {
  productId: string;
  productSku: string;
  productName: string;
  onHandQuantity: number;
  reservedQuantity: number;
  pickedQuantity: number;
  availableQuantity: number;
  updatedAtUtc: string;
};

export type InventoryByLocation = {
  locationId: string;
  warehouseCode: string;
  zoneCode: string;
  locationCode: string;
  locationName: string;
  locationType: string;
  locationIsActive: boolean;
  locationIsBlocked: boolean;
  onHandQuantity: number;
  reservedQuantity: number;
  pickedQuantity: number;
  availableQuantity: number;
  updatedAtUtc: string;
};

export type InventoryBalance = {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  locationId: string;
  warehouseCode: string;
  zoneCode: string;
  locationCode: string;
  locationName: string;
  locationType: string;
  locationIsActive: boolean;
  locationIsBlocked: boolean;
  onHandQuantity: number;
  reservedQuantity: number;
  pickedQuantity: number;
  availableQuantity: number;
  updatedAtUtc: string;
};

export type InventoryMovementType = "Addition" | "Removal" | "Relocation";

export type InventoryMovement = {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  movementType: InventoryMovementType;
  sourceLocationId: string | null;
  sourceWarehouseCode: string | null;
  sourceZoneCode: string | null;
  sourceLocationCode: string | null;
  sourceLocationName: string | null;
  destinationLocationId: string | null;
  destinationWarehouseCode: string | null;
  destinationZoneCode: string | null;
  destinationLocationCode: string | null;
  destinationLocationName: string | null;
  referenceType: string | null;
  referenceId: string | null;
  performedAtUtc: string;
  performedByUserId: string | null;
  performedByUserName: string | null;
  notes: string | null;
};

export type InventoryMovementFilters = {
  productId?: string;
  locationId?: string;
  movementType?: InventoryMovementType;
};

export type InventoryView = "product" | "location" | "balance" | "movement";

export type LocationStateFilter =
  | "all"
  | "active"
  | "inactive"
  | "blocked"
  | "unblocked";
