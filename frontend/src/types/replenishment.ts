export type ReplenishmentRule = {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  targetLocationId: string;
  targetWarehouseCode: string;
  targetZoneCode: string;
  targetLocationCode: string;
  targetLocationName: string;
  targetLocationType: string;
  targetLocationIsActive: boolean;
  targetLocationIsBlocked: boolean;
  minimumThreshold: number;
  targetQuantity: number;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type ReplenishmentTaskStatus =
  | "Pending"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type ReplenishmentTask = {
  id: string;
  replenishmentRuleId: string;
  productId: string;
  productSku: string;
  productName: string;
  sourceLocationId: string;
  sourceWarehouseCode: string;
  sourceZoneCode: string;
  sourceLocationCode: string;
  sourceLocationName: string;
  sourceLocationType: string;
  sourceLocationIsActive: boolean;
  sourceLocationIsBlocked: boolean;
  targetLocationId: string;
  targetWarehouseCode: string;
  targetZoneCode: string;
  targetLocationCode: string;
  targetLocationName: string;
  targetLocationType: string;
  targetLocationIsActive: boolean;
  targetLocationIsBlocked: boolean;
  quantity: number;
  status: ReplenishmentTaskStatus;
  createdAtUtc: string;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  cancelledAtUtc: string | null;
};

export type ReplenishmentRulePayload = {
  productId: string;
  targetLocationId: string;
  minimumThreshold: number;
  targetQuantity: number;
};

export type ReplenishmentTaskPayload = {
  productId: string;
  sourceLocationId: string;
  targetLocationId: string;
  quantity: number;
};

export type ReplenishmentRuleFormState = {
  error: string | null;
  successMessage: string | null;
};

export type ReplenishmentTaskFormState = {
  error: string | null;
  successMessage: string | null;
};
