export type InventoryCountStatus =
  | "Draft"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type InventoryCountLine = {
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
  inventoryBalanceId: string | null;
  expectedSystemQuantity: number;
  countedQuantity: number | null;
  varianceQuantity: number | null;
};

export type InventoryCount = {
  id: string;
  status: InventoryCountStatus;
  createdAtUtc: string;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  cancelledAtUtc: string | null;
  lines: InventoryCountLine[];
};

export type InventoryCountPayload = {
  lines: Array<{
    productId: string;
    locationId: string;
  }>;
};

export type CompleteInventoryCountPayload = {
  lines: Array<{
    inventoryCountLineId: string;
    countedQuantity: number;
  }>;
};

export type InventoryCountWorkflowFormState = {
  error: string | null;
  successMessage: string | null;
};
