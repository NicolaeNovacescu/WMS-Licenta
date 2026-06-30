export type ShipmentStatus =
  | "Pending"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type ShipmentLine = {
  id: string;
  pickingTaskLineId: string;
  pickingTaskId: string;
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
  quantityToShip: number;
  shippedQuantity: number;
};

export type Shipment = {
  id: string;
  salesOrderId: string;
  salesOrderStatus: string;
  status: ShipmentStatus;
  createdAtUtc: string;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  cancelledAtUtc: string | null;
  lines: ShipmentLine[];
};

export type ShipmentPayload = {
  salesOrderId: string;
  lines: Array<{
    pickingTaskLineId: string;
    quantityToShip: number;
  }>;
};

export type ShipmentWorkflowFormState = {
  error: string | null;
  successMessage: string | null;
};
