export type PutawayTaskStatus =
  | "Pending"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type PutawayTask = {
  id: string;
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
  destinationLocationId: string;
  destinationWarehouseCode: string;
  destinationZoneCode: string;
  destinationLocationCode: string;
  destinationLocationName: string;
  destinationLocationType: string;
  destinationLocationIsActive: boolean;
  destinationLocationIsBlocked: boolean;
  receiptLineId: string | null;
  receiptId: string | null;
  quantity: number;
  status: PutawayTaskStatus;
  notes: string | null;
  createdAtUtc: string;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  cancelledAtUtc: string | null;
};

export type PutawayTaskPayload = {
  productId: string;
  sourceLocationId: string;
  destinationLocationId: string;
  receiptLineId: string | null;
  quantity: number;
  notes: string;
};

export type PutawayWorkflowFormState = {
  error: string | null;
  successMessage: string | null;
};
