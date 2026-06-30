export type TransferTaskStatus =
  | "Pending"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type TransferTask = {
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
  quantity: number;
  status: TransferTaskStatus;
  reason: string | null;
  createdAtUtc: string;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  cancelledAtUtc: string | null;
};

export type TransferTaskPayload = {
  productId: string;
  sourceLocationId: string;
  destinationLocationId: string;
  quantity: number;
  reason: string;
};

export type TransferWorkflowFormState = {
  error: string | null;
  successMessage: string | null;
};
