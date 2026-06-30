export type InboundOrderStatus =
  | "Draft"
  | "ReadyForReceipt"
  | "PartiallyReceived"
  | "FullyReceived"
  | "Cancelled";

export type ReceiptStatus =
  | "Draft"
  | "InProgress"
  | "Confirmed"
  | "Cancelled";

export type InboundOrderLine = {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  expectedQuantity: number;
  receivedQuantity: number;
};

export type InboundOrder = {
  id: string;
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  supplierInvoiceReference: string;
  status: InboundOrderStatus;
  notes: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  cancelledAtUtc: string | null;
  lines: InboundOrderLine[];
};

export type ReceiptLine = {
  id: string;
  inboundOrderLineId: string;
  productId: string;
  productSku: string;
  productName: string;
  receivingLocationId: string;
  receivingWarehouseCode: string;
  receivingZoneCode: string;
  receivingLocationCode: string;
  receivingLocationName: string;
  quantity: number;
};

export type Receipt = {
  id: string;
  inboundOrderId: string;
  inboundOrderStatus: InboundOrderStatus;
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  supplierInvoiceReference: string;
  status: ReceiptStatus;
  notes: string | null;
  createdAtUtc: string;
  startedAtUtc: string | null;
  confirmedAtUtc: string | null;
  cancelledAtUtc: string | null;
  lines: ReceiptLine[];
};

export type CreateInboundOrderLinePayload = {
  productId: string;
  expectedQuantity: number;
};

export type InboundOrderPayload = {
  supplierId: string;
  supplierInvoiceReference: string;
  notes: string;
  lines: CreateInboundOrderLinePayload[];
};

export type CreateReceiptLinePayload = {
  inboundOrderLineId: string;
  receivingLocationId: string;
  quantity: number;
};

export type ReceiptPayload = {
  inboundOrderId: string;
  notes: string;
  lines: CreateReceiptLinePayload[];
};

export type InboundWorkflowFormState = {
  error: string | null;
  successMessage: string | null;
};
