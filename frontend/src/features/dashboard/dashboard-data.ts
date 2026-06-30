import "server-only";

import { listAuditLogs } from "@/lib/api/audit-api";
import { listInboundOrders, listReceipts } from "@/lib/api/inbound-api";
import {
  listInventoryBalances,
  listInventoryByProduct,
} from "@/lib/api/inventory-api";
import { listInventoryCounts } from "@/lib/api/inventory-count-api";
import { listPickingTasks } from "@/lib/api/picking-api";
import { listPutawayTasks } from "@/lib/api/putaway-api";
import { listReplenishmentTasks } from "@/lib/api/replenishment-api";
import { listSalesOrders } from "@/lib/api/sales-api";
import { listShipments } from "@/lib/api/shipment-api";
import { listTransferTasks } from "@/lib/api/transfer-api";
import type { WmsApiResult } from "@/lib/api/wms-api";
import { listLocations } from "@/lib/api/warehouse-structure-api";
import {
  formatExecutionStatusLabel,
  formatInboundOrderStatusLabel,
  formatInventoryCountStatusLabel,
  formatReceiptStatusLabel,
  formatSalesOrderStatusLabel,
} from "@/lib/format/workflow-status";
import { formatLocalizedNumber } from "@/lib/format/locale-format";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import {
  formatRoleLabels,
  getVisibleNavigation,
} from "@/lib/navigation/app-navigation";
import type { AuditLog } from "@/types/audit";
import type {
  DashboardData,
  DashboardMetric,
  DashboardQuickLinkGroup,
  DashboardRecentActivityItem,
  DashboardSection,
  DashboardStatusGroup,
  DashboardStatusItem,
} from "@/types/dashboard";
import type {
  InboundOrder,
  InboundOrderStatus,
  Receipt,
  ReceiptStatus,
} from "@/types/inbound";
import type { InventoryBalance, InventoryByProduct } from "@/types/inventory";
import type {
  InventoryCount,
  InventoryCountStatus,
} from "@/types/inventory-count";
import type { PickingTask, PickingTaskStatus } from "@/types/picking";
import type { PutawayTask, PutawayTaskStatus } from "@/types/putaway";
import type {
  ReplenishmentTask,
  ReplenishmentTaskStatus,
} from "@/types/replenishment";
import type { SalesOrder, SalesOrderStatus } from "@/types/sales";
import type { Shipment, ShipmentStatus } from "@/types/shipment";
import type { TransferTask, TransferTaskStatus } from "@/types/transfer";
import type { Location } from "@/types/warehouse-structure";

type OptionalApiResult<T> = WmsApiResult<T> | null;

type ResolvedResult<T> = {
  data: T | null;
  error: string | null;
};

const inboundOrderStatusOrder: readonly InboundOrderStatus[] = [
  "Draft",
  "ReadyForReceipt",
  "PartiallyReceived",
  "FullyReceived",
  "Cancelled",
];

const receiptStatusOrder: readonly ReceiptStatus[] = [
  "Draft",
  "InProgress",
  "Confirmed",
  "Cancelled",
];

const taskStatusOrder: readonly PutawayTaskStatus[] = [
  "Pending",
  "InProgress",
  "Completed",
  "Cancelled",
];

const salesOrderStatusOrder: readonly SalesOrderStatus[] = [
  "Draft",
  "Confirmed",
  "PartiallyReserved",
  "FullyReserved",
  "Cancelled",
];

const inventoryCountStatusOrder: readonly InventoryCountStatus[] = [
  "Draft",
  "InProgress",
  "Completed",
  "Cancelled",
];

export async function loadDashboardData(
  currentRoles: readonly string[],
  locale: Locale,
): Promise<DashboardData> {
  const normalizedRoles = new Set(
    currentRoles.map((role) => role.trim().toLowerCase()),
  );
  const messages = getMessages(locale);
  const canAdmin = normalizedRoles.has("admin");
  const canWarehouse = normalizedRoles.has("warehouse");
  const canViewDetailedInventory = canAdmin || canWarehouse;
  const canViewInboundOrders = canAdmin || canWarehouse;
  const canViewReceipts = canWarehouse;
  const canViewOperationalTasks = canAdmin || canWarehouse;
  const canViewAudit = canAdmin;

  const [
    inventoryByProductResult,
    inventoryBalancesResult,
    locationsResult,
    inboundOrdersResult,
    receiptsResult,
    putawayTasksResult,
    transferTasksResult,
    replenishmentTasksResult,
    salesOrdersResult,
    pickingTasksResult,
    shipmentsResult,
    inventoryCountsResult,
    auditLogsResult,
  ] = await Promise.all([
    listInventoryByProduct(),
    maybeRequest(canViewDetailedInventory, listInventoryBalances),
    maybeRequest(canViewDetailedInventory, listLocations),
    maybeRequest(canViewInboundOrders, listInboundOrders),
    maybeRequest(canViewReceipts, listReceipts),
    maybeRequest(canViewOperationalTasks, listPutawayTasks),
    maybeRequest(canViewOperationalTasks, listTransferTasks),
    maybeRequest(canViewOperationalTasks, listReplenishmentTasks),
    listSalesOrders(),
    maybeRequest(canViewOperationalTasks, listPickingTasks),
    maybeRequest(canViewOperationalTasks, listShipments),
    maybeRequest(canViewOperationalTasks, listInventoryCounts),
    maybeRequest(canViewAudit, listAuditLogs),
  ]);

  const inventoryByProduct = resolveResult(
    inventoryByProductResult,
    messages.dashboard.dataLabels.productInventory,
    messages,
  );
  const inventoryBalances = resolveResult(
    inventoryBalancesResult,
    messages.dashboard.dataLabels.rawInventoryBalances,
    messages,
  );
  const locations = resolveResult(
    locationsResult,
    messages.dashboard.dataLabels.warehouseLocations,
    messages,
  );
  const inboundOrders = resolveResult(
    inboundOrdersResult,
    messages.dashboard.dataLabels.inboundOrders,
    messages,
  );
  const receipts = resolveResult(
    receiptsResult,
    messages.dashboard.dataLabels.receipts,
    messages,
  );
  const putawayTasks = resolveResult(
    putawayTasksResult,
    messages.dashboard.dataLabels.putawayTasks,
    messages,
  );
  const transferTasks = resolveResult(
    transferTasksResult,
    messages.dashboard.dataLabels.transferTasks,
    messages,
  );
  const replenishmentTasks = resolveResult(
    replenishmentTasksResult,
    messages.dashboard.dataLabels.replenishmentTasks,
    messages,
  );
  const salesOrders = resolveResult(
    salesOrdersResult,
    messages.dashboard.dataLabels.salesOrders,
    messages,
  );
  const pickingTasks = resolveResult(
    pickingTasksResult,
    messages.dashboard.dataLabels.pickingTasks,
    messages,
  );
  const shipments = resolveResult(
    shipmentsResult,
    messages.dashboard.dataLabels.shipments,
    messages,
  );
  const inventoryCounts = resolveResult(
    inventoryCountsResult,
    messages.dashboard.dataLabels.inventoryCounts,
    messages,
  );
  const auditLogs = resolveResult(
    auditLogsResult,
    messages.dashboard.dataLabels.auditLog,
    messages,
  );

  const sections: DashboardSection[] = [
    buildInventorySection({
      locale,
      messages,
      canViewDetailedInventory,
      inventoryByProduct: inventoryByProduct.data,
      inventoryByProductError: inventoryByProduct.error,
      inventoryBalances: inventoryBalances.data,
      inventoryBalancesError: inventoryBalances.error,
      locations: locations.data,
      locationsError: locations.error,
    }),
  ];

  if (canViewInboundOrders || canViewReceipts) {
    sections.push(
      buildInboundSection({
        locale,
        messages,
        inboundOrders: inboundOrders.data,
        inboundOrdersError: inboundOrders.error,
        receipts: receipts.data,
        receiptsError: receipts.error,
        canViewReceipts,
      }),
    );
  }

  if (canViewOperationalTasks) {
    sections.push(
      buildInternalOperationsSection({
        locale,
        messages,
        putawayTasks: putawayTasks.data,
        putawayTasksError: putawayTasks.error,
        transferTasks: transferTasks.data,
        transferTasksError: transferTasks.error,
        replenishmentTasks: replenishmentTasks.data,
        replenishmentTasksError: replenishmentTasks.error,
        inventoryCounts: inventoryCounts.data,
        inventoryCountsError: inventoryCounts.error,
      }),
    );
  }

  sections.push(
    buildOutboundSection({
      locale,
      messages,
      canViewOperationalTasks,
      salesOrders: salesOrders.data,
      salesOrdersError: salesOrders.error,
      pickingTasks: pickingTasks.data,
      pickingTasksError: pickingTasks.error,
      shipments: shipments.data,
      shipmentsError: shipments.error,
    }),
  );

  return {
    currentRoles: formatRoleLabels(currentRoles, locale),
    highlights: buildHighlights({
      locale,
      messages,
      canViewDetailedInventory,
      inventoryByProduct: inventoryByProduct.data,
      inventoryBalances: inventoryBalances.data,
      locations: locations.data,
      inboundOrders: inboundOrders.data,
      receipts: receipts.data,
      putawayTasks: putawayTasks.data,
      transferTasks: transferTasks.data,
      replenishmentTasks: replenishmentTasks.data,
      salesOrders: salesOrders.data,
      pickingTasks: pickingTasks.data,
      shipments: shipments.data,
      inventoryCounts: inventoryCounts.data,
    }),
    quickLinkGroups: buildQuickLinkGroups(currentRoles, locale),
    showRecentActivity: canViewAudit,
    recentActivity: buildRecentActivity(auditLogs.data, messages),
    recentActivityNote: auditLogs.error,
    sections,
  };
}

function buildInventorySection({
  locale,
  messages,
  canViewDetailedInventory,
  inventoryByProduct,
  inventoryByProductError,
  inventoryBalances,
  inventoryBalancesError,
  locations,
  locationsError,
}: {
  locale: Locale;
  messages: Messages;
  canViewDetailedInventory: boolean;
  inventoryByProduct: readonly InventoryByProduct[] | null;
  inventoryByProductError: string | null;
  inventoryBalances: readonly InventoryBalance[] | null;
  inventoryBalancesError: string | null;
  locations: readonly Location[] | null;
  locationsError: string | null;
}): DashboardSection {
  const metrics: DashboardMetric[] = [];

  if (canViewDetailedInventory) {
    if (inventoryBalances) {
      metrics.push({
        label: messages.dashboard.metrics.balanceRows.label,
        value: formatCount(inventoryBalances.length, locale),
        helper: messages.dashboard.metrics.balanceRows.helper,
        tone: "accent",
      });
    }

    if (inventoryBalances && locations) {
      const occupiedLocationIds = new Set(
        inventoryBalances
          .filter((balance) => balance.onHandQuantity > 0)
          .map((balance) => balance.locationId),
      );
      const emptyLocationCount = Math.max(
        locations.length - occupiedLocationIds.size,
        0,
      );

      metrics.push({
        label: messages.dashboard.metrics.occupiedLocations.label,
        value: formatCount(occupiedLocationIds.size, locale),
        helper: messages.dashboard.metrics.occupiedLocations.helper,
        tone: occupiedLocationIds.size > 0 ? "success" : "muted",
      });
      metrics.push({
        label: messages.dashboard.metrics.emptyLocations.label,
        value: formatCount(emptyLocationCount, locale),
        helper: messages.dashboard.metrics.emptyLocations.helper,
        tone: emptyLocationCount > 0 ? "default" : "muted",
      });
    }

    if (locations) {
      const attentionCount = countMatching(
        locations,
        (location) => !location.isActive || location.isBlocked,
      );

      metrics.push({
        label: messages.dashboard.metrics.attentionLocations.label,
        value: formatCount(attentionCount, locale),
        helper: messages.dashboard.metrics.attentionLocations.helper,
        tone: attentionCount > 0 ? "warning" : "success",
      });
    }

    return {
      id: "inventory",
      eyebrow: messages.dashboard.section.inventory.eyebrow,
      title: messages.dashboard.section.inventory.title,
      description: messages.dashboard.section.inventory.description,
      metrics,
      statusGroups: [],
      note: joinNotes([inventoryBalancesError, locationsError]),
    };
  }

  if (inventoryByProduct) {
    const availableProducts = countMatching(
      inventoryByProduct,
      (row) => row.availableQuantity > 0,
    );
    const unavailableProducts = countMatching(
      inventoryByProduct,
      (row) => row.availableQuantity <= 0,
    );
    const pressureProducts = countMatching(
      inventoryByProduct,
      (row) => row.reservedQuantity > 0 || row.pickedQuantity > 0,
    );

    metrics.push(
      {
        label: messages.dashboard.metrics.visibleProducts.label,
        value: formatCount(inventoryByProduct.length, locale),
        helper: messages.dashboard.metrics.visibleProducts.helper,
        tone: "accent",
      },
      {
        label: messages.dashboard.metrics.availableNow.label,
        value: formatCount(availableProducts, locale),
        helper: messages.dashboard.metrics.availableNow.helper,
        tone: availableProducts > 0 ? "success" : "muted",
      },
      {
        label: messages.dashboard.metrics.unavailable.label,
        value: formatCount(unavailableProducts, locale),
        helper: messages.dashboard.metrics.unavailable.helper,
        tone: unavailableProducts > 0 ? "warning" : "success",
      },
      {
        label: messages.dashboard.metrics.demandPressure.label,
        value: formatCount(pressureProducts, locale),
        helper: messages.dashboard.metrics.demandPressure.helper,
        tone: pressureProducts > 0 ? "warning" : "muted",
      },
    );
  }

  return {
    id: "inventory",
    eyebrow: messages.dashboard.section.inventory.eyebrow,
    title: messages.dashboard.section.inventorySales.title,
    description: messages.dashboard.section.inventorySales.description,
    metrics,
    statusGroups: [],
    note: inventoryByProductError,
  };
}

function buildInboundSection({
  locale,
  messages,
  inboundOrders,
  inboundOrdersError,
  receipts,
  receiptsError,
  canViewReceipts,
}: {
  locale: Locale;
  messages: Messages;
  inboundOrders: readonly InboundOrder[] | null;
  inboundOrdersError: string | null;
  receipts: readonly Receipt[] | null;
  receiptsError: string | null;
  canViewReceipts: boolean;
}): DashboardSection {
  const metrics: DashboardMetric[] = [];
  const statusGroups: DashboardStatusGroup[] = [];

  if (inboundOrders) {
    const awaitingReceiptAttention = countMatching(
      inboundOrders,
      (order) =>
        order.status === "ReadyForReceipt" ||
        order.status === "PartiallyReceived",
    );

    metrics.push(
      {
        label: messages.dashboard.metrics.inboundOrders.label,
        value: formatCount(inboundOrders.length, locale),
        helper: messages.dashboard.metrics.inboundOrders.helper,
        tone: "accent",
      },
      {
        label: messages.dashboard.metrics.awaitingReceipt.label,
        value: formatCount(awaitingReceiptAttention, locale),
        helper: messages.dashboard.metrics.awaitingReceipt.helper,
        tone: awaitingReceiptAttention > 0 ? "warning" : "success",
      },
    );

    if (!canViewReceipts) {
      metrics.push({
        label: messages.dashboard.metrics.fullyReceived.label,
        value: formatCount(
          countMatching(
            inboundOrders,
            (order) => order.status === "FullyReceived",
          ),
          locale,
        ),
        helper: messages.dashboard.metrics.fullyReceived.helper,
        tone: "success",
      });
    }

    statusGroups.push({
      title: messages.dashboard.statusGroups.inboundOrders.title,
      summary: messages.dashboard.statusGroups.inboundOrders.summary,
      href: "/inbound-orders",
      items: buildStatusItems(
        inboundOrders.map((order) => order.status),
        inboundOrderStatusOrder,
        (status) => formatInboundOrderStatusLabel(status, locale),
      ),
    });
  }

  if (receipts) {
    const openReceipts = countMatching(
      receipts,
      (receipt) =>
        receipt.status === "Draft" || receipt.status === "InProgress",
    );

    metrics.push(
      {
        label: messages.dashboard.metrics.openReceipts.label,
        value: formatCount(openReceipts, locale),
        helper: messages.dashboard.metrics.openReceipts.helper,
        tone: openReceipts > 0 ? "warning" : "success",
      },
      {
        label: messages.dashboard.metrics.receiptsInProgress.label,
        value: formatCount(
          countMatching(receipts, (receipt) => receipt.status === "InProgress"),
          locale,
        ),
        helper: messages.dashboard.metrics.receiptsInProgress.helper,
        tone: "accent",
      },
    );

    statusGroups.push({
      title: messages.dashboard.statusGroups.receipts.title,
      summary: messages.dashboard.statusGroups.receipts.summary,
      href: "/receipts",
      items: buildStatusItems(
        receipts.map((receipt) => receipt.status),
        receiptStatusOrder,
        (status) => formatReceiptStatusLabel(status, locale),
      ),
    });
  }

  return {
    id: "inbound",
    eyebrow: messages.dashboard.section.inbound.eyebrow,
    title: messages.dashboard.section.inbound.title,
    description: messages.dashboard.section.inbound.description,
    metrics,
    statusGroups,
    note: joinNotes([inboundOrdersError, receiptsError]),
  };
}

function buildInternalOperationsSection({
  locale,
  messages,
  putawayTasks,
  putawayTasksError,
  transferTasks,
  transferTasksError,
  replenishmentTasks,
  replenishmentTasksError,
  inventoryCounts,
  inventoryCountsError,
}: {
  locale: Locale;
  messages: Messages;
  putawayTasks: readonly PutawayTask[] | null;
  putawayTasksError: string | null;
  transferTasks: readonly TransferTask[] | null;
  transferTasksError: string | null;
  replenishmentTasks: readonly ReplenishmentTask[] | null;
  replenishmentTasksError: string | null;
  inventoryCounts: readonly InventoryCount[] | null;
  inventoryCountsError: string | null;
}): DashboardSection {
  const metrics: DashboardMetric[] = [];
  const statusGroups: DashboardStatusGroup[] = [];

  const openWork =
    countOpenPendingTasks(putawayTasks) +
    countOpenPendingTasks(transferTasks) +
    countOpenPendingTasks(replenishmentTasks) +
    countOpenInventoryCounts(inventoryCounts);
  const inProgressWork =
    countInProgressTasks(putawayTasks) +
    countInProgressTasks(transferTasks) +
    countInProgressTasks(replenishmentTasks) +
    countMatching(inventoryCounts ?? [], (count) => count.status === "InProgress");
  const completedWork =
    countCompletedTasks(putawayTasks) +
    countCompletedTasks(transferTasks) +
    countCompletedTasks(replenishmentTasks) +
    countMatching(inventoryCounts ?? [], (count) => count.status === "Completed");
  const cancelledWork =
    countCancelledTasks(putawayTasks) +
    countCancelledTasks(transferTasks) +
    countCancelledTasks(replenishmentTasks) +
    countMatching(inventoryCounts ?? [], (count) => count.status === "Cancelled");

  metrics.push(
    {
      label: messages.dashboard.metrics.openWork.label,
      value: formatCount(openWork, locale),
      helper: messages.dashboard.metrics.openWork.helper,
      tone: openWork > 0 ? "warning" : "success",
    },
    {
      label: messages.dashboard.metrics.inProgress.label,
      value: formatCount(inProgressWork, locale),
      helper: messages.dashboard.metrics.inProgress.helper,
      tone: inProgressWork > 0 ? "accent" : "muted",
    },
    {
      label: messages.dashboard.metrics.completed.label,
      value: formatCount(completedWork, locale),
      helper: messages.dashboard.metrics.completed.helper,
      tone: "success",
    },
    {
      label: messages.dashboard.metrics.cancelled.label,
      value: formatCount(cancelledWork, locale),
      helper: messages.dashboard.metrics.cancelled.helper,
      tone: cancelledWork > 0 ? "danger" : "muted",
    },
  );

  if (putawayTasks) {
    statusGroups.push({
      title: messages.dashboard.statusGroups.putawayTasks.title,
      summary: messages.dashboard.statusGroups.putawayTasks.summary,
      href: "/putaway-tasks",
      items: buildStatusItems(
        putawayTasks.map((task) => task.status),
        taskStatusOrder,
        (status) => formatExecutionStatusLabel(status, locale),
      ),
    });
  }

  if (transferTasks) {
    statusGroups.push({
      title: messages.dashboard.statusGroups.transferTasks.title,
      summary: messages.dashboard.statusGroups.transferTasks.summary,
      href: "/transfer-tasks",
      items: buildStatusItems(
        transferTasks.map((task) => task.status),
        taskStatusOrder as readonly TransferTaskStatus[],
        (status) => formatExecutionStatusLabel(status, locale),
      ),
    });
  }

  if (replenishmentTasks) {
    statusGroups.push({
      title: messages.dashboard.statusGroups.replenishmentTasks.title,
      summary: messages.dashboard.statusGroups.replenishmentTasks.summary,
      href: "/replenishment-tasks",
      items: buildStatusItems(
        replenishmentTasks.map((task) => task.status),
        taskStatusOrder as readonly ReplenishmentTaskStatus[],
        (status) => formatExecutionStatusLabel(status, locale),
      ),
    });
  }

  if (inventoryCounts) {
    statusGroups.push({
      title: messages.dashboard.statusGroups.inventoryCounts.title,
      summary: messages.dashboard.statusGroups.inventoryCounts.summary,
      href: "/inventory-counts",
      items: buildStatusItems(
        inventoryCounts.map((count) => count.status),
        inventoryCountStatusOrder,
        (status) => formatInventoryCountStatusLabel(status, locale),
      ),
    });
  }

  return {
    id: "internal",
    eyebrow: messages.dashboard.section.internal.eyebrow,
    title: messages.dashboard.section.internal.title,
    description: messages.dashboard.section.internal.description,
    metrics,
    statusGroups,
    note: joinNotes([
      putawayTasksError,
      transferTasksError,
      replenishmentTasksError,
      inventoryCountsError,
    ]),
  };
}

function buildOutboundSection({
  locale,
  messages,
  canViewOperationalTasks,
  salesOrders,
  salesOrdersError,
  pickingTasks,
  pickingTasksError,
  shipments,
  shipmentsError,
}: {
  locale: Locale;
  messages: Messages;
  canViewOperationalTasks: boolean;
  salesOrders: readonly SalesOrder[] | null;
  salesOrdersError: string | null;
  pickingTasks: readonly PickingTask[] | null;
  pickingTasksError: string | null;
  shipments: readonly Shipment[] | null;
  shipmentsError: string | null;
}): DashboardSection {
  const metrics: DashboardMetric[] = [];
  const statusGroups: DashboardStatusGroup[] = [];

  if (salesOrders) {
    metrics.push(
      {
        label: messages.dashboard.metrics.activeSalesOrders.label,
        value: formatCount(
          countMatching(salesOrders, (order) => order.status !== "Cancelled"),
          locale,
        ),
        helper: messages.dashboard.metrics.activeSalesOrders.helper,
        tone: "accent",
      },
      {
        label: messages.dashboard.metrics.fullyReserved.label,
        value: formatCount(
          countMatching(salesOrders, (order) => order.status === "FullyReserved"),
          locale,
        ),
        helper: messages.dashboard.metrics.fullyReserved.helper,
        tone: "success",
      },
    );

    if (!canViewOperationalTasks) {
      metrics.push(
        {
          label: messages.dashboard.metrics.awaitingCompletion.label,
          value: formatCount(
            countMatching(
              salesOrders,
              (order) =>
                order.status === "Draft" ||
                order.status === "Confirmed" ||
                order.status === "PartiallyReserved",
            ),
            locale,
          ),
          helper: messages.dashboard.metrics.awaitingCompletion.helper,
          tone: "warning",
        },
        {
          label: messages.dashboard.metrics.cancelled.label,
          value: formatCount(
            countMatching(salesOrders, (order) => order.status === "Cancelled"),
            locale,
          ),
          helper: messages.dashboard.metrics.cancelled.helper,
          tone: "muted",
        },
      );
    }

    statusGroups.push({
      title: messages.dashboard.statusGroups.salesOrders.title,
      summary: messages.dashboard.statusGroups.salesOrders.summary,
      href: "/sales-orders",
      items: buildStatusItems(
        salesOrders.map((order) => order.status),
        salesOrderStatusOrder,
        (status) => formatSalesOrderStatusLabel(status, locale),
      ),
    });
  }

  if (pickingTasks) {
    metrics.push({
      label: messages.dashboard.metrics.openPickingTasks.label,
      value: formatCount(countOpenPendingTasks(pickingTasks), locale),
      helper: messages.dashboard.metrics.openPickingTasks.helper,
      tone: countOpenPendingTasks(pickingTasks) > 0 ? "warning" : "success",
    });

    statusGroups.push({
      title: messages.dashboard.statusGroups.pickingTasks.title,
      summary: messages.dashboard.statusGroups.pickingTasks.summary,
      href: "/picking-tasks",
      items: buildStatusItems(
        pickingTasks.map((task) => task.status),
        taskStatusOrder as readonly PickingTaskStatus[],
        (status) => formatExecutionStatusLabel(status, locale),
      ),
    });
  }

  if (shipments) {
    metrics.push({
      label: messages.dashboard.metrics.openShipments.label,
      value: formatCount(countOpenPendingTasks(shipments), locale),
      helper: messages.dashboard.metrics.openShipments.helper,
      tone: countOpenPendingTasks(shipments) > 0 ? "warning" : "success",
    });

    statusGroups.push({
      title: messages.dashboard.statusGroups.shipments.title,
      summary: messages.dashboard.statusGroups.shipments.summary,
      href: "/shipments",
      items: buildStatusItems(
        shipments.map((shipment) => shipment.status),
        taskStatusOrder as readonly ShipmentStatus[],
        (status) => formatExecutionStatusLabel(status, locale),
      ),
    });
  }

  return {
    id: "outbound",
    eyebrow: messages.dashboard.section.outbound.eyebrow,
    title: messages.dashboard.section.outbound.title,
    description: messages.dashboard.section.outbound.description,
    metrics,
    statusGroups,
    note: joinNotes([salesOrdersError, pickingTasksError, shipmentsError]),
  };
}

function buildHighlights({
  locale,
  messages,
  canViewDetailedInventory,
  inventoryByProduct,
  inventoryBalances,
  locations,
  inboundOrders,
  receipts,
  putawayTasks,
  transferTasks,
  replenishmentTasks,
  salesOrders,
  pickingTasks,
  shipments,
  inventoryCounts,
}: {
  locale: Locale;
  messages: Messages;
  canViewDetailedInventory: boolean;
  inventoryByProduct: readonly InventoryByProduct[] | null;
  inventoryBalances: readonly InventoryBalance[] | null;
  locations: readonly Location[] | null;
  inboundOrders: readonly InboundOrder[] | null;
  receipts: readonly Receipt[] | null;
  putawayTasks: readonly PutawayTask[] | null;
  transferTasks: readonly TransferTask[] | null;
  replenishmentTasks: readonly ReplenishmentTask[] | null;
  salesOrders: readonly SalesOrder[] | null;
  pickingTasks: readonly PickingTask[] | null;
  shipments: readonly Shipment[] | null;
  inventoryCounts: readonly InventoryCount[] | null;
}): readonly DashboardMetric[] {
  const metrics: DashboardMetric[] = [];

  if (canViewDetailedInventory && inventoryBalances && locations) {
    const occupiedLocationIds = new Set(
      inventoryBalances
        .filter((balance) => balance.onHandQuantity > 0)
        .map((balance) => balance.locationId),
    );

    metrics.push({
      label: messages.dashboard.metrics.occupiedLocations.label,
      value: formatCount(occupiedLocationIds.size, locale),
      helper: messages.dashboard.metrics.occupiedLocations.highlightHelper,
      tone: occupiedLocationIds.size > 0 ? "success" : "muted",
    });
  } else if (inventoryByProduct) {
    const availableProducts = countMatching(
      inventoryByProduct,
      (row) => row.availableQuantity > 0,
    );
    const pressureProducts = countMatching(
      inventoryByProduct,
      (row) => row.reservedQuantity > 0 || row.pickedQuantity > 0,
    );

    metrics.push(
      {
        label: messages.dashboard.metrics.availableProducts.label,
        value: formatCount(availableProducts, locale),
        helper: messages.dashboard.metrics.availableProducts.helper,
        tone: availableProducts > 0 ? "success" : "muted",
      },
      {
        label: messages.dashboard.metrics.demandPressure.label,
        value: formatCount(pressureProducts, locale),
        helper: messages.dashboard.metrics.demandPressure.highlightHelper,
        tone: pressureProducts > 0 ? "warning" : "muted",
      },
    );
  }

  const inboundAttention =
    countMatching(
      inboundOrders ?? [],
      (order) =>
        order.status === "ReadyForReceipt" ||
        order.status === "PartiallyReceived",
    ) +
    countMatching(
      receipts ?? [],
      (receipt) =>
        receipt.status === "Draft" || receipt.status === "InProgress",
    );

  if (inboundAttention > 0 || inboundOrders || receipts) {
    metrics.push({
      label: messages.dashboard.metrics.inboundAttention.label,
      value: formatCount(inboundAttention, locale),
      helper: messages.dashboard.metrics.inboundAttention.helper,
      tone: inboundAttention > 0 ? "warning" : "success",
    });
  }

  const warehouseWorkOpen =
    countOpenPendingTasks(putawayTasks) +
    countOpenPendingTasks(transferTasks) +
    countOpenPendingTasks(replenishmentTasks) +
    countOpenInventoryCounts(inventoryCounts);

  if (
    warehouseWorkOpen > 0 ||
    putawayTasks ||
    transferTasks ||
    replenishmentTasks ||
    inventoryCounts
  ) {
    metrics.push({
      label: messages.dashboard.metrics.warehouseWorkOpen.label,
      value: formatCount(warehouseWorkOpen, locale),
      helper: messages.dashboard.metrics.warehouseWorkOpen.helper,
      tone: warehouseWorkOpen > 0 ? "warning" : "success",
    });
  }

  if (salesOrders) {
    metrics.push({
      label: messages.dashboard.metrics.activeSalesOrders.label,
      value: formatCount(
        countMatching(salesOrders, (order) => order.status !== "Cancelled"),
        locale,
      ),
      helper: messages.dashboard.metrics.activeSalesOrders.highlightHelper,
      tone: "accent",
    });
  }

  const outboundWorkOpen =
    countOpenPendingTasks(pickingTasks) + countOpenPendingTasks(shipments);

  if (outboundWorkOpen > 0 || pickingTasks || shipments) {
    metrics.push({
      label: messages.dashboard.metrics.outboundWorkOpen.label,
      value: formatCount(outboundWorkOpen, locale),
      helper: messages.dashboard.metrics.outboundWorkOpen.helper,
      tone: outboundWorkOpen > 0 ? "warning" : "success",
    });
  }

  return metrics;
}

function buildQuickLinkGroups(
  currentRoles: readonly string[],
  locale: Locale,
): readonly DashboardQuickLinkGroup[] {
  return getVisibleNavigation(currentRoles, locale)
    .map((group) => ({
      id: group.id,
      label: group.label,
      items: group.items
        .filter((item) => item.href !== "/dashboard")
        .map((item) => ({
          href: item.href,
          label: item.label,
          summary: item.summary,
        })),
    }))
    .filter((group) => group.items.length > 0);
}

function buildRecentActivity(
  auditLogs: readonly AuditLog[] | null,
  messages: Messages,
): readonly DashboardRecentActivityItem[] {
  if (!auditLogs) {
    return [];
  }

  return auditLogs.slice(0, 5).map((entry) => ({
    id: entry.id,
    performedAtUtc: entry.performedAtUtc,
    actorLabel: formatActorLabel(entry, messages),
    actionLabel: humanizeLabel(entry.actionType),
    entityLabel: `${humanizeLabel(entry.entityType)} ${shortenId(entry.entityId)}`,
    summary: entry.summary,
    href: `/audit-logs/${entry.id}`,
  }));
}

function maybeRequest<T>(
  enabled: boolean,
  request: () => Promise<WmsApiResult<T>>,
): Promise<OptionalApiResult<T>> {
  return enabled ? request() : Promise.resolve(null);
}

function resolveResult<T>(
  result: OptionalApiResult<T>,
  label: string,
  messages: Messages,
): ResolvedResult<T> {
  if (!result) {
    return { data: null, error: null };
  }

  if (result.ok) {
    return { data: result.data, error: null };
  }

  return {
    data: null,
    error: `${messages.dashboard.dataLabels.loadFailedTemplate.replace(
      "{label}",
      label,
    )}${result.message ? `: ${result.message}` : "."}`,
  };
}

function joinNotes(notes: readonly (string | null)[]) {
  const filtered = notes.filter((note): note is string => Boolean(note));
  return filtered.length > 0 ? filtered.join(" ") : null;
}

function buildStatusItems<T extends string>(
  values: readonly T[],
  order: readonly T[],
  formatter: (status: T) => string,
): readonly DashboardStatusItem[] {
  const counts = new Map<T, number>(order.map((status) => [status, 0]));

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return order.map((status) => ({
    label: formatter(status),
    count: counts.get(status) ?? 0,
    tone: toneForStatus(status),
  }));
}

function countMatching<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
) {
  let total = 0;

  for (const item of items) {
    if (predicate(item)) {
      total += 1;
    }
  }

  return total;
}

function countOpenPendingTasks<
  T extends {
    status:
      | PutawayTaskStatus
      | TransferTaskStatus
      | ReplenishmentTaskStatus
      | PickingTaskStatus
      | ShipmentStatus;
  },
>(items: readonly T[] | null) {
  return countMatching(
    items ?? [],
    (item) => item.status === "Pending" || item.status === "InProgress",
  );
}

function countInProgressTasks<
  T extends {
    status: PutawayTaskStatus | TransferTaskStatus | ReplenishmentTaskStatus;
  },
>(items: readonly T[] | null) {
  return countMatching(items ?? [], (item) => item.status === "InProgress");
}

function countCompletedTasks<
  T extends {
    status: PutawayTaskStatus | TransferTaskStatus | ReplenishmentTaskStatus;
  },
>(items: readonly T[] | null) {
  return countMatching(items ?? [], (item) => item.status === "Completed");
}

function countCancelledTasks<
  T extends {
    status: PutawayTaskStatus | TransferTaskStatus | ReplenishmentTaskStatus;
  },
>(items: readonly T[] | null) {
  return countMatching(items ?? [], (item) => item.status === "Cancelled");
}

function countOpenInventoryCounts(items: readonly InventoryCount[] | null) {
  return countMatching(
    items ?? [],
    (item) => item.status === "Draft" || item.status === "InProgress",
  );
}

function toneForStatus(status: string) {
  if (status === "Cancelled") {
    return "danger" satisfies DashboardStatusItem["tone"];
  }

  if (
    status === "Completed" ||
    status === "Confirmed" ||
    status === "FullyReceived" ||
    status === "FullyReserved"
  ) {
    return "success" satisfies DashboardStatusItem["tone"];
  }

  if (status === "InProgress") {
    return "accent" satisfies DashboardStatusItem["tone"];
  }

  if (
    status === "Pending" ||
    status === "ReadyForReceipt" ||
    status === "PartiallyReceived" ||
    status === "PartiallyReserved"
  ) {
    return "warning" satisfies DashboardStatusItem["tone"];
  }

  if (status === "Draft") {
    return "muted" satisfies DashboardStatusItem["tone"];
  }

  return "default" satisfies DashboardStatusItem["tone"];
}

function formatActorLabel(entry: AuditLog, messages: Messages) {
  if (entry.actorUserName && entry.actorRolesSummary) {
    return `${entry.actorUserName} (${entry.actorRolesSummary})`;
  }

  if (entry.actorUserName) {
    return entry.actorUserName;
  }

  if (entry.actorRolesSummary) {
    return entry.actorRolesSummary;
  }

  return messages.dashboard.audit.unknownActor;
}

function humanizeLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
}

function shortenId(value: string) {
  return value.length > 8 ? value.slice(0, 8) : value;
}

function formatCount(value: number, locale: Locale) {
  return formatLocalizedNumber(value, locale);
}
