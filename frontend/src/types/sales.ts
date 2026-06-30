export type SalesOrderStatus =
  | "Draft"
  | "Confirmed"
  | "PartiallyReserved"
  | "FullyReserved"
  | "Cancelled";

export type SalesOrderReservation = {
  id: string;
  inventoryBalanceId: string;
  locationId: string;
  warehouseCode: string;
  zoneCode: string;
  locationCode: string;
  locationName: string;
  locationType: string;
  locationIsActive: boolean;
  locationIsBlocked: boolean;
  quantity: number;
  pickedQuantity: number;
};

export type SalesOrderLine = {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  orderedQuantity: number;
  reservedQuantity: number;
  pickedQuantity: number;
  reservations: SalesOrderReservation[];
};

export type SalesOrder = {
  id: string;
  customerId: string | null;
  customerCode: string | null;
  customerName: string | null;
  customerIsActive: boolean | null;
  status: SalesOrderStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
  confirmedAtUtc: string | null;
  cancelledAtUtc: string | null;
  lines: SalesOrderLine[];
};

export type SalesOrderPayload = {
  customerId: string;
  lines: Array<{
    productId: string;
    orderedQuantity: number;
  }>;
};

export type SalesOrderFormState = {
  error: string | null;
  successMessage: string | null;
};
