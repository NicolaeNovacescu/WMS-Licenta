import type { InboundOrderStatus, ReceiptStatus } from "@/types/inbound";
import type { InventoryCountStatus } from "@/types/inventory-count";
import type { SalesOrderStatus } from "@/types/sales";
import { getMessages } from "@/lib/i18n/messages";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";

type ExecutionStatus = "Pending" | "InProgress" | "Completed" | "Cancelled";

export function formatInboundOrderStatusLabel(
  status: InboundOrderStatus,
  locale: Locale = DEFAULT_LOCALE,
) {
  return getMessages(locale).workflowStatus.inboundOrder[status];
}

export function formatReceiptStatusLabel(
  status: ReceiptStatus,
  locale: Locale = DEFAULT_LOCALE,
) {
  return getMessages(locale).workflowStatus.receipt[status];
}

export function formatSalesOrderStatusLabel(
  status: SalesOrderStatus,
  locale: Locale = DEFAULT_LOCALE,
) {
  return getMessages(locale).workflowStatus.salesOrder[status];
}

export function formatInventoryCountStatusLabel(
  status: InventoryCountStatus,
  locale: Locale = DEFAULT_LOCALE,
) {
  return getMessages(locale).workflowStatus.inventoryCount[status];
}

export function formatExecutionStatusLabel(
  status: ExecutionStatus,
  locale: Locale = DEFAULT_LOCALE,
) {
  return getMessages(locale).workflowStatus.execution[status];
}
