export type PickingTaskStatus =
  | "Pending"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type PickingTaskLine = {
  id: string;
  salesOrderLineId: string;
  salesOrderReservationId: string;
  inventoryBalanceId: string;
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
  quantityToPick: number;
  pickedQuantity: number;
};

export type PickingTask = {
  id: string;
  salesOrderId: string;
  salesOrderStatus: string;
  status: PickingTaskStatus;
  createdAtUtc: string;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  cancelledAtUtc: string | null;
  lines: PickingTaskLine[];
};

export type PickingTaskPayload = {
  salesOrderId: string;
  lines: Array<{
    salesOrderReservationId: string;
    quantityToPick: number;
  }>;
};

export type PickingWorkflowFormState = {
  error: string | null;
  successMessage: string | null;
};
