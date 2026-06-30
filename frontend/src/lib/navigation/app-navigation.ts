import type { AppRole } from "@/types/auth";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { getMessages, type Messages } from "@/lib/i18n/messages";

export type VisibleProtectedRoutePath =
  | "/dashboard"
  | "/barcode-lookup"
  | "/products"
  | "/customers"
  | "/suppliers"
  | "/warehouse-map"
  | "/warehouse-setup"
  | "/inbound-orders"
  | "/receipts"
  | "/putaway-tasks"
  | "/transfer-tasks"
  | "/replenishment-rules"
  | "/inventory"
  | "/sales-orders"
  | "/picking-tasks"
  | "/shipments"
  | "/replenishment-tasks"
  | "/inventory-counts"
  | "/audit-logs"
  | "/users";

export type ProtectedRoutePath =
  | VisibleProtectedRoutePath
  | "/locations";

export type NavigationSection =
  | "overview"
  | "visibility"
  | "operations"
  | "management";

export type NavigationItem = {
  href?: VisibleProtectedRoutePath;
  label: string;
  summary: string;
  section?: NavigationSection;
  roles: readonly AppRole[];
};

type VisibleNavigationItem = Required<Pick<NavigationItem, "href" | "section">> &
  NavigationItem;

type NavigationCopyKey = keyof Messages["navigation"]["items"];
type HiddenRouteCopyKey = keyof Messages["navigation"]["hidden"];

type NavigationItemDefinition = {
  href: VisibleProtectedRoutePath;
  copyKey: NavigationCopyKey;
  section: NavigationSection;
  roles: readonly AppRole[];
};

type NavigationSectionDefinition = {
  id: NavigationSection;
};

type HiddenRouteDefinition = {
  copyKey: HiddenRouteCopyKey;
  roles: readonly AppRole[];
  matches: (pathname: string) => boolean;
};

const exactProtectedRoutePaths: readonly ProtectedRoutePath[] = [
  "/dashboard",
  "/barcode-lookup",
  "/products",
  "/customers",
  "/suppliers",
  "/warehouse-map",
  "/locations",
  "/warehouse-setup",
  "/inbound-orders",
  "/receipts",
  "/putaway-tasks",
  "/transfer-tasks",
  "/replenishment-rules",
  "/inventory",
  "/sales-orders",
  "/picking-tasks",
  "/shipments",
  "/replenishment-tasks",
  "/inventory-counts",
  "/audit-logs",
  "/users",
];

const protectedPathPrefixes = [
  "/products/",
  "/customers/",
  "/suppliers/",
  "/locations/",
  "/inbound-orders/",
  "/receipts/",
  "/putaway-tasks/",
  "/transfer-tasks/",
  "/replenishment-rules/",
  "/replenishment-tasks/",
  "/sales-orders/",
  "/picking-tasks/",
  "/shipments/",
  "/inventory-counts/",
  "/audit-logs/",
  "/users/",
] as const;

const sectionDefinitions: readonly NavigationSectionDefinition[] = [
  { id: "overview" },
  { id: "visibility" },
  { id: "operations" },
  { id: "management" },
];

const navigationItems: readonly NavigationItemDefinition[] = [
  {
    href: "/dashboard",
    copyKey: "dashboard",
    section: "overview",
    roles: ["Sales", "Warehouse", "Admin"],
  },
  {
    href: "/barcode-lookup",
    copyKey: "barcodeLookup",
    section: "visibility",
    roles: ["Sales", "Warehouse", "Admin"],
  },
  {
    href: "/products",
    copyKey: "products",
    section: "visibility",
    roles: ["Sales", "Warehouse", "Admin"],
  },
  {
    href: "/customers",
    copyKey: "customers",
    section: "management",
    roles: ["Admin"],
  },
  {
    href: "/suppliers",
    copyKey: "suppliers",
    section: "management",
    roles: ["Admin"],
  },
  {
    href: "/warehouse-map",
    copyKey: "warehouseMap",
    section: "visibility",
    roles: ["Warehouse", "Admin"],
  },
  {
    href: "/warehouse-setup",
    copyKey: "warehouseSetup",
    section: "management",
    roles: ["Admin"],
  },
  {
    href: "/inventory",
    copyKey: "inventory",
    section: "visibility",
    roles: ["Sales", "Warehouse", "Admin"],
  },
  {
    href: "/inbound-orders",
    copyKey: "inboundOrders",
    section: "operations",
    roles: ["Admin", "Warehouse"],
  },
  {
    href: "/receipts",
    copyKey: "receipts",
    section: "operations",
    roles: ["Warehouse"],
  },
  {
    href: "/putaway-tasks",
    copyKey: "putawayTasks",
    section: "operations",
    roles: ["Warehouse", "Admin"],
  },
  {
    href: "/transfer-tasks",
    copyKey: "transferTasks",
    section: "operations",
    roles: ["Warehouse", "Admin"],
  },
  {
    href: "/replenishment-rules",
    copyKey: "replenishmentRules",
    section: "management",
    roles: ["Admin"],
  },
  {
    href: "/sales-orders",
    copyKey: "salesOrders",
    section: "operations",
    roles: ["Sales", "Admin", "Warehouse"],
  },
  {
    href: "/picking-tasks",
    copyKey: "pickingTasks",
    section: "operations",
    roles: ["Warehouse", "Admin"],
  },
  {
    href: "/shipments",
    copyKey: "shipments",
    section: "operations",
    roles: ["Warehouse", "Admin"],
  },
  {
    href: "/replenishment-tasks",
    copyKey: "replenishmentTasks",
    section: "operations",
    roles: ["Warehouse", "Admin"],
  },
  {
    href: "/inventory-counts",
    copyKey: "inventoryCounts",
    section: "operations",
    roles: ["Warehouse", "Admin"],
  },
  {
    href: "/audit-logs",
    copyKey: "auditLogs",
    section: "management",
    roles: ["Admin"],
  },
  {
    href: "/users",
    copyKey: "users",
    section: "management",
    roles: ["Admin"],
  },
];

const hiddenRouteDefinitions: readonly HiddenRouteDefinition[] = [
  {
    copyKey: "productDetails",
    roles: ["Sales", "Warehouse", "Admin"],
    matches: (pathname) => pathname.startsWith("/products/"),
  },
  {
    copyKey: "customerDetails",
    roles: ["Admin"],
    matches: (pathname) => pathname.startsWith("/customers/"),
  },
  {
    copyKey: "supplierDetails",
    roles: ["Admin"],
    matches: (pathname) => pathname.startsWith("/suppliers/"),
  },
  {
    copyKey: "inboundOrderDetails",
    roles: ["Admin", "Warehouse"],
    matches: (pathname) => pathname.startsWith("/inbound-orders/"),
  },
  {
    copyKey: "locations",
    roles: ["Warehouse", "Admin"],
    matches: (pathname) => pathname === "/locations",
  },
  {
    copyKey: "locationDetails",
    roles: ["Warehouse", "Admin"],
    matches: (pathname) => pathname.startsWith("/locations/"),
  },
  {
    copyKey: "receiptDetails",
    roles: ["Warehouse"],
    matches: (pathname) => pathname.startsWith("/receipts/"),
  },
  {
    copyKey: "putawayTaskDetails",
    roles: ["Warehouse", "Admin"],
    matches: (pathname) => pathname.startsWith("/putaway-tasks/"),
  },
  {
    copyKey: "transferTaskDetails",
    roles: ["Warehouse", "Admin"],
    matches: (pathname) => pathname.startsWith("/transfer-tasks/"),
  },
  {
    copyKey: "replenishmentRuleDetails",
    roles: ["Admin"],
    matches: (pathname) => pathname.startsWith("/replenishment-rules/"),
  },
  {
    copyKey: "replenishmentTaskDetails",
    roles: ["Warehouse", "Admin"],
    matches: (pathname) => pathname.startsWith("/replenishment-tasks/"),
  },
  {
    copyKey: "salesOrderDetails",
    roles: ["Sales", "Admin", "Warehouse"],
    matches: (pathname) => pathname.startsWith("/sales-orders/"),
  },
  {
    copyKey: "pickingTaskDetails",
    roles: ["Warehouse", "Admin"],
    matches: (pathname) => pathname.startsWith("/picking-tasks/"),
  },
  {
    copyKey: "shipmentDetails",
    roles: ["Warehouse", "Admin"],
    matches: (pathname) => pathname.startsWith("/shipments/"),
  },
  {
    copyKey: "inventoryCountDetails",
    roles: ["Warehouse", "Admin"],
    matches: (pathname) => pathname.startsWith("/inventory-counts/"),
  },
  {
    copyKey: "auditLogDetails",
    roles: ["Admin"],
    matches: (pathname) => pathname.startsWith("/audit-logs/"),
  },
  {
    copyKey: "userDetails",
    roles: ["Admin"],
    matches: (pathname) => pathname.startsWith("/users/"),
  },
  {
    copyKey: "warehouseSetup",
    roles: ["Admin"],
    matches: (pathname) => pathname === "/warehouse-setup",
  },
];

export function getNavigationItem(
  pathname: string,
  locale: Locale = DEFAULT_LOCALE,
) {
  const messages = getMessages(locale);
  const visibleItem = navigationItems.find((item) => item.href === pathname);

  if (visibleItem) {
    return localizeVisibleItem(visibleItem, messages);
  }

  const hiddenItem = hiddenRouteDefinitions.find((item) => item.matches(pathname));

  if (!hiddenItem) {
    return null;
  }

  const copy = messages.navigation.hidden[hiddenItem.copyKey];

  return {
    label: copy.label,
    summary: copy.summary,
    roles: hiddenItem.roles,
  } satisfies NavigationItem;
}

export function getVisibleNavigation(
  roles: readonly string[],
  locale: Locale = DEFAULT_LOCALE,
) {
  const normalizedRoles = new Set(roles.map(normalizeRoleName).filter(Boolean));
  const messages = getMessages(locale);

  return sectionDefinitions
    .map((section) => ({
      id: section.id,
      label: messages.navigation.sections[section.id],
      items: navigationItems
        .filter(
          (item) =>
            item.section === section.id &&
            item.roles.some((role) => normalizedRoles.has(role)),
        )
        .map((item) => localizeVisibleItem(item, messages)),
    }))
    .filter((section) => section.items.length > 0);
}

export function canAccessPath(roles: readonly string[], pathname: string) {
  const item = getNavigationItem(pathname);

  if (!item) {
    return false;
  }

  const normalizedRoles = new Set(roles.map(normalizeRoleName).filter(Boolean));
  return item.roles.some((role) => normalizedRoles.has(role));
}

export function isProtectedPath(pathname: string) {
  return (
    exactProtectedRoutePaths.includes(pathname as ProtectedRoutePath) ||
    protectedPathPrefixes.some((prefix) => pathname.startsWith(prefix))
  );
}

export function formatRoleLabel(
  role: string,
  locale: Locale = DEFAULT_LOCALE,
) {
  const normalized = normalizeRoleName(role);
  const messages = getMessages(locale);

  if (normalized) {
    return messages.roles[normalized];
  }

  return role.trim() || messages.common.unknownRole;
}

export function formatRoleLabels(
  roles: readonly string[],
  locale: Locale = DEFAULT_LOCALE,
) {
  return roles.map((role) => formatRoleLabel(role, locale));
}

function localizeVisibleItem(
  item: NavigationItemDefinition,
  messages: Messages,
): VisibleNavigationItem {
  const copy = messages.navigation.items[item.copyKey];

  return {
    href: item.href,
    label: copy.label,
    summary: copy.summary,
    section: item.section,
    roles: item.roles,
  };
}

function normalizeRoleName(role: string) {
  const value = role.trim().toLowerCase();

  switch (value) {
    case "sales":
      return "Sales" satisfies AppRole;
    case "warehouse":
      return "Warehouse" satisfies AppRole;
    case "admin":
      return "Admin" satisfies AppRole;
    default:
      return null;
  }
}
