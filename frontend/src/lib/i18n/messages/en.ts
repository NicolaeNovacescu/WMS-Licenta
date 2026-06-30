export const en = {
  common: {
    appName: "WMS Licenta",
    unknownRole: "Unknown",
    openPage: "Open page",
    working: "Working...",
    yes: "Yes",
    no: "No",
    backendUnavailable: "Backend unavailable",
    notes: "Notes",
    quantity: "Quantity",
    performed: "Performed",
    performedBy: "Performed by",
    reference: "Reference",
    source: "Source",
    destination: "Destination",
    notRecorded: "Not recorded",
    notLinked: "Not linked",
    states: {
      active: "Active",
      inactive: "Inactive",
      blocked: "Blocked",
      unblocked: "Unblocked",
      occupied: "Occupied",
      empty: "Empty",
      selectable: "Selectable",
      notSelectableWhileInactive: "Not selectable while inactive",
    },
  },
  roles: {
    Sales: "Sales",
    Warehouse: "Warehouse",
    Admin: "Admin",
  },
  localeSwitcher: {
    label: "Language",
    english: "English",
    romanian: "Romanian",
    englishShort: "EN",
    romanianShort: "RO",
  },
  navigation: {
    sections: {
      overview: "Overview",
      visibility: "Visibility",
      operations: "Operations",
      management: "Management",
    },
    items: {
      dashboard: {
        label: "Dashboard",
        summary: "Role-aware starting point for the authenticated workspace.",
      },
      barcodeLookup: {
        label: "Barcode Lookup",
        summary: "Manual exact barcode-assisted lookup for existing products.",
      },
      products: {
        label: "Products",
        summary: "Catalog visibility, details, and admin master-data workflows.",
      },
      customers: {
        label: "Customers",
        summary:
          "Admin-only customer master-data management for sales-order authoring.",
      },
      suppliers: {
        label: "Suppliers",
        summary:
          "Admin-only supplier master-data management for inbound authoring.",
      },
      warehouseMap: {
        label: "Warehouse Map",
        summary:
          "Read-only warehouse map with structure hierarchy and location stock visibility.",
      },
      warehouseSetup: {
        label: "Warehouse Setup",
        summary: "Create and maintain warehouses, zones, and locations.",
      },
      inventory: {
        label: "Inventory",
        summary: "Available stock and location-aware inventory visibility.",
      },
      inboundOrders: {
        label: "Inbound Orders",
        summary: "Expected-goods planning and receipt preparation workflow.",
      },
      receipts: {
        label: "Receipts",
        summary: "Warehouse receipt execution before later putaway work.",
      },
      putawayTasks: {
        label: "Putaway Tasks",
        summary:
          "Post-receipt movement from receiving into final storage or picking.",
      },
      transferTasks: {
        label: "Transfer Tasks",
        summary:
          "Internal stock movement between normal non-receiving locations.",
      },
      replenishmentRules: {
        label: "Replenishment Rules",
        summary:
          "Admin-managed thresholds for when picking stock should be restored.",
      },
      salesOrders: {
        label: "Sales Orders",
        summary:
          "Demand entry and reservation visibility before picking or shipment.",
      },
      pickingTasks: {
        label: "Picking Tasks",
        summary: "Reserved-demand execution before later shipment workflow exists.",
      },
      shipments: {
        label: "Shipments",
        summary: "Final outbound deduction from explicit picked demand.",
      },
      replenishmentTasks: {
        label: "Replenishment Tasks",
        summary:
          "Manual replenishment work backed by admin-managed picking rules.",
      },
      inventoryCounts: {
        label: "Inventory Counts",
        summary:
          "Explicit stock-count workflow with expected, counted, and variance visibility.",
      },
      auditLogs: {
        label: "Audit Logs",
        summary: "Append-only business traceability for important workflow actions.",
      },
      users: {
        label: "Users",
        summary: "Admin-only operational user management on top of the current auth model.",
      },
    },
    hidden: {
      productDetails: {
        label: "Product Details",
        summary: "Selected product details and admin maintenance flow.",
      },
      customerDetails: {
        label: "Customer Details",
        summary: "Admin-only customer detail and activation-state maintenance.",
      },
      supplierDetails: {
        label: "Supplier Details",
        summary: "Admin-only supplier detail and activation-state maintenance.",
      },
      inboundOrderDetails: {
        label: "Inbound Order Details",
        summary: "Inbound document detail, admin maintenance, and receipt preparation.",
      },
      locations: {
        label: "Locations",
        summary: "Location list, status visibility, and detail drill-down.",
      },
      locationDetails: {
        label: "Location Details",
        summary: "Detailed warehouse location view with coordinates and status.",
      },
      receiptDetails: {
        label: "Receipt Details",
        summary: "Warehouse receipt detail with workflow transitions and receiving lines.",
      },
      putawayTaskDetails: {
        label: "Putaway Task Details",
        summary: "Putaway task detail with source, destination, and execution status.",
      },
      transferTaskDetails: {
        label: "Transfer Task Details",
        summary:
          "Transfer task detail with internal source, destination, and execution status.",
      },
      replenishmentRuleDetails: {
        label: "Replenishment Rule Details",
        summary: "Admin-managed picking-threshold rule detail and maintenance.",
      },
      replenishmentTaskDetails: {
        label: "Replenishment Task Details",
        summary:
          "Manual replenishment task detail with source, target, and execution status.",
      },
      salesOrderDetails: {
        label: "Sales Order Details",
        summary:
          "Sales-order detail with reservation results and role-aware workflow actions.",
      },
      pickingTaskDetails: {
        label: "Picking Task Details",
        summary:
          "Picking task detail with reserved-demand lines and picked-state execution status.",
      },
      shipmentDetails: {
        label: "Shipment Details",
        summary:
          "Shipment detail with picked-demand linkage and outbound completion status.",
      },
      inventoryCountDetails: {
        label: "Inventory Count Details",
        summary:
          "Inventory count detail with expected quantity, counted quantity, variance, and workflow status.",
      },
      auditLogDetails: {
        label: "Audit Log Details",
        summary: "Read-only business trace detail for one append-only audit entry.",
      },
      userDetails: {
        label: "User Details",
        summary:
          "Admin-only user detail, role assignment, and operational access-state management.",
      },
      warehouseSetup: {
        label: "Warehouse Setup",
        summary: "Admin setup area for warehouses, zones, and locations.",
      },
    },
  },
  shell: {
    topbar: {
      toggleNavigation: "Toggle navigation",
      defaultLabel: "Workspace",
      defaultSummary: "Authenticated WMS app shell",
    },
    sidebar: {
      title: "Authenticated workspace",
      description:
        "Navigation stays role-aware so each user sees only the areas that match the approved responsibilities.",
      signedInAs: "Signed in as",
      roleCountSingular: "{count} role",
      roleCountPlural: "{count} roles",
    },
    logout: {
      idle: "Sign out",
      pending: "Signing out...",
    },
  },
  auth: {
    heroEyebrow: "WMS Licenta",
    heroTitle: "Role-aware access for a warehouse system built around clarity.",
    heroDescription:
      "The frontend now uses the existing backend auth API to protect the workspace, load the current user, and keep navigation aligned with each role's approved responsibilities.",
    roleHighlights: {
      Sales: "Catalog visibility, available stock, and sales order entry.",
      Warehouse:
        "Receipts, movement execution, picking, replenishment, and counts.",
      Admin:
        "Products, inbound setup, users, audit visibility, and warehouse structure.",
    },
    foundationNotesEyebrow: "Foundation notes",
    foundationNotes: [
      "Only authenticated users can access protected pages.",
      "Navigation changes by role so operators do not see irrelevant modules.",
      "Protected navigation stays aligned with the user's operational role.",
    ],
    signInEyebrow: "Sign in",
    signInTitle: "Continue to the protected app shell.",
    signInDescription:
      "Use an active account from the backend auth store. Successful sign-in loads your role-aware sidebar and protected placeholder routes.",
    userNameLabel: "Username",
    userNamePlaceholder: "warehouse.operator",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    submitIdle: "Sign in",
    submitPending: "Signing in...",
    errors: {
      requiredFields: "Username and password are required.",
      invalidCredentials:
        "Invalid username or password, or the account is inactive.",
      generic: "Unable to sign in right now.",
    },
  },
  accessDenied: {
    eyebrow: "Access restricted",
    titleTemplate: "{title} is not available for your current role set.",
    description:
      "The authenticated shell is active, but this page is hidden for your role. This keeps navigation aligned with the approved role responsibilities and avoids exposing screens that do not belong to the current operator profile.",
    yourRoles: "Your roles",
    allowedRoles: "Allowed roles",
  },
  workflowStatus: {
    inboundOrder: {
      Draft: "Draft",
      ReadyForReceipt: "Ready for receipt",
      PartiallyReceived: "Partially received",
      FullyReceived: "Fully received",
      Cancelled: "Cancelled",
    },
    receipt: {
      Draft: "Draft",
      InProgress: "In progress",
      Confirmed: "Confirmed",
      Cancelled: "Cancelled",
    },
    salesOrder: {
      Draft: "Draft",
      Confirmed: "Confirmed",
      PartiallyReserved: "Partially reserved",
      FullyReserved: "Fully reserved",
      Cancelled: "Cancelled",
    },
    inventoryCount: {
      Draft: "Draft",
      InProgress: "In progress",
      Completed: "Completed",
      Cancelled: "Cancelled",
    },
    execution: {
      Pending: "Pending",
      InProgress: "In progress",
      Completed: "Completed",
      Cancelled: "Cancelled",
    },
  },
  dashboard: {
    header: {
      eyebrow: "Operational dashboard",
      title: "Role-aware overview of the current warehouse and business state",
      description:
        "This dashboard summarizes current WMS read models and points you toward the right workflow pages.",
    },
    quickLinks: {
      eyebrow: "Quick navigation",
      title: "Open the workflow page that fits the current signal",
      description:
        "These links stay limited to routes the current role can already access. Use them to move from the overview into the dedicated operational screens without turning the dashboard into an editing surface.",
      emptyTitle: "No quick links available.",
      emptyMessage: "No protected navigation items were visible for the current role.",
    },
    recentActivity: {
      eyebrow: "Recent activity",
      title: "Compact audit trace for recent business actions",
      description:
        "This is a small Admin-only activity glimpse from the append-only audit log, not a second audit screen and not the stock ledger.",
      emptyTitle: "No recent audit entries.",
      emptyMessage:
        "Recent activity will appear here after successful business actions are recorded through the existing audit-log foundation.",
    },
    section: {
      emptyTitle: "No visible summary data.",
      emptyMessage:
        "Nothing in this overview section is currently available for your role or the current backend response.",
      emptyEyebrow: "Dashboard state",
      openPage: "Open page",
      inventory: {
        eyebrow: "Inventory overview",
        title: "Current stock placement and location state",
        description:
          "Inventory visibility is summarized from existing location and balance read models. This is an overview surface and does not replace the stock ledger.",
      },
      inventorySales: {
        title: "Current product-level availability",
        description:
          "Sales visibility stays aligned to product-level inventory only. This overview highlights current availability and outbound demand pressure without exposing restricted location detail.",
      },
      inbound: {
        eyebrow: "Inbound overview",
        title: "Current inbound documents and receipt progress",
        description:
          "Inbound summaries stay read-only and reflect the current state of planning and warehouse receiving flows already implemented elsewhere.",
      },
      internal: {
        eyebrow: "Internal operations",
        title: "Warehouse execution across movement and control flows",
        description:
          "These summaries reflect the current state of operational warehouse work already implemented in dedicated workflow pages.",
      },
      outbound: {
        eyebrow: "Outbound overview",
        title: "Demand, picking, and shipment state",
        description:
          "Outbound summaries remain read-only here and point users toward the existing sales, picking, and shipment pages for full detail.",
      },
    },
    metrics: {
      balanceRows: {
        label: "Balance rows",
        helper: "raw product-location stock rows currently visible",
      },
      occupiedLocations: {
        label: "Occupied locations",
        helper: "locations that currently hold on-hand stock",
        highlightHelper: "current positions with on-hand stock",
      },
      emptyLocations: {
        label: "Empty locations",
        helper: "configured positions with no current on-hand stock",
      },
      attentionLocations: {
        label: "Attention locations",
        helper: "inactive or blocked locations still visible in structure",
      },
      visibleProducts: {
        label: "Visible products",
        helper: "product-level inventory summaries currently visible",
      },
      availableNow: {
        label: "Available now",
        helper: "products with some currently available quantity",
      },
      unavailable: {
        label: "Unavailable",
        helper: "products with no currently available quantity",
      },
      demandPressure: {
        label: "Demand pressure",
        helper: "products carrying reserved or picked outbound demand",
        highlightHelper: "products carrying reserved or picked demand",
      },
      availableProducts: {
        label: "Available products",
        helper: "product summaries with some visible availability",
      },
      inboundOrders: {
        label: "Inbound orders",
        helper: "documents currently visible in inbound planning",
      },
      awaitingReceipt: {
        label: "Awaiting receipt",
        helper: "orders ready for receipt work or partially received",
      },
      fullyReceived: {
        label: "Fully received",
        helper: "inbound documents already completed by receipt execution",
      },
      openReceipts: {
        label: "Open receipts",
        helper: "warehouse receipt documents still awaiting confirmation",
      },
      receiptsInProgress: {
        label: "Receipts in progress",
        helper: "receipt documents currently being executed",
      },
      openWork: {
        label: "Open work",
        helper: "pending or active internal warehouse documents",
      },
      inProgress: {
        label: "In progress",
        helper: "internal warehouse work currently being executed",
      },
      completed: {
        label: "Completed",
        helper: "documents already completed in internal workflows",
      },
      cancelled: {
        label: "Cancelled",
        helper: "documents intentionally stopped before completion",
      },
      activeSalesOrders: {
        label: "Active sales orders",
        helper: "visible demand documents still relevant for operations",
        highlightHelper: "visible demand documents still in play",
      },
      fullyReserved: {
        label: "Fully reserved",
        helper: "orders whose current demand is fully reserved",
      },
      awaitingCompletion: {
        label: "Awaiting completion",
        helper: "visible orders still not fully reserved or cancelled",
      },
      openPickingTasks: {
        label: "Open picking tasks",
        helper: "reserved-demand tasks still waiting for warehouse completion",
      },
      openShipments: {
        label: "Open shipments",
        helper: "shipment documents still waiting for outbound completion",
      },
      inboundAttention: {
        label: "Inbound attention",
        helper: "visible inbound documents still awaiting warehouse progress",
      },
      warehouseWorkOpen: {
        label: "Warehouse work open",
        helper: "pending or active internal warehouse documents",
      },
      outboundWorkOpen: {
        label: "Outbound work open",
        helper: "picking and shipment documents still awaiting completion",
      },
    },
    statusGroups: {
      inboundOrders: {
        title: "Inbound orders",
        summary: "Planning status across inbound documents.",
      },
      receipts: {
        title: "Receipts",
        summary: "Warehouse receiving execution visible to this role.",
      },
      putawayTasks: {
        title: "Putaway tasks",
        summary: "Post-receipt moves out of receiving locations.",
      },
      transferTasks: {
        title: "Transfer tasks",
        summary: "Internal relocation between non-receiving locations.",
      },
      replenishmentTasks: {
        title: "Replenishment tasks",
        summary: "Manual picking-stock replenishment execution.",
      },
      inventoryCounts: {
        title: "Inventory counts",
        summary: "Expected-versus-counted stock-control documents.",
      },
      salesOrders: {
        title: "Sales orders",
        summary: "Demand visibility before or alongside later warehouse execution.",
      },
      pickingTasks: {
        title: "Picking tasks",
        summary: "Reserved-demand execution before shipment.",
      },
      shipments: {
        title: "Shipments",
        summary: "Final outbound deduction from explicit picked demand.",
      },
    },
    dataLabels: {
      productInventory: "Product inventory",
      rawInventoryBalances: "Raw inventory balances",
      warehouseLocations: "Warehouse locations",
      inboundOrders: "Inbound orders",
      receipts: "Receipts",
      putawayTasks: "Putaway tasks",
      transferTasks: "Transfer tasks",
      replenishmentTasks: "Replenishment tasks",
      salesOrders: "Sales orders",
      pickingTasks: "Picking tasks",
      shipments: "Shipments",
      inventoryCounts: "Inventory counts",
      auditLog: "Audit log",
      loadFailedTemplate: "Could not load {label}",
    },
    audit: {
      unknownActor: "Unknown/system context",
    },
  },
  inventory: {
    route: {
      unavailableEyebrow: "Inventory unavailable",
      unavailableTitle: "Inventory visibility could not be loaded",
      unavailableFallback:
        "The backend did not return a usable inventory response.",
    },
    header: {
      eyebrow: "Inventory visibility",
      title: "Read-only inventory visibility grounded in explicit quantities",
      description:
        "This page uses the protected backend inventory endpoints directly. Product-level availability is visible to all approved roles, while location, raw balance, and movement-history views stay limited to warehouse and admin operators.",
    },
    views: {
      product: "By product",
      location: "By location",
      balance: "Balance rows",
      movement: "Movement history",
    },
    export: {
      productLabel: "Export product snapshot",
      locationLabel: "Export location snapshot",
      balanceLabel: "Export balance snapshot",
      emptyLabel: "No rows to export",
      columns: {
        productSku: "Product SKU",
        productName: "Product name",
        onHand: "On hand",
        reserved: "Reserved",
        picked: "Picked",
        available: "Available",
        updatedAt: "Updated at",
        warehouse: "Warehouse",
        zone: "Zone",
        locationCode: "Location code",
        locationName: "Location name",
        locationType: "Location type",
        locationActive: "Location active",
        locationBlocked: "Location blocked",
      },
    },
    filters: {
      searchLabel: "Search",
      searchPlaceholderProduct: "Search by product SKU or name",
      searchPlaceholderLocation:
        "Search by warehouse, zone, location, or type",
      searchPlaceholderBalance: "Search by product or location",
      searchPlaceholderMovement:
        "Search by product, location, reference, or notes",
      locationStateLabel: "Location state",
      locationStates: {
        all: "All locations",
        active: "Active only",
        inactive: "Inactive only",
        blocked: "Blocked only",
        unblocked: "Unblocked only",
      },
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
    },
    summary: {
      productsVisible: "Products visible",
      onHand: "On hand",
      reserved: "Reserved",
      available: "Available",
      availabilityRuleLabel: "Availability rule",
      availabilityRuleBody:
        "available quantity is derived from on hand minus reserved.",
      locationAwareTemplate:
        "Location-aware visibility currently spans {count} stock locations.",
      salesVisibilityNote: "Sales visibility stays at product level.",
    },
    productView: {
      emptyEyebrow: "No product rows",
      emptyMessage: "No product inventory matched the current filters.",
      derivedBadge: "Available is derived",
      openProduct: "Open product",
      updatedTemplate: "Updated {value}",
    },
    locationView: {
      unavailableTitle: "Location inventory is unavailable",
      emptyEyebrow: "No location rows",
      emptyMessage: "No location inventory matched the current filters.",
      openLocation: "Open location",
      updatedTemplate: "Updated {value}",
    },
    balanceView: {
      unavailableTitle: "Balance rows are unavailable",
      emptyEyebrow: "No balance rows",
      emptyMessage: "No balance rows matched the current filters.",
      productSection: "Product",
      locationSection: "Location",
      balanceRowBadge: "Balance row",
      updatedTemplate: "Updated {value}",
    },
    movementHistory: {
      filters: {
        product: "Product",
        location: "Location",
        movementType: "Movement type",
        allProducts: "All products",
        allLocations: "All locations",
        allMovementTypes: "All movement types",
      },
      types: {
        Addition: "Addition",
        Removal: "Removal",
        Relocation: "Relocation",
      },
      unavailableTitle: "Movement history is unavailable",
      emptyEyebrow: "No movement rows",
      emptyMessage:
        "No movement rows matched the current movement-history filters.",
      noSourceLocation: "No source location",
      noDestinationLocation: "No destination location",
      notRecorded: "Not recorded",
      notLinked: "Not linked",
    },
  },
  warehouseMap: {
    route: {
      unavailableEyebrow: "Map unavailable",
      unavailableTitle: "Warehouse map could not be loaded.",
      unavailableFallback:
        "The backend did not return a usable warehouse-map response.",
    },
    header: {
      eyebrow: "Warehouse map",
      title: "Read-only structure and stock placement across the warehouse",
      openSetup: "Manage structure",
      description:
        "This page is a visibility surface built from the current warehouse structure and inventory balances. It shows warehouse, zone, and location hierarchy, highlights empty versus occupied positions, and keeps blocked or inactive status explicit without changing stock.",
    },
    metrics: {
      warehouses: "Warehouses",
      zones: "Zones",
      occupiedLocations: "Occupied locations",
      productSlots: "Product slots",
      visibleTemplate: "{visible} visible / {total} total",
    },
    filters: {
      searchLabel: "Search",
      searchPlaceholder: "Warehouse, zone, location, type, or product",
      warehouseLabel: "Warehouse",
      allWarehouses: "All warehouses",
      zoneLabel: "Zone",
      allZones: "All zones",
      occupancyLabel: "Occupancy",
      allLocations: "All locations",
      occupiedOnly: "Occupied only",
      emptyOnly: "Empty only",
      statusLabel: "Status",
      allStates: "All states",
      activeOnly: "Active only",
      inactiveOnly: "Inactive only",
      blockedOnly: "Blocked only",
      unblockedOnly: "Unblocked only",
    },
    empty: {
      eyebrow: "Map state",
      title: "No locations matched the current filters.",
      message:
        "Try broadening the warehouse, zone, occupancy, or status filters to bring more of the structure back into view.",
    },
    warehouse: {
      statusDescription:
        "Structured by zone and current location occupancy. This remains a visibility-only map and does not change stock.",
      visibleZones: "Visible zones",
      visibleLocations: "Visible locations",
      occupied: "Occupied",
    },
    zone: {
      coordinateDescription:
        "Coordinate-based location map. Empty cells indicate no configured location for that coordinate in the current view.",
      visibleLocations: "Visible locations",
      occupied: "Occupied",
      sharedCells: "Shared cells",
      rowLabel: "Row",
      columnTemplate: "Col {column}",
      emptyCell: "Empty cell",
      emptyCellTemplate:
        "No configured location at row {row}, column {column}.",
      sharedCellTemplate: "{count} locations share this cell",
      productRows: "Product rows",
      onHand: "On hand",
      available: "Available",
      picked: "Picked",
    },
    detail: {
      eyebrow: "Location detail",
      titleSelectedTemplate: "{code} snapshot",
      titleEmpty: "Select a location",
      description:
        "This panel stays read-only and summarizes the current location status plus visible stock rows. It does not change structure or inventory.",
      noSelectionTitle: "No location selected.",
      noSelectionMessage:
        "Choose a location tile from the map to inspect hierarchy, status, and current stock in one place.",
      coordinates: "Coordinates",
      balanceRows: "Balance rows",
      onHand: "On hand",
      available: "Available",
      reserved: "Reserved",
      picked: "Picked",
      lastUpdatedTemplate: "Last updated {value}",
      noBalanceRows:
        "No balance rows are currently stored for this location.",
      locationEmptyTitle: "Location is empty.",
      locationEmptyMessage:
        "There are no current inventory balance rows in this location.",
      visibleStockRows: "Visible stock rows",
    },
  },
  warehouseSetup: {
    route: {
      unavailableEyebrow: "Setup unavailable",
      unavailableTitle: "Warehouse setup data could not be loaded.",
      unavailableFallback:
        "The backend did not return the required setup data.",
    },
    header: {
      eyebrow: "Warehouse setup",
      title: "Admin maintenance for the live warehouse structure",
      description:
        "Maintain warehouses, zones, and locations in one practical admin flow. These structure records feed the warehouse map and location visibility surfaces, but this page does not move stock or become a visual layout designer.",
      openWarehouseMap: "Open warehouse map",
      openLocations: "Open locations",
      metrics: {
        warehouses: "Warehouses",
        zones: "Zones",
        locations: "Locations",
      },
    },
    sections: {
      warehouses: {
        eyebrow: "Warehouses",
        title: "Warehouse administration",
        description:
          "Create and update warehouse identity plus active state without leaving the setup workflow.",
      },
      zones: {
        eyebrow: "Zones",
        title: "Zone administration",
        description:
          "Maintain warehouse assignment, zone identity, and active state in the same page that supports the map hierarchy.",
      },
      locations: {
        eyebrow: "Locations",
        title: "Location administration",
        description:
          "Create and update locations, keep map coordinates explicit, and control active plus blocked state without leaving the admin setup page.",
      },
    },
    editor: {
      create: "Create",
      update: "Update",
      warehouseToEdit: "Warehouse to edit",
      zoneToEdit: "Zone to edit",
      locationToEdit: "Location to edit",
      noWarehouses: "No warehouses available",
      noZones: "No zones available",
      noLocations: "No locations available",
      firstWarehouseMessage:
        "Create the first warehouse to unlock warehouse editing here.",
      firstZoneMessage:
        "Create the first zone to unlock zone editing here.",
      firstLocationMessage:
        "Create the first location to unlock location editing here.",
      rowColumnTemplate: "Row {row}, Col {column}",
    },
    forms: {
      saving: "Saving...",
      warehouseCode: "Warehouse code",
      warehouseName: "Warehouse name",
      warehouseIsActive: "Warehouse is active",
      createWarehouse: "Create warehouse",
      saveWarehouse: "Save warehouse",
      zoneWarehouse: "Warehouse",
      selectWarehouse: "Select a warehouse",
      zoneCode: "Zone code",
      zoneName: "Zone name",
      zoneIsActive: "Zone is active",
      createZone: "Create zone",
      saveZone: "Save zone",
      locationWarehouse: "Warehouse",
      locationZone: "Zone",
      selectZone: "Select a zone",
      locationCode: "Location code",
      locationName: "Location name",
      locationType: "Location type",
      mapRow: "Map row",
      mapColumn: "Map column",
      locationIsActive: "Location is active",
      createLocation: "Create location",
      saveLocation: "Save changes",
      locationTypes: {
        PICKING: "Picking",
        BULK: "Bulk",
        RECEIVING: "Receiving",
        STAGING: "Staging",
      },
      blockStateTitle: "Block state",
      blockStateDescription:
        "Keep blocked versus unblocked status explicit for downstream warehouse operations and the warehouse map.",
      blockLocation: "Block location",
      unblockLocation: "Unblock location",
      validation: {
        warehouseRequired: "Warehouse code and name are required.",
        zoneRequired: "Warehouse, zone code, and zone name are required.",
        locationRequired:
          "Warehouse, zone, code, name, and location type are required.",
        mapWholeNumbers: "Map row and column must be whole numbers.",
      },
      success: {
        warehouseCreated: "Warehouse {code} was created.",
        warehouseUpdated: "Warehouse {code} was updated.",
        zoneCreated: "Zone {code} was created.",
        zoneUpdated: "Zone {code} was updated.",
        locationCreated: "Location {code} was created.",
        locationUpdated: "Location {code} was updated.",
        locationBlocked: "Location is now blocked.",
        locationUnblocked: "Location is now unblocked.",
      },
      errors: {
        createWarehouse: "Unable to create the warehouse right now.",
        createZone: "Unable to create the zone right now.",
        updateWarehouse: "Unable to update the warehouse right now.",
        updateZone: "Unable to update the zone right now.",
        createLocation: "Unable to create the location right now.",
        updateLocation: "Unable to save location changes right now.",
        blockLocation: "Unable to block the location right now.",
        unblockLocation: "Unable to unblock the location right now.",
      },
    },
  },
  barcodeLookup: {
    header: {
      eyebrow: "Barcode lookup",
      title: "Manual barcode-assisted lookup for existing products",
      description:
        "This page performs an exact read-only backend barcode lookup from manual input.",
    },
    form: {
      label: "Barcode value",
      placeholder: "Enter or paste an exact barcode value",
      submit: "Lookup barcode",
      pending: "Looking up...",
      helper:
        "Matching stays exact. Blank input is blocked locally before any backend request is made.",
      requiredEyebrow: "Input required",
        requiredMessage:
          "Enter or paste a barcode value before starting an exact lookup.",
    },
    assist: {
      eyebrow: "Barcode assist",
      description:
        "Manual barcode-assisted product entry stays optional here. Lookup is exact, keeps manual selection available, supports keyboard-wedge scanners that submit with Enter, and uses the approved apply rule: first empty line, otherwise a new preselected line.",
      inputLabel: "Product barcode",
      inputPlaceholder: "Enter or paste an exact product barcode",
      requiredError:
        "Enter or paste a barcode value before resolving a product.",
      applyDescriptionTemplate:
        "Exact barcode {value} resolved to an existing product. Applying it keeps the current {contextLabel} flow intact and only preselects the product field.",
      applyButton: "Apply product",
      appliedButton: "Applied",
      unavailableProductTemplate:
        "Resolved product {code} is not present in the current form's loaded product options, so it cannot be applied automatically.",
    },
    states: {
      idleEyebrow: "Awaiting barcode input",
      idleMessage:
        "Enter or paste a product barcode above to run a compact exact lookup and navigate safely into the existing product detail workflow.",
      matchFound: "Match found",
      lookupTypes: {
        Product: "Product",
      },
      lookupType: "Lookup type",
      code: "Code",
      displayName: "Display name",
      barcode: "Barcode",
      activeState: "Active state",
      active: "Active",
      inactive: "Inactive",
      openProduct: "Open product",
      exactMatchTemplate:
        "Exact lookup matched barcode {value} to an existing product result.",
      notFoundEyebrow: "Not found",
      notFoundTitle: "No product matched that exact barcode",
      notFoundFallbackTemplate:
        "Barcode '{value}' did not resolve to a known product.",
      conflictEyebrow: "Duplicate conflict",
      conflictTitle: "This barcode cannot be resolved uniquely",
      conflictFallbackTemplate:
        "Barcode '{value}' is assigned to more than one product, so the system will not choose one arbitrarily.",
      errorEyebrow: "Lookup error",
      errorTitle: "Barcode lookup could not be completed",
      errorFallback:
        "The backend did not return a usable barcode lookup response.",
    },
  },
  suppliers: {
    route: {
      listUnavailableTitle: "Suppliers could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable supplier response.",
      detailUnavailableTitle: "Supplier could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested supplier.",
    },
    list: {
      eyebrow: "Supplier management",
      title: "Admin-only supplier master data for inbound authoring",
      description:
        "Maintain the supplier records used by inbound orders so authoring no longer relies on hardcoded or seed-only supplier ids.",
      actionBlockedEyebrow: "Workflow action blocked",
      searchLabel: "Search",
      searchPlaceholder: "Search by code, name, state, or id",
      visibleSuppliers: "Visible suppliers",
      activeSuppliers: "Active suppliers",
      inactiveSuppliers: "Inactive suppliers",
      viewDetail: "View detail",
      deactivate: "Deactivate",
      activate: "Activate",
      supplierCode: "Supplier code",
      supplierName: "Supplier name",
      operationalState: "Operational state",
      supplierId: "Supplier id",
      inactiveNote:
        "Inactive suppliers stay visible for reference but should not be selected for new inbound authoring.",
      createTitle: "Admin create flow",
      createDescription:
        "Create a supplier record that inbound authoring can use immediately.",
      createSubmit: "Create supplier",
      emptyEyebrow: "No suppliers matched",
      emptyMessage:
        "Adjust the current search to bring supplier master-data records back into view.",
    },
    detail: {
      backToList: "Back to suppliers",
      description:
        "Supplier maintenance stays focused on inbound authoring eligibility, without procurement, pricing, or contact workflows.",
      referenceEyebrow: "Supplier reference",
      inboundEligibility: "Inbound authoring eligibility",
      usageEyebrow: "Inbound-order usage",
      referencedInboundOrders: "Referenced inbound orders",
      activeReferencedInboundOrders: "Active referenced inbound orders",
      accessStateEyebrow: "Access state",
      deactivate: "Deactivate supplier",
      activate: "Activate supplier",
      editTitle: "Admin edit flow",
      editDescription:
        "Update supplier code and name while keeping activation state as an explicit operational action.",
      editSubmit: "Save supplier changes",
      words: {
        orderSingular: "inbound order",
        orderPlural: "inbound orders",
      },
      templates: {
        usageActive:
          "This supplier is already referenced by {referencedCount} {referencedWord}, and {activeCount} remain operationally active. Deactivation only stops future inbound selection; it does not remove historical document linkage.",
        usageHistorical:
          "This supplier is referenced by {referencedCount} {referencedWord}, but none remain operationally active. Deactivation still affects only future inbound authoring, not existing references.",
        usageNone:
          "This supplier is not currently referenced by inbound orders. Deactivation would only affect future inbound authoring selection.",
        accessActive:
          "This supplier is still tied to {activeCount} active {activeWord}. Deactivation only stops future selection for new inbound authoring and does not unlink existing orders.",
        accessHistorical:
          "Inactive suppliers stay visible for reference, and existing inbound orders keep their stored supplier link. Deactivation only prevents future inbound authoring selection.",
        accessNone:
          "Inactive suppliers stay visible for reference but should not be used in inbound-order authoring. Use these controls to reactivate or deactivate the current supplier explicitly.",
      },
    },
    form: {
      scopeEyebrow: "Scope",
      scopeDescription:
        "This is supplier master-data maintenance only. It supports inbound authoring and does not add procurement, pricing, contacts, or CRM behavior.",
      codeLabel: "Supplier code",
      nameLabel: "Supplier name",
      pending: "Saving...",
    },
    actions: {
      codeNameRequired: "Supplier code and supplier name are required.",
      createFallback: "Unable to create the supplier right now.",
      updateFallback: "Unable to update the supplier right now.",
      activateFallback: "Unable to activate the supplier right now.",
      deactivateFallback: "Unable to deactivate the supplier right now.",
      idRequired: "Supplier id is required.",
    },
  },
  customers: {
    route: {
      listUnavailableTitle: "Customers could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable customer response.",
      detailUnavailableTitle: "Customer could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested customer.",
    },
    list: {
      eyebrow: "Customer management",
      title: "Admin-only customer master data for sales-order authoring",
      description:
        "Maintain the customer records used by sales orders so authoring no longer relies on hardcoded or fragile customer ids.",
      actionBlockedEyebrow: "Workflow action blocked",
      searchLabel: "Search",
      searchPlaceholder: "Search by code, name, state, or id",
      visibleCustomers: "Visible customers",
      activeCustomers: "Active customers",
      inactiveCustomers: "Inactive customers",
      viewDetail: "View detail",
      deactivate: "Deactivate",
      activate: "Activate",
      customerCode: "Customer code",
      customerName: "Customer name",
      operationalState: "Operational state",
      customerId: "Customer id",
      inactiveNote:
        "Inactive customers stay visible for reference but should not be selected for new sales-order authoring.",
      createTitle: "Admin create flow",
      createDescription:
        "Create a customer record that sales-order authoring can use immediately.",
      createSubmit: "Create customer",
      emptyEyebrow: "No customers matched",
      emptyMessage:
        "Adjust the current search to bring customer master-data records back into view.",
    },
    detail: {
      backToList: "Back to customers",
      description:
        "Customer maintenance stays focused on sales-order authoring eligibility, without CRM, contact, pricing, or invoicing workflows.",
      referenceEyebrow: "Customer reference",
      salesEligibility: "Sales-order authoring eligibility",
      usageEyebrow: "Sales-order usage",
      referencedSalesOrders: "Referenced sales orders",
      activeReferencedSalesOrders: "Active referenced sales orders",
      accessStateEyebrow: "Access state",
      deactivate: "Deactivate customer",
      activate: "Activate customer",
      editTitle: "Admin edit flow",
      editDescription:
        "Update customer code and name while keeping activation state as an explicit operational action.",
      editSubmit: "Save customer changes",
      words: {
        orderSingular: "sales order",
        orderPlural: "sales orders",
      },
      templates: {
        usageActive:
          "This customer is already referenced by {referencedCount} {referencedWord}, and {activeCount} remain operationally active. Deactivation only stops future customer selection; it does not remove historical document linkage.",
        usageHistorical:
          "This customer is referenced by {referencedCount} {referencedWord}, but none remain operationally active. Deactivation still affects only future sales-order authoring, not existing references.",
        usageNone:
          "This customer is not currently referenced by sales orders. Deactivation would only affect future sales-order authoring selection.",
        accessActive:
          "This customer is still tied to {activeCount} active {activeWord}. Deactivation only stops future selection for new sales-order authoring and does not unlink existing orders.",
        accessHistorical:
          "Inactive customers stay visible for reference, and existing sales orders keep their stored customer link. Deactivation only prevents future sales-order authoring selection.",
        accessNone:
          "Inactive customers stay visible for reference but should not be used in new sales-order authoring. Use these controls to reactivate or deactivate the current customer explicitly.",
      },
    },
    form: {
      scopeEyebrow: "Scope",
      scopeDescription:
        "This is customer master-data maintenance only. It supports sales-order authoring and does not add CRM, pricing, invoicing, credit, or contact behavior.",
      codeLabel: "Customer code",
      nameLabel: "Customer name",
      pending: "Saving...",
    },
    actions: {
      codeNameRequired: "Customer code and customer name are required.",
      createFallback: "Unable to create the customer right now.",
      updateFallback: "Unable to update the customer right now.",
      activateFallback: "Unable to activate the customer right now.",
      deactivateFallback: "Unable to deactivate the customer right now.",
      idRequired: "Customer id is required.",
    },
  },
  inboundOrders: {
    route: {
      listUnavailableTitle: "Inbound orders could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable inbound-order response.",
      detailUnavailableTitle: "Inbound order could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested inbound order.",
      createProductsFallback:
        "Unable to load product options for inbound-order creation.",
      createSuppliersFallback:
        "Unable to load supplier options for inbound-order creation.",
      editProductsFallback:
        "Unable to load product options for inbound-order editing.",
      editSuppliersFallback:
        "Unable to load supplier options for inbound-order editing.",
    },
    list: {
      eyebrow: "Inbound workflow",
      title: "Expected goods planning before warehouse receipt confirmation",
      description:
        "Inbound orders capture what should arrive from a supplier. They do not change stock directly. The warehouse receipt flow handles the actual stock entry later, into receiving locations only.",
      warehouseFocus:
        "Warehouse view focuses on ready-for-receipt and partially received orders so receipt work stays easy to follow.",
      searchLabel: "Search",
      searchPlaceholder: "Search by invoice, supplier, SKU, or product",
      statusLabel: "Status",
      allOrders: "All inbound orders",
      receivableFirst: "Receivable first",
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
      receiptQueue: "Receipt queue",
      noNotes: "No inbound notes recorded.",
      viewDetails: "View details",
      createReceipt: "Create receipt",
      metrics: {
        lines: "Lines",
        expected: "Expected",
        confirmedReceived: "Confirmed received",
        remaining: "Remaining",
      },
      createTitle: "Admin create flow",
      createDescription:
        "Capture supplier invoice expectations while keeping the document stock-neutral until a warehouse receipt is confirmed.",
      createSubmit: "Create inbound order",
      emptyEyebrow: "No inbound orders matched",
      emptyMessage:
        "Adjust the current filters to bring inbound orders back into view.",
    },
    detail: {
      fallbackDescription:
        "This inbound order captures expected goods and stays stock-neutral until a warehouse receipt is confirmed.",
      backToList: "Back to inbound orders",
      createReceipt: "Create receipt",
      metrics: {
        supplier: "Supplier",
        expected: "Expected",
        confirmedReceived: "Confirmed received",
        remaining: "Remaining",
      },
      actionBlockedEyebrow: "Workflow action blocked",
      linesEyebrow: "Order lines",
      linesDescription:
        "Expected quantities live here. Confirmed received quantities increase only after warehouse receipt confirmation.",
      lineSingular: "line",
      linePlural: "lines",
      productLabel: "Product",
      expectedLabel: "Expected",
      receivedLabel: "Received",
      remainingLabel: "Remaining",
      workflowMeaningEyebrow: "Workflow meaning",
      workflowMeaning: {
        inboundOrder:
          "Inbound order: planning and expected goods only.",
        confirmedReceipt:
          "Confirmed receipt: the later stock-entry step into a receiving location.",
        putaway:
          "Putaway: a separate follow-up workflow after receipt confirmation.",
      },
      summaryEyebrow: "Document summary",
      supplierId: "Supplier id",
      created: "Created",
      updated: "Updated",
      cancelled: "Cancelled",
      notCancelled: "Not cancelled",
      adminActionsEyebrow: "Admin actions",
      adminActionsDescription:
        "Only draft inbound orders can be edited or moved to Ready for receipt. Cancellation remains blocked as soon as any confirmed received quantity exists.",
      markReady: "Mark ready for receipt",
      cancel: "Cancel inbound order",
      editTitle: "Admin edit flow",
      editDescription:
        "Adjust the expected goods document while it is still in Draft.",
      editSubmit: "Save inbound order",
      draftClosedEyebrow: "Draft editing closed",
      draftClosedDescription:
        "This inbound order is no longer in Draft, so the frontend keeps it read-only and leaves receipt execution to the warehouse workflow.",
      warehouseNextEyebrow: "Warehouse next step",
      warehouseNextDescription:
        "Warehouse can review the expected quantities here and then create a receipt only when the order is ready for receipt and still has quantity remaining.",
    },
    form: {
      stockImpactEyebrow: "Stock impact",
      stockImpactDescription:
        "Inbound orders plan expected goods only. They do not change stock. Stock enters the system later, when a warehouse receipt is confirmed into a receiving location.",
      readinessEyebrow: "Authoring readiness",
      readinessDescription:
        "Inbound authoring now uses maintained supplier records directly. Only active suppliers and maintained products should be used for new or updated inbound documents.",
      noActiveSuppliers:
        "No active suppliers are available right now. Create or reactivate a supplier before saving inbound-order changes.",
      noProducts:
        "No maintained products are available right now. Add products before creating or updating inbound-order lines.",
      selectedInactiveSupplier:
        "This draft currently references inactive supplier {code}. Choose an active supplier before saving.",
      barcodeContextLabel: "inbound-order line",
      barcodeApplied: "Applied product to inbound-order line {lineNumber}.",
      barcodeAdded: "Added product as new inbound-order line {lineNumber}.",
      supplierLabel: "Supplier",
      selectSupplier: "Select a supplier",
      noActiveSuppliersOption: "No active suppliers available",
      inactiveSuffix: "(inactive)",
      invoiceReferenceLabel: "Supplier invoice reference",
      invoiceReferencePlaceholder: "INV-2026-0001",
      notesLabel: "Notes",
      notesPlaceholder: "Optional receiving context or invoice notes",
      linesTitle: "Inbound-order lines",
      linesDescription:
        "Add expected products and quantities. Receipt confirmation will later decide what actually enters stock.",
      productsRequired:
        "Products are required before inbound-order lines can be added.",
      addLine: "Add line",
      productLabel: "Product {index}",
      selectProduct: "Select a product",
      noProductsOption: "No products available",
      expectedQuantityLabel: "Expected quantity",
      quantityPlaceholder: "12",
      removeLine: "Remove",
      pending: "Saving...",
    },
    actions: {
      createFallback: "Unable to create the inbound order right now.",
      updateFallback: "Unable to save inbound-order changes right now.",
      readyFallback:
        "Unable to move the inbound order to Ready for receipt.",
      cancelFallback: "Unable to cancel the inbound order right now.",
      supplierReferenceRequired:
        "Supplier and supplier invoice reference are required.",
      lineRequired: "At least one inbound-order line is required.",
      validLineRequired: "Add at least one valid inbound-order line.",
      productRequired: "Every inbound-order line must select a product.",
      quantityValid:
        "Expected quantities must be valid numbers greater than zero.",
    },
  },
  receipts: {
    route: {
      listUnavailableTitle: "Receipts could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable receipt response.",
      detailUnavailableTitle: "Receipt could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested receipt.",
      createInboundOrdersFallback:
        "Unable to load inbound orders for receipt creation.",
      createLocationsFallback:
        "Unable to load locations for receipt creation.",
    },
    list: {
      eyebrow: "Receipt workflow",
      title: "Warehouse receipt execution with explicit stock-entry confirmation",
      description:
        "Creating or starting a receipt does not change stock. Only a confirmed receipt enters stock into a receiving location, and putaway continues afterwards as its own warehouse workflow.",
      searchLabel: "Search",
      searchPlaceholder:
        "Search by invoice, supplier, SKU, or receiving location",
      statusLabel: "Status",
      allReceipts: "All receipts",
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
      linkedInboundStatus: "Linked inbound order status: {status}",
      noNotes: "No receipt notes recorded.",
      viewReceipt: "View receipt",
      continueReceipt: "Continue receipt",
      metrics: {
        lines: "Lines",
        created: "Created",
        started: "Started",
        confirmed: "Confirmed",
      },
      notStarted: "Not started",
      notConfirmed: "Not confirmed",
      emptyEyebrow: "No receipts matched",
      emptyMessage:
        "Adjust the current search or status filter to bring receipts back into view.",
    },
    form: {
      emptyEyebrow: "Create receipt",
      emptyMessage:
        "There are no inbound orders in Ready for receipt or Partially received with remaining quantity right now. Mark a draft inbound order ready, or finish the currently open receipts first.",
      eyebrow: "Create receipt",
      description:
        "Receipt creation is still stock-neutral. Stock changes only when a receipt later moves to Confirmed.",
      receivingRuleEyebrow: "Receiving location rule",
      receivingRuleDescription:
        "Only active, unblocked RECEIVING locations are shown here. Receipt confirmation moves stock into those receiving locations, and putaway continues afterwards in its own workflow.",
      inboundOrderLabel: "Inbound order",
      selectedOrderSummary:
        "Inbound order {orderId} is currently {status} and still has {remaining} remaining to receive.",
      notesLabel: "Notes",
      notesPlaceholder: "Optional receiving notes for the warehouse team",
      noReceivingLocations:
        "No active, unblocked RECEIVING locations are available right now. Add or reactivate a receiving location in warehouse setup before creating a receipt from this UI.",
      linesTitle: "Receipt lines",
      linesDescription:
        "Set quantity to 0 on any line you want to skip for this receipt.",
      productLabel: "Product",
      orderQuantitiesLabel: "Order quantities",
      expected: "Expected",
      confirmed: "Confirmed",
      remaining: "Remaining",
      receivingLocationLabel: "Receiving location",
      receiptQuantityLabel: "Receipt quantity",
      createSubmit: "Create receipt",
      pending: "Saving...",
    },
    detail: {
      title: "Receipt for {reference}",
      description:
        "This screen stays read-only apart from workflow transitions. The only stock-changing step is Confirm receipt, which enters stock into the selected receiving locations.",
      backToList: "Back to receipts",
      openInboundOrder: "Open inbound order",
      metrics: {
        inboundOrderStatus: "Inbound order status",
        created: "Created",
        started: "Started",
        confirmed: "Confirmed",
      },
      notStarted: "Not started",
      notConfirmed: "Not confirmed",
      actionBlockedEyebrow: "Workflow action blocked",
      workflowActionsEyebrow: "Workflow actions",
      workflowActionsDescription:
        "Draft and In progress remain stock-neutral. Confirmation is the final receipt step in this task and writes stock into the selected receiving locations. Putaway remains a separate follow-up workflow afterwards.",
      start: "Start receipt",
      confirm: "Confirm receipt",
      cancel: "Cancel receipt",
      summaryEyebrow: "Receipt summary",
      receiptId: "Receipt id",
      inboundOrderId: "Inbound order id",
      supplier: "Supplier",
      cancelled: "Cancelled",
      notCancelled: "Not cancelled",
      notesEyebrow: "Notes",
      linesEyebrow: "Receipt lines",
      linesDescription:
        "Each line shows the linked inbound expectation, the current confirmed received quantity on the order, and the receiving location selected for this receipt.",
      lineSingular: "line",
      linePlural: "lines",
      linkedInboundUnavailable:
        "The linked inbound order could not be loaded, so expected quantities are temporarily unavailable on this page.",
      productLabel: "Product",
      inboundOrderLine: "Inbound order line {id}",
      quantitiesEyebrow: "Quantities",
      thisReceipt: "This receipt",
      expected: "Expected",
      confirmedReceivedOnOrder: "Confirmed received on order",
      remaining: "Remaining",
      unavailable: "Unavailable",
      receivingLocationEyebrow: "Receiving location",
    },
    actions: {
      createFallback: "Unable to create the receipt right now.",
      startFallback: "Unable to move the receipt to In progress.",
      confirmFallback:
        "Unable to confirm the receipt. Check quantities and receiving locations.",
      cancelFallback: "Unable to cancel the receipt right now.",
      inboundOrderRequired:
        "Select the inbound order you want to receive against.",
      lineRequired:
        "Add at least one receipt line with a quantity greater than zero.",
      receivingLocationRequired:
        "Every receipt line with quantity must select a receiving location.",
      quantityValid:
        "Receipt quantities must be valid numbers greater than zero.",
    },
  },
  putawayTasks: {
    route: {
      listUnavailableTitle: "Putaway tasks could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable putaway-task response.",
      detailUnavailableTitle: "Putaway task could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested putaway task.",
      createBalancesFallback:
        "Unable to load receiving-stock rows for putaway creation.",
      createDestinationsFallback:
        "Unable to load destination locations for putaway creation.",
    },
    list: {
      eyebrow: "Putaway workflow",
      title: "Controlled movement from receiving into final storage or picking",
      description:
        "Receipt confirmation creates stock in a receiving location. Putaway then plans and executes the next move; completion is the only stock-changing action.",
      actionBlockedEyebrow: "Workflow action blocked",
      searchLabel: "Search",
      searchPlaceholder:
        "Search by product, source, destination, or receipt id",
      statusLabel: "Status",
      openTasksFirst: "Open tasks first",
      allTasks: "All tasks",
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
      sourceDestination: "Source {source} -> destination {destination}",
      quantityLabel: "Quantity {quantity}",
      receiptTraceability:
        "Receipt traceability: receipt {receiptId}{receiptLine}",
      receiptLineSuffix: ", line {receiptLineId}",
      noNotes: "No putaway notes recorded.",
      viewDetails: "View details",
      metrics: {
        created: "Created",
        started: "Started",
        completed: "Completed",
        cancelled: "Cancelled",
      },
      notStarted: "Not started",
      notCompleted: "Not completed",
      notCancelled: "Not cancelled",
      start: "Start task",
      complete: "Complete putaway",
      cancel: "Cancel task",
      emptyEyebrow: "No putaway tasks matched",
      emptyMessage:
        "Adjust the current search or status filter to bring putaway work back into view.",
    },
    form: {
      emptyEyebrow: "Create putaway task",
      emptyMessage:
        "No receiving-stock rows with positive available quantity are available right now, so there is nothing to plan for putaway from this UI.",
      eyebrow: "Create putaway task",
      description:
        "Putaway task creation is stock-neutral. Complete putaway is the stock-changing step that moves stock from receiving into final storage or picking.",
      meaningEyebrow: "Workflow meaning",
      meaningDescription:
        "Receipt confirmation creates stock in a RECEIVING location. Putaway then plans the controlled move out of receiving and into a final non-receiving destination.",
      sourceBalanceLabel: "Receiving stock to move",
      availableTemplate: "available {value}",
      sourceLabel: "Source",
      availableToMoveLabel: "Available to move",
      locationTypeTemplate: "{path} | type {type}",
      quantitySummaryTemplate: "On hand {onHand} | reserved {reserved}",
      destinationLocationLabel: "Destination location",
      noValidDestinations: "No valid destination locations available",
      quantityLabel: "Putaway quantity",
      notesLabel: "Notes",
      notesPlaceholder: "Optional guidance for the warehouse operator",
      noValidDestinationMessage:
        "No valid destination locations are available for this source. The destination must be active, unblocked, different from the source, and not of type RECEIVING.",
      createSubmit: "Create putaway task",
      pending: "Saving...",
    },
    detail: {
      title: "Putaway task for {productName}",
      description:
        "This task moves stock from a receiving location into final storage or picking. Complete putaway is the stock-changing step.",
      backToList: "Back to putaway tasks",
      metrics: {
        quantity: "Quantity",
        created: "Created",
        started: "Started",
        completed: "Completed",
      },
      notStarted: "Not started",
      notCompleted: "Not completed",
      actionBlockedEyebrow: "Workflow action blocked",
      workflowActionsEyebrow: "Workflow actions",
      workflowActionsDescription:
        "Starting or cancelling the task does not move stock. Completing the task writes the relocation from receiving into the selected final destination.",
      start: "Start task",
      complete: "Complete putaway",
      cancel: "Cancel task",
      noFurtherAction:
        "No further execution action is available for the current role and task state.",
      traceabilityEyebrow: "Traceability",
      putawayTaskId: "Putaway task id",
      receiptId: "Receipt id",
      receiptLineId: "Receipt line id",
      noLinkedReceipt: "No linked receipt",
      noLinkedReceiptLine: "No linked receipt line",
      cancelled: "Cancelled",
      notCancelled: "Not cancelled",
      notesEyebrow: "Notes",
      sourceLocationEyebrow: "Source location",
      sourceLocationDescription:
        "Source must be a RECEIVING location for putaway execution.",
      destinationLocationEyebrow: "Destination location",
      destinationLocationDescription:
        "Destination is the final storage or picking location for this move and must not be RECEIVING.",
    },
    actions: {
      createFallback: "Unable to create the putaway task right now.",
      startFallback: "Unable to start the putaway task right now.",
      completeFallback:
        "Unable to complete the putaway task. Check source stock and destination rules.",
      cancelFallback: "Unable to cancel the putaway task right now.",
      idRequired: "Putaway task id is required.",
      fieldsRequired:
        "Source stock, destination location, and quantity are required.",
      destinationDifferent:
        "Destination location must be different from the source location.",
      quantityValid:
        "Putaway quantity must be a valid number greater than zero.",
    },
  },
  transferTasks: {
    route: {
      listUnavailableTitle: "Transfer tasks could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable transfer-task response.",
      detailUnavailableTitle: "Transfer task could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested transfer task.",
      createBalancesFallback:
        "Unable to load source-stock rows for transfer creation.",
      createDestinationsFallback:
        "Unable to load destination locations for transfer creation.",
    },
    list: {
      eyebrow: "Transfer workflow",
      title: "Internal relocation between normal warehouse locations",
      description:
        "Transfer moves stock between active non-receiving locations. It stays distinct from putaway; completion is the only stock-changing action.",
      actionBlockedEyebrow: "Workflow action blocked",
      searchLabel: "Search",
      searchPlaceholder: "Search by product, source, destination, or reason",
      statusLabel: "Status",
      openTasksFirst: "Open tasks first",
      allTasks: "All tasks",
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
      sourceDestination: "Source {source} -> destination {destination}",
      quantityLabel: "Quantity {quantity}",
      noReason: "No transfer reason recorded.",
      viewDetails: "View details",
      metrics: {
        created: "Created",
        started: "Started",
        completed: "Completed",
        cancelled: "Cancelled",
      },
      notStarted: "Not started",
      notCompleted: "Not completed",
      notCancelled: "Not cancelled",
      start: "Start task",
      complete: "Complete transfer",
      cancel: "Cancel task",
      emptyEyebrow: "No transfer tasks matched",
      emptyMessage:
        "Adjust the current search or status filter to bring transfer work back into view.",
    },
    form: {
      emptyEyebrow: "Create transfer task",
      emptyMessage:
        "No active, non-receiving source balances with positive available stock are available right now, so there is nothing to plan for internal transfer from this UI.",
      eyebrow: "Create transfer task",
      description:
        "Transfer task creation is stock-neutral. Complete transfer is the stock-changing step that moves stock between normal non-receiving locations.",
      meaningEyebrow: "Workflow meaning",
      meaningDescription:
        "Transfer is an internal movement between normal warehouse locations. It stays distinct from putaway, which moves stock out of a receiving location after receipt confirmation.",
      sourceBalanceLabel: "Source stock to move",
      availableTemplate: "available {value}",
      blockedSource: "blocked source",
      unblockedSource: "unblocked source",
      sourceLabel: "Source",
      availableToMoveLabel: "Available to move",
      locationTypeTemplate: "{path} | type {type} | {sourceState}",
      quantitySummaryTemplate: "On hand {onHand} | reserved {reserved}",
      destinationLocationLabel: "Destination location",
      noValidDestinations: "No valid destination locations available",
      quantityLabel: "Transfer quantity",
      reasonLabel: "Reason",
      reasonPlaceholder: "Optional reason for the internal relocation",
      noValidDestinationMessage:
        "No valid destination locations are available for this source. The destination must be active, unblocked, different from the source, and not of type RECEIVING.",
      createSubmit: "Create transfer task",
      pending: "Saving...",
    },
    detail: {
      title: "Transfer task for {productName}",
      description:
        "This task handles an internal move between normal non-receiving locations. Complete transfer is the stock-changing step.",
      backToList: "Back to transfer tasks",
      metrics: {
        quantity: "Quantity",
        created: "Created",
        started: "Started",
        completed: "Completed",
      },
      notStarted: "Not started",
      notCompleted: "Not completed",
      actionBlockedEyebrow: "Workflow action blocked",
      workflowActionsEyebrow: "Workflow actions",
      workflowActionsDescription:
        "Creating, starting, or cancelling the task does not move stock. Completing the task writes the internal relocation between the selected normal locations.",
      start: "Start task",
      complete: "Complete transfer",
      cancel: "Cancel task",
      noFurtherAction:
        "No further execution action is available for the current role and task state.",
      summaryEyebrow: "Transfer summary",
      transferTaskId: "Transfer task id",
      cancelled: "Cancelled",
      notCancelled: "Not cancelled",
      reason: "Reason",
      noReason: "No transfer reason recorded.",
      sourceLocationEyebrow: "Source location",
      sourceLocationDescription:
        "Source must be an active normal location in this workflow. Transfers do not start from RECEIVING.",
      destinationLocationEyebrow: "Destination location",
      destinationLocationDescription:
        "Destination must be an active, unblocked normal location and stays distinct from the putaway workflow.",
    },
    actions: {
      createFallback: "Unable to create the transfer task right now.",
      startFallback: "Unable to start the transfer task right now.",
      completeFallback:
        "Unable to complete the transfer task. Check source stock and destination rules.",
      cancelFallback: "Unable to cancel the transfer task right now.",
      idRequired: "Transfer task id is required.",
      fieldsRequired:
        "Source stock, destination location, and quantity are required.",
      destinationDifferent:
        "Destination location must be different from the source location.",
      quantityValid:
        "Transfer quantity must be a valid number greater than zero.",
    },
  },
  replenishmentRules: {
    route: {
      listUnavailableTitle: "Replenishment rules could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable replenishment-rule response.",
      detailUnavailableTitle: "Replenishment rule could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested replenishment rule.",
      createProductsFallback:
        "Unable to load product options for replenishment-rule management.",
      createLocationsFallback:
        "Unable to load picking locations for replenishment-rule management.",
      editProductsFallback: "Unable to load product options for rule editing.",
      editLocationsFallback:
        "Unable to load valid picking locations for rule editing.",
    },
    list: {
      eyebrow: "Replenishment rules",
      title: "Admin-managed picking thresholds and target stock levels",
      description:
        "Rules define when replenishment is needed for a picking location. They stay separate from transfer and putaway, tasks remain manual, and only task completion changes stock.",
      searchLabel: "Search",
      searchPlaceholder: "Search by product or target picking location",
      stateLabel: "Rule state",
      activeFirst: "Active rules first",
      allRules: "All rules",
      inactiveOnly: "Inactive only",
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
      targetLabel: "Target {path} - {name}",
      viewDetails: "View details",
      metrics: {
        minimumThreshold: "Minimum threshold",
        targetQuantity: "Target quantity",
        updated: "Updated",
      },
      emptyEyebrow: "No replenishment rules matched",
      emptyMessage:
        "Adjust the current search or state filter to bring rule definitions back into view.",
    },
    form: {
      workflowMeaningEyebrow: "Workflow meaning",
      workflowMeaningDescription:
        "Replenishment rules define when a picking location needs stock restored. They do not create work automatically and do not move stock. Replenishment tasks remain manual, and only Complete replenishment changes stock.",
      targetLocationRuleEyebrow: "Target location rule",
      targetLocationRuleDescription:
        "Target locations in this workflow must be active, unblocked, and of type PICKING. Replenishment stays distinct from transfer and putaway.",
      createTitle: "Create replenishment rule",
      createDescription:
        "Define the threshold and target stock level for a picking location. Task creation stays manual.",
      createSubmit: "Create rule",
      productLabel: "Product",
      selectProduct: "Select a product",
      targetLocationLabel: "Target picking location",
      selectTargetLocation: "Select a PICKING location",
      minimumThresholdLabel: "Minimum threshold",
      minimumThresholdPlaceholder: "4",
      targetQuantityLabel: "Target quantity",
      targetQuantityPlaceholder: "10",
      optionsRequired:
        "A replenishment rule needs both product options and valid active, unblocked PICKING locations. Load those inputs first before creating or editing a rule.",
      pending: "Saving...",
    },
    detail: {
      title: "Replenishment rule for {productName}",
      description:
        "This rule defines when a target picking location should be replenished and what stock level it should return to. Tasks remain explicit and only their completion changes stock.",
      backToList: "Back to rules",
      metrics: {
        minimumThreshold: "Minimum threshold",
        targetQuantity: "Target quantity",
        created: "Created",
        updated: "Updated",
      },
      actionBlockedEyebrow: "Rule action blocked",
      summaryEyebrow: "Rule summary",
      ruleId: "Rule id",
      targetPath: "Target path",
      targetLocationName: "Target location name",
      lifecycleEyebrow: "Rule lifecycle",
      lifecycleDescription:
        "Deactivating a rule stops new manual replenishment tasks from relying on it. It does not change stock and it does not remove historical replenishment tasks.",
      deactivate: "Deactivate rule",
      inactiveMessage: "This rule is already inactive.",
      editTitle: "Edit replenishment rule",
      editDescription:
        "Keep the rule aligned with the correct product and target picking location. Task creation remains manual.",
      editSubmit: "Save rule changes",
      targetLocationEyebrow: "Target picking location",
      targetLocationDescription:
        "Replenishment targets must stay active, unblocked, and of type PICKING so this workflow remains distinct from transfer and putaway.",
    },
    actions: {
      createFallback: "Unable to create the replenishment rule right now.",
      updateFallback:
        "Unable to save replenishment-rule changes right now.",
      deactivateFallback: "Unable to deactivate the replenishment rule.",
      fieldsRequired:
        "Product, target location, minimum threshold, and target quantity are required.",
      minimumThresholdValid: "Minimum threshold must be zero or greater.",
      targetQuantityValid:
        "Target quantity must be greater than the minimum threshold.",
    },
  },
  replenishmentTasks: {
    route: {
      listUnavailableTitle: "Replenishment tasks could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable replenishment-task response.",
      detailUnavailableTitle: "Replenishment task could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested replenishment task.",
      createBalancesFallback:
        "Unable to load source-stock rows for replenishment creation.",
      createLocationsFallback:
        "Unable to load target picking locations for replenishment creation.",
      ruleDataWarning:
        "Rule thresholds could not be loaded for admin enrichment on this page.",
    },
    list: {
      eyebrow: "Replenishment workflow",
      title: "Manual restoration of stock into picking locations",
      description:
        "Replenishment stays distinct from putaway and transfer. Tasks remain manual, and Complete replenishment is the only stock-changing action here.",
      actionBlockedEyebrow: "Workflow action blocked",
      ruleContextUnavailableEyebrow: "Rule context unavailable",
      searchLabel: "Search",
      searchPlaceholder: "Search by product, source, target, or rule id",
      statusLabel: "Status",
      openTasksFirst: "Open tasks first",
      allTasks: "All tasks",
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
      sourceTarget: "Source {source} -> target {target}",
      quantityLabel: "Quantity {quantity}",
      linkedRule: "Linked rule {ruleId}",
      ruleSummary: "Rule min {minimumThreshold} -> target {targetQuantity}",
      viewDetails: "View details",
      metrics: {
        created: "Created",
        started: "Started",
        completed: "Completed",
        cancelled: "Cancelled",
      },
      notStarted: "Not started",
      notCompleted: "Not completed",
      notCancelled: "Not cancelled",
      start: "Start task",
      complete: "Complete replenishment",
      cancel: "Cancel task",
      emptyEyebrow: "No replenishment tasks matched",
      emptyMessage:
        "Adjust the current search or status filter to bring replenishment work back into view.",
    },
    form: {
      emptyEyebrow: "Create replenishment task",
      emptyMessage:
        "No active source-stock rows with positive available quantity are ready for manual replenishment planning right now.",
      eyebrow: "Create replenishment task",
      description:
        "Task creation is manual and stock-neutral. Complete replenishment is the stock-changing step that moves stock into the selected picking location.",
      meaningEyebrow: "Workflow meaning",
      meaningDescription:
        "Replenishment is separate from transfer and putaway. Rules define when a picking location should be restored, tasks are explicit, and only completion changes stock.",
      sourceStockLabel: "Source stock",
      availableTemplate: "available {value}",
      sourceLabel: "Source",
      availableToMoveLabel: "Available to move",
      sourceCaptionTemplate: "{path} | type {type}",
      quantitySummaryTemplate: "On hand {onHand} | reserved {reserved}",
      targetLocationLabel: "Target picking location",
      noValidTargets: "No valid PICKING locations available",
      quantityLabel: "Quantity to move",
      quantityPlaceholder: "Enter the manual replenishment quantity",
      targetAvailableNowLabel: "Target available now",
      targetBalanceCaptionTemplate: "On hand {onHand} | reserved {reserved}",
      noTargetBalance:
        "No current balance row exists for this product at the target location.",
      matchedRuleLabel: "Matched rule",
      matchedRuleValue:
        "Min {minimumThreshold} -> target {targetQuantity}",
      matchedRuleCaption:
        "This selected product and target location match an active replenishment rule.",
      ruleCheckLabel: "Rule check",
      ruleValidationLabel: "Rule-backed validation",
      noMatchingRule: "No matching active rule",
      validatedByBackend: "Validated by backend on submit",
      ruleCheckCaption:
        "Task creation still requires an active rule for this product and target location.",
      backendValidationCaption:
        "Warehouse task creation remains manual, and the backend confirms the matching rule and threshold conditions.",
      noValidTargetMessage:
        "No valid target picking locations are available for this source. The target must be active, unblocked, different from the source, and of type PICKING.",
      createSubmit: "Create replenishment task",
      pending: "Saving...",
    },
    detail: {
      title: "Replenishment task for {productName}",
      description:
        "This task restores stock into a picking location and stays distinct from putaway and transfer. Complete replenishment is the stock-changing step here.",
      backToList: "Back to replenishment tasks",
      metrics: {
        quantity: "Quantity to move",
        created: "Created",
        started: "Started",
        completed: "Completed",
      },
      notStarted: "Not started",
      notCompleted: "Not completed",
      actionBlockedEyebrow: "Workflow action blocked",
      workflowActionsEyebrow: "Workflow actions",
      workflowActionsDescription:
        "Creating, starting, or cancelling the task does not move stock. Completing the task writes the relocation into the target picking location.",
      start: "Start task",
      complete: "Complete replenishment",
      cancel: "Cancel task",
      noFurtherAction:
        "No further execution action is available for the current role and task state.",
      ruleContextEyebrow: "Rule-backed context",
      taskId: "Task id",
      linkedRuleId: "Linked rule id",
      minimumThreshold: "Minimum threshold",
      targetQuantity: "Target quantity",
      ruleDetailVisibility: "Rule detail visibility",
      ruleDetailVisibilityMessage:
        "The current backend contract exposes replenishment-rule detail only to Admin.",
      sourceLocationEyebrow: "Source location",
      sourceLocationDescription:
        "Source stock stays explicit in this workflow. The source must be active, but replenishment does not add a stricter source-block rule.",
      targetLocationEyebrow: "Target picking location",
      targetLocationDescription:
        "The target must be an active, unblocked PICKING location so replenishment stays distinct from generic transfer and putaway.",
    },
    actions: {
      createFallback:
        "Unable to create the replenishment task right now.",
      startFallback:
        "Unable to start the replenishment task right now.",
      completeFallback:
        "Unable to complete the replenishment task. Check source stock and target rule conditions.",
      cancelFallback:
        "Unable to cancel the replenishment task right now.",
      idRequired: "Replenishment task id is required.",
      fieldsRequired:
        "Source stock, target picking location, and quantity are required.",
      targetDifferent:
        "Target location must be different from the source location.",
      quantityValid:
        "Replenishment quantity must be a valid number greater than zero.",
    },
  },
  salesOrders: {
    route: {
      listUnavailableTitle: "Sales orders could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable sales-order response.",
      createProductsFallback:
        "Unable to load products for sales-order creation right now.",
      createCustomersFallback:
        "Unable to load customers for sales-order creation right now.",
      detailUnavailableTitle: "Sales order could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested sales order.",
      editProductsFallback:
        "Unable to load products for draft editing right now.",
      editCustomersFallback:
        "Unable to load customers for draft editing right now.",
    },
    list: {
      eyebrow: "Sales-order workflow",
      title: "Demand entry with explicit reservation results",
      description:
        "Sales orders record customer demand without moving stock. Confirming an order attempts reservation, which changes reserved quantity and availability only.",
      actionBlockedEyebrow: "Workflow action blocked",
      searchLabel: "Search",
      searchPlaceholder: "Search by order id, product, or status",
      statusLabel: "Status",
      activeOrdersFirst: "Active orders first",
      allOrders: "All orders",
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
      exportLabel: "Export sales orders",
      exportEmptyLabel: "No sales-order rows to export",
      orderBadgeTemplate: "Order {id}",
      customerSummaryTemplate: "Customer {customer}",
      lineCountTemplate: "{count} product line{suffix}",
      moreTemplate: "{preview} +{count} more",
      legacyUnassigned: "Legacy / unassigned",
      unknownCustomerState: "Unknown",
      viewDetails: "View details",
      metrics: {
        ordered: "Ordered",
        reserved: "Reserved",
        unreserved: "Unreserved",
        confirmed: "Confirmed",
        cancelled: "Cancelled",
      },
      notConfirmed: "Not confirmed",
      notCancelled: "Not cancelled",
      confirm: "Confirm and attempt reservation",
      cancel: "Cancel order",
      emptyEyebrow: "No sales orders matched",
      emptyMessage:
        "Adjust the current search or status filter to bring demand and reservation work back into view.",
      createTitle: "Create sales order",
      createDescription:
        "Capture demand with an explicit maintained customer plus product lines. Reservation happens later, when Sales confirms the order.",
      createSubmit: "Create sales order",
      exportColumns: {
        orderId: "Order id",
        status: "Status",
        customerCode: "Customer code",
        customerName: "Customer name",
        customerIsActive: "Customer active",
        createdAtUtc: "Created at",
        updatedAtUtc: "Updated at",
        confirmedAtUtc: "Confirmed at",
        cancelledAtUtc: "Cancelled at",
        productSku: "Product SKU",
        productName: "Product name",
        orderedQuantity: "Ordered quantity",
        reservedQuantity: "Reserved quantity",
        pickedQuantity: "Picked quantity",
        unreservedQuantity: "Unreserved quantity",
        reservationRowCount: "Reservation rows",
      },
    },
      form: {
        stockImpactEyebrow: "Stock impact",
        stockImpactDescription:
          "Sales-order authoring is stock-neutral. Confirming the order later attempts reservation against current stock, which changes reserved quantity and availability, but not on-hand stock.",
      readinessEyebrow: "Authoring readiness",
      readinessDescription:
        "Sales-order authoring needs an active maintained customer plus at least one maintained product line.",
      noActiveCustomers:
        "No active customers are available right now. Create or reactivate a customer before saving sales-order changes.",
      noProducts:
        "No maintained products are available right now. Add products before creating or updating sales-order lines.",
      inactiveCustomerRequired:
        "This draft needs an active maintained customer selected before it can be saved again.",
      customerLabel: "Customer",
      selectCustomer: "Select a customer",
      noActiveCustomersOption: "No active customers available",
      legacyInactiveCustomerTemplate:
        "Legacy / inactive customer: {customer} (reselect required)",
      legacyWithoutCustomerOption:
        "Legacy order without maintained customer (select a customer)",
      customerHelp:
        "Select an active maintained customer. Legacy or inactive customers stay visible for reference but should not be reused for new order authoring.",
      linesTitle: "Sales-order lines",
        linesDescription:
          "Add products and ordered quantities. Reservation results appear later on the detail page after a confirm attempt.",
        productsRequired:
          "Products are required before sales-order lines can be added.",
        barcodeContextLabel: "sales-order line",
        barcodeApplied:
          "Applied product to sales-order line {lineNumber}.",
        barcodeAdded:
          "Added product as new sales-order line {lineNumber}.",
        addLine: "Add line",
        productLabel: "Product {index}",
      selectProduct: "Select a product",
      noProductsOption: "No products available",
      orderedQuantityLabel: "Ordered quantity",
      quantityPlaceholder: "10",
      removeLine: "Remove",
      pending: "Saving...",
    },
    detail: {
      titleTemplate: "Sales order {id}",
      headerBadge: "Sales order",
      description:
        "This order is still part of demand and reservation planning. It does not physically move stock. Confirm attempts reservation against current inventory, reservation changes reserved quantity, and no picking or shipment has happened yet.",
      backToList: "Back to sales orders",
      metrics: {
        lines: "Lines",
        customer: "Customer",
        ordered: "Ordered",
        reserved: "Reserved",
        confirmed: "Confirmed",
        cancelled: "Cancelled",
      },
      notConfirmed: "Not confirmed",
      notCancelled: "Not cancelled",
      actionBlockedEyebrow: "Workflow action blocked",
      workflowActionsEyebrow: "Workflow actions",
      workflowActionsDescription:
        "Draft editing remains stock-neutral. Confirming re-runs reservation allocation for this order. Cancelling releases any reservations that already exist.",
      confirm: "Confirm and attempt reservation",
      cancel: "Cancel order",
      noFurtherAction:
        "No further workflow action is available for the current role and order status.",
      summaryEyebrow: "Order summary",
      salesOrderId: "Sales order id",
      customer: "Customer",
      updated: "Updated",
      unreservedQuantity: "Unreserved quantity",
      editTitle: "Edit draft sales order",
      editDescription:
        "Draft updates remain stock-neutral. Keep the maintained customer explicit before reservation detail is generated by confirm attempts.",
      editSubmit: "Update draft order",
      lineMetrics: {
        ordered: "Ordered",
        reserved: "Reserved",
        unreserved: "Unreserved",
      },
      reservationDetailEyebrow: "Reservation detail",
      reservationDetailDescription:
        "Reservation rows are display-only in this UI. They show which balance rows currently carry the logical stock commitment for this order line.",
      noReservationRows:
        "No reservation rows are currently allocated for this line.",
      reservedQuantityTemplate: "Reserved quantity {quantity}",
      balanceRowTemplate: "Balance row {id}",
      legacyWithoutCustomer: "Legacy order without maintained customer",
    },
    actions: {
      createFallback: "Unable to create the sales order right now.",
      updateFallback: "Unable to update the draft sales order right now.",
      confirmFallback:
        "Unable to confirm the sales order right now. Reservation could not be completed.",
      cancelFallback: "Unable to cancel the sales order right now.",
      idRequired: "Sales order id is required.",
      customerRequired: "Customer is required.",
      atLeastOneLine: "At least one sales-order line is required.",
      lineParseError: "Sales-order lines could not be parsed correctly.",
      productRequired: "Product {index} is required.",
      orderedQuantityValid:
        "Ordered quantity for line {index} must be greater than zero.",
    },
  },
  pickingTasks: {
    route: {
      listUnavailableTitle: "Picking tasks could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable picking-task response.",
      detailUnavailableTitle: "Picking task could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested picking task.",
      createSalesOrdersFallback:
        "Unable to load reserved sales-order demand for picking-task creation.",
    },
    list: {
      eyebrow: "Picking workflow",
      title: "Warehouse execution of reserved outbound demand",
      description:
        "Picking executes explicitly reserved sales-order demand. Complete picking moves quantity from reserved into picked-but-not-shipped while leaving on hand unchanged.",
      actionBlockedEyebrow: "Workflow action blocked",
      searchLabel: "Search",
      searchPlaceholder:
        "Search by order, product, source, or reservation",
      statusLabel: "Status",
      openTasksFirst: "Open tasks first",
      allTasks: "All tasks",
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
      orderBadgeTemplate: "Order {id}",
      lineCountTemplate: "{count} picking line{suffix}",
      moreTemplate: "{preview} +{count} more",
      sourceSummaryTemplate: "Sources {sources}",
      executionBoundary:
        "Picking stays inside reserved and picked state only. No shipment has happened here.",
      viewDetails: "View details",
      metrics: {
        toPick: "To pick",
        picked: "Picked",
        created: "Created",
        started: "Started",
        completed: "Completed",
      },
      notStarted: "Not started",
      notCompleted: "Not completed",
      start: "Start task",
      complete: "Complete picking",
      cancel: "Cancel task",
      emptyEyebrow: "No picking tasks matched",
      emptyMessage:
        "Adjust the current search or status filter to bring reserved-demand execution work back into view.",
    },
    form: {
      emptyEyebrow: "Create picking task",
      emptyMessage:
        "No sales order currently exposes remaining reservation-backed demand that can be assigned to a new picking task.",
      eyebrow: "Create picking task",
      description:
        "Picking tasks stay explicit and reservation-backed. Creating a task does not change stock. Complete picking is the only step that moves quantity from reserved into picked-but-not-shipped state.",
      meaningEyebrow: "Workflow meaning",
      meaningDescription:
        "Picking executes reserved demand. It is not shipment, it does not reduce on hand, and it does not introduce wave, batch, or route-optimization behavior.",
      salesOrderLabel: "Sales order with remaining reserved demand",
      salesOrderOptionTemplate:
        "Order {id} | {status} | {count} reservation-backed line{suffix}",
      summary: {
        orderStatus: "Order status",
        currentReservedQuantity: "Current reserved quantity",
        alreadyPickedQuantity: "Already picked quantity",
        orderStatusCaption:
          "Picking stays separate from reservation and shipment.",
        currentReservedQuantityCaption:
          "Reserved quantity is still logical commitment, not shipment.",
        alreadyPickedQuantityCaption:
          "Picked quantity stays explicit until shipment exists later.",
      },
      linesTitle: "Reservation-backed task lines",
      linesDescription:
        "Select the reserved quantities Warehouse should execute now. Remaining pickable quantity is shown conservatively after subtracting already assigned open-task quantities.",
      selectedCountTemplate: "{count} line{suffix} selected",
      includeInTask: "Include in task",
      metrics: {
        reservationQuantity: "Reservation quantity",
        alreadyPicked: "Already picked",
        openTaskAssigned: "Open-task assigned",
        pickableNow: "Pickable now",
        quantityToPick: "Quantity to pick",
      },
      captions: {
        reservationQuantity:
          "Current remaining reserved quantity on this reservation row.",
        alreadyPicked:
          "Historical picked quantity already executed from this reservation.",
        openTaskAssigned:
          "Conservative client-side subtraction from open picking tasks.",
        pickableNow:
          "Remaining quantity available for a new task line.",
        selectToSet:
          "Select this row to set the picked quantity.",
      },
      sourceTemplate: "Source {path} - {name}",
      reservationTemplate: "Reservation {id}",
      createSubmit: "Create picking task",
      pending: "Saving...",
    },
    detail: {
      titleTemplate: "Picking task {id}",
      orderBadgeTemplate: "Order {id}",
      description:
        "Picking executes reserved demand and remains separate from shipment. Completing this task moves quantity from reserved into picked-but-not-shipped state only, while leaving on hand unchanged.",
      viewSalesOrder: "View sales order",
      backToList: "Back to picking tasks",
      metrics: {
        lines: "Lines",
        toPick: "To pick",
        picked: "Picked",
        created: "Created",
        completed: "Completed",
      },
      notCompleted: "Not completed",
      actionBlockedEyebrow: "Workflow action blocked",
      workflowActionsEyebrow: "Workflow actions",
      workflowActionsDescription:
        "Creating, starting, or cancelling the task does not change stock state. Complete picking reduces reserved quantity and increases picked quantity.",
      start: "Start task",
      complete: "Complete picking",
      cancel: "Cancel task",
      noFurtherAction:
        "No further execution action is available for the current role and task state.",
      summaryEyebrow: "Picking summary",
      pickingTaskId: "Picking task id",
      salesOrderId: "Sales order id",
      started: "Started",
      cancelled: "Cancelled",
      notStarted: "Not started",
      notCancelled: "Not cancelled",
      sourceTemplate: "Source {path} - {name}",
      lineExecutionBoundary:
        "Picking executes this exact reserved quantity and does not represent shipment.",
      lineMetrics: {
        toPick: "To pick",
        picked: "Picked",
        reservation: "Reservation",
        balanceRow: "Balance row",
      },
      reservationId: "Reservation id",
      inventoryBalanceId: "Inventory balance id",
      salesOrderLineId: "Sales-order line id",
    },
    actions: {
      createFallback: "Unable to create the picking task right now.",
      startFallback: "Unable to start the picking task right now.",
      completeFallback:
        "Unable to complete the picking task. Check that the reserved demand is still available.",
      cancelFallback: "Unable to cancel the picking task right now.",
      idRequired: "Picking task id is required.",
      salesOrderRequired:
        "A sales order must be selected before creating a picking task.",
      lineRequired: "Select at least one reservation-backed line to pick.",
      lineParseError: "Picking-task lines could not be parsed correctly.",
      reservationRequired: "Reservation {index} is required.",
      reservationUnique:
        "Each reservation can only be added to the task once.",
      quantityValid:
        "Quantity to pick for line {index} must be greater than zero.",
    },
  },
  shipments: {
    route: {
      listUnavailableTitle: "Shipments could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable shipment response.",
      detailUnavailableTitle: "Shipment could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested shipment.",
      createPickingTasksFallback:
        "Unable to load completed picking work for shipment creation.",
    },
    list: {
      eyebrow: "Shipment workflow",
      title: "Final outbound deduction from explicit picked demand",
      description:
        "Shipment stays separate from picking. Complete shipment reduces both picked stock and on hand; invoicing, payment, carrier, label, and dispatch workflows are outside this UI.",
      actionBlockedEyebrow: "Workflow action blocked",
      searchLabel: "Search",
      searchPlaceholder:
        "Search by shipment, order, picking, product, or source",
      statusLabel: "Status",
      openShipmentsFirst: "Open shipments first",
      allShipments: "All shipments",
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
      orderBadgeTemplate: "Order {id}",
      lineCountTemplate: "{count} shipment line{suffix}",
      moreTemplate: "{preview} +{count} more",
      pickingTasksTemplate: "Picking tasks {tasks}",
      sourceTemplate: "Sources {sources}",
      workflowBoundary:
        "Shipment is the final outbound deduction step, not a picking action or a finance workflow.",
      viewDetails: "View details",
      metrics: {
        toShip: "To ship",
        shipped: "Shipped",
        created: "Created",
        started: "Started",
        completed: "Completed",
      },
      notStarted: "Not started",
      notCompleted: "Not completed",
      start: "Start shipment",
      complete: "Complete shipment",
      cancel: "Cancel shipment",
      emptyEyebrow: "No shipments matched",
      emptyMessage:
        "Adjust the current search or status filter to bring outbound shipment work back into view.",
    },
    form: {
      emptyEyebrow: "Create shipment",
      emptyMessage:
        "No completed picking-task lines currently expose remaining shippable quantity.",
      eyebrow: "Create shipment",
      description:
        "Shipment stays explicit and picked-demand-backed. Creating a shipment does not change stock. Complete shipment is the only step that reduces both picked stock and on hand.",
      meaningEyebrow: "Workflow meaning",
      meaningDescription:
        "Shipment is not picking. It is the final outbound stock deduction step and does not include invoicing, payment, carriers, labels, or dispatch orchestration.",
      salesOrderLabel: "Sales order with remaining picked demand",
      salesOrderOptionTemplate:
        "Order {id} | {status} | {count} shippable line{suffix}",
      summary: {
        orderStatus: "Order status",
        pickedQuantity: "Picked quantity",
        shippableNow: "Shippable now",
        orderStatusCaption:
          "Shipment remains separate from sales-order status changes.",
        pickedQuantityCaption:
          "Picked quantity is the current outbound-ready stock state.",
        shippableNowCaption:
          "Conservative quantity after shipped history and open shipment allocations.",
      },
      linesTitle: "Picked-demand shipment lines",
      linesDescription:
        "Select only the picked lines Warehouse should ship now. Remaining shippable quantity is shown conservatively after subtracting both completed shipment history and currently open shipment allocations.",
      selectedCountTemplate: "{count} line{suffix} selected",
      includeInShipment: "Include in shipment",
      sourceTemplate: "Source {path} - {name}",
      pickingTaskTemplate: "Picking task {id}",
      pickingTaskLineTemplate: "Picking-task line {id}",
      completedPickingTemplate: "Picking {status}",
      metrics: {
        pickedQuantity: "Picked quantity",
        alreadyShipped: "Already shipped",
        openShipmentAssigned: "Open shipment assigned",
        shippableNow: "Shippable now",
        quantityToShip: "Quantity to ship",
      },
      captions: {
        pickedQuantity:
          "Historical picked quantity on this completed picking-task line.",
        alreadyShipped:
          "Completed shipment history already executed from this picked line.",
        openShipmentAssigned:
          "Conservative subtraction from pending and in-progress shipments.",
        shippableNow:
          "Remaining quantity available for a new shipment line.",
        selectToSet:
          "Select this row to set the shipped quantity.",
      },
      createSubmit: "Create shipment",
      pending: "Saving...",
    },
    detail: {
      titleTemplate: "Shipment {id}",
      orderBadgeTemplate: "Order {id}",
      description:
        "Shipment is the final outbound stock deduction step. Completing this shipment reduces both picked stock and on hand.",
      viewSalesOrder: "View sales order",
      backToList: "Back to shipments",
      metrics: {
        lines: "Lines",
        toShip: "To ship",
        shipped: "Shipped",
        created: "Created",
        completed: "Completed",
      },
      notCompleted: "Not completed",
      actionBlockedEyebrow: "Workflow action blocked",
      workflowActionsEyebrow: "Workflow actions",
      workflowActionsDescription:
        "Creating, starting, or cancelling the shipment does not change stock state. Complete shipment is the only action here that reduces picked quantity and on hand.",
      start: "Start shipment",
      complete: "Complete shipment",
      cancel: "Cancel shipment",
      noFurtherAction:
        "No further execution action is available for the current role and shipment state.",
      summaryEyebrow: "Shipment summary",
      shipmentId: "Shipment id",
      salesOrderId: "Sales order id",
      pickingTasks: "Picking tasks",
      started: "Started",
      cancelled: "Cancelled",
      notStarted: "Not started",
      notCancelled: "Not cancelled",
      sourceTemplate: "Source {path} - {name}",
      lineWorkflowBoundary:
        "Picking-task and picked-demand linkage stay visible here, but this page does not turn into a carrier, label, dispatch, or finance workbench.",
      lineMetrics: {
        toShip: "To ship",
        shipped: "Shipped",
        pickingTask: "Picking task",
        pickingLine: "Picking line",
      },
      pickingTaskId: "Picking task id",
      pickingTaskLineId: "Picking-task line id",
      reservationId: "Reservation id",
      inventoryBalanceId: "Inventory balance id",
    },
    actions: {
      createFallback: "Unable to create the shipment right now.",
      startFallback: "Unable to start the shipment right now.",
      completeFallback:
        "Unable to complete the shipment. Check that the picked quantity is still available.",
      cancelFallback: "Unable to cancel the shipment right now.",
      idRequired: "Shipment id is required.",
      salesOrderRequired:
        "A sales order must be selected before creating a shipment.",
      lineRequired:
        "Select at least one picked line to include in the shipment.",
      lineParseError: "Shipment lines could not be parsed correctly.",
      pickedLineRequired: "Picked line {index} is required.",
      pickedLineUnique:
        "Each picked line can only be added to the shipment once.",
      quantityValid:
        "Quantity to ship for line {index} must be greater than zero.",
    },
  },
  products: {
    route: {
      listUnavailableTitle: "Products could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable product response.",
      categoriesFallback:
        "Unable to load product categories for admin actions.",
      unitsFallback:
        "Unable to load units of measure for admin actions.",
      detailUnavailableTitle: "The requested product could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested product.",
    },
    shared: {
      barcode: "Barcode",
      category: "Category",
      unitOfMeasure: "Unit of measure",
      pickingBaseline: "Picking baseline",
      notSet: "Not set",
      noDescription: "No description provided.",
      pickingBaselineTemplate: "Min {min} / Target {target}",
    },
    list: {
      eyebrow: "Product catalog",
      title: "Connected product visibility with admin maintenance flows",
      description:
        "This page uses the protected backend product APIs directly. Sales, Warehouse, and Admin can read products, while Admin can create and maintain master data without using hard delete.",
      viewDetails: "View details",
      emptyEyebrow: "No products matched",
      emptyMessage:
        "Adjust the search or status filter to bring products back into view.",
      createTitle: "Admin create flow",
      createDescription:
        "Create a new product record using the existing category and unit master data.",
      createSubmit: "Create product",
    },
    setup: {
      eyebrow: "Product prerequisites",
      title: "Catalog setup",
      categoriesLabel: "Categories",
      unitsLabel: "Units",
      countTemplate: "{count} configured",
      missingBoth:
        "Create at least one category and one unit of measure before adding products.",
      missingCategories:
        "Create at least one category before adding products.",
      missingUnits:
        "Create at least one unit of measure before adding products.",
      ready:
        "Category and unit prerequisites are ready. Product creation is available below.",
      productCreationLocked:
        "Product creation unlocks after at least one category and one unit of measure exist.",
      categoryNameLabel: "New category",
      categoryNamePlaceholder: "Finished goods",
      unitNameLabel: "New unit of measure",
      unitNamePlaceholder: "Piece",
      createCategorySubmit: "Add category",
      createUnitSubmit: "Add unit",
      pending: "Saving...",
      categoryNameRequired: "Category name is required.",
      unitNameRequired: "Unit of measure name is required.",
      categoryCreateFallback: "Unable to create the category right now.",
      unitCreateFallback: "Unable to create the unit of measure right now.",
    },
    filters: {
      searchLabel: "Search",
      searchPlaceholder:
        "Search by SKU, name, barcode, category, or unit",
      statusLabel: "Status",
      all: "All",
      activeOnly: "Active only",
      inactiveOnly: "Inactive only",
      showingTemplate: "Showing {filtered} of {total} products",
    },
    detail: {
      backToProducts: "Back to products",
      referenceEyebrow: "Product reference",
      imageUrl: "Image URL",
      productId: "Product id",
      categoryId: "Category id",
      unitOfMeasureId: "Unit of measure id",
      editTitle: "Admin edit flow",
      editDescription:
        "Update product master data while keeping deactivation as the supported removal path.",
      saveChangesSubmit: "Save product changes",
      deactivationEyebrow: "Deactivation",
      deactivationDescription:
        "This page supports deactivation only. No hard-delete product action is exposed in the UI.",
      deactivateButton: "Deactivate product",
      alreadyInactive: "Product already inactive",
    },
    form: {
      skuLabel: "SKU",
      skuPlaceholder: "FG-1000",
      barcodeLabel: "Barcode",
      barcodePlaceholder: "5940000000011",
      barcodeHint:
        "Optional. The system trims surrounding whitespace, keeps matching exact, and requires a unique barcode value when one is set.",
      nameLabel: "Product name",
      namePlaceholder: "Demo Finished Product",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Short operational description",
      categoryLabel: "Category",
      unitOfMeasureLabel: "Unit of measure",
      imageUrlLabel: "Image URL",
      imageUrlPlaceholder: "https://example.local/images/product.png",
      defaultMinPickingThresholdLabel: "Default min picking threshold",
      defaultTargetPickingQuantityLabel: "Default target picking quantity",
      isActiveLabel:
        "Product is active and visible for normal operations",
      pending: "Saving...",
    },
    actions: {
      createFallback: "Unable to create the product right now.",
      updateFallback: "Unable to update the product right now.",
      requiredFields:
        "SKU, name, category, and unit of measure are required.",
      barcodeMax: "Barcode must be 100 characters or fewer.",
      thresholdsNumeric:
        "Picking thresholds must be valid numeric values.",
      thresholdsNonNegative:
        "Picking thresholds must be zero or greater.",
    },
  },
  users: {
    route: {
      listUnavailableTitle: "Users could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable user-management response.",
      detailUnavailableTitle: "User could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested user.",
    },
    list: {
      eyebrow: "User management",
      title: "Admin-only operational control for application users",
      description:
        "User management supports Admin, Warehouse, and Sales role assignment. Activate and deactivate control operational access state; delete is not supported here.",
      actionBlockedEyebrow: "Workflow action blocked",
      searchLabel: "Search",
      searchPlaceholder:
        "Search by username, role, state, or id",
      visibleUsers: "Visible users",
      activeUsers: "Active users",
      inactiveUsers: "Inactive users",
      createdTemplate: "Created {timestamp}.",
      accessStateDescription:
        "Activate or deactivate changes operational access state without redesigning the underlying auth model.",
      viewDetail: "View detail",
      deactivateButton: "Deactivate",
      activateButton: "Activate",
      userName: "User name",
      state: "State",
      roles: "Roles",
      created: "Created",
      emptyEyebrow: "No users matched",
      emptyMessage:
        "Adjust the current search to bring operational user accounts back into view.",
      createTitle: "Admin create flow",
      createDescription:
        "Create an operational user with an initial password and one or more approved role assignments.",
      createSubmit: "Create user",
    },
    detail: {
      description:
        "Operational user management controls access state and optional password rotation. Delete is not available here.",
      backToUsers: "Back to users",
      userName: "User name",
      state: "State",
      assignedRoles: "Assigned roles",
      created: "Created",
      actionBlockedEyebrow: "Workflow action blocked",
      referenceEyebrow: "User reference",
      userId: "User id",
      operationalAccessState: "Operational access state",
      createdAt: "Created at",
      accessStateEyebrow: "Access state",
      accessStateDescription:
        "Activate or deactivate changes operational access state within the existing auth foundation. Delete is not supported, and this page does not introduce MFA, SSO, password reset, or account recovery flows.",
      deactivateButton: "Deactivate user",
      activateButton: "Activate user",
      editTitle: "Admin edit flow",
      editDescription:
        "Update the user name, adjust approved operational roles, and rotate the password only when you explicitly provide a new one.",
      saveChangesSubmit: "Save user changes",
    },
    form: {
      scopeEyebrow: "Scope",
      scopeDescription:
        "This UI supports only Admin, Warehouse, and Sales role assignment. Delete is not supported.",
      userNameLabel: "User name",
      userNamePlaceholder: "warehouse.supervisor",
      assignedRolesLegend: "Assigned roles",
      assignedRolesDescription:
        "Only the currently approved operational roles are assignable here.",
      initialPasswordLabel: "Initial password",
      optionalPasswordRotationLabel: "Optional password rotation",
      initialPasswordPlaceholder: "Enter an initial password",
      optionalPasswordRotationPlaceholder:
        "Leave empty to keep the current password",
      pending: "Saving...",
    },
    actions: {
      createFallback: "Unable to create the user right now.",
      updateFallback: "Unable to update the user right now.",
      activateFallback: "Unable to activate the user right now.",
      deactivateFallback: "Unable to deactivate the user right now.",
      userIdRequired: "User id is required.",
      userNameRequired: "User name is required.",
      initialPasswordRequired:
        "Initial password is required when creating a user.",
      atLeastOneRole:
        "Assign at least one supported operational role.",
      unsupportedRoleTemplate: "Unsupported role value: {role}.",
    },
  },
  locations: {
    route: {
      listUnavailableTitle: "Locations could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable locations response.",
      detailUnavailableTitle: "The requested location could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested location.",
      warehousesFallback:
        "Unable to load warehouses for location editing.",
      zonesFallback: "Unable to load zones for location editing.",
    },
    list: {
      eyebrow: "Locations",
      title: "Drill down into the warehouse location structure",
      description:
        "Location visibility stays read-only for Warehouse users and editable for Admin, with blocked status and coordinates kept explicit for operational clarity.",
      backToStructureOverview: "Back to structure overview",
      openSetup: "Create/manage in setup",
      searchLabel: "Search",
      searchPlaceholder:
        "Code, name, warehouse, zone, or type",
      warehouseLabel: "Warehouse",
      allWarehouses: "All warehouses",
      blockStatusLabel: "Block status",
      allLocations: "All locations",
      blockedOnly: "Blocked only",
      unblockedOnly: "Unblocked only",
      coordinates: "Coordinates",
      coordinatesTemplate: "Row {row}, column {column}",
      locationId: "Location id",
      emptyEyebrow: "No locations found",
      emptyMessage:
        "Adjust the filters to widen the visible location list.",
    },
    detail: {
      backToLocations: "Back to locations",
      structureOverview: "Structure overview",
      openSetup: "Create/manage locations",
      descriptionTemplate:
        "{warehouse} / {zone} with explicit row and column coordinates for future warehouse-map rendering.",
      activeStatus: "Active status",
      blockStatus: "Block status",
      mapRow: "Map row",
      mapColumn: "Map column",
      referenceEyebrow: "Location reference",
      warehouse: "Warehouse",
      zone: "Zone",
      locationId: "Location id",
      ruleNote: "Rule note",
      ruleNoteValue:
        "Locations can be active or inactive and blocked or unblocked.",
      editEyebrow: "Admin edit flow",
      editTitle: "Update location master data",
      blockLocation: "Block location",
      unblockLocation: "Unblock location",
    },
  },
  auditLogs: {
    route: {
      listUnavailableTitle: "Audit logs could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable audit-log response.",
      detailUnavailableTitle: "Audit log entry could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested audit-log entry.",
    },
    shared: {
      metadataBadge: "Metadata",
      systemOrUnknownContext: "System or unknown context",
      unknownActorTemplate: "Unknown actor ({id})",
      actionTypes: {
        UserCreated: "User created",
        UserUpdated: "User updated",
        UserActivated: "User activated",
        UserDeactivated: "User deactivated",
        ReceiptConfirmed: "Receipt confirmed",
        PutawayCompleted: "Putaway completed",
        TransferCompleted: "Transfer completed",
        ReplenishmentCompleted: "Replenishment completed",
        SalesOrderConfirmed: "Sales order confirmed",
        SalesOrderCancelled: "Sales order cancelled",
        PickingCompleted: "Picking completed",
        ShipmentCompleted: "Shipment completed",
        InventoryCountCompleted: "Inventory count completed",
      },
      entityTypes: {
        User: "User",
        Receipt: "Receipt",
        PutawayTask: "Putaway task",
        TransferTask: "Transfer task",
        ReplenishmentTask: "Replenishment task",
        SalesOrder: "Sales order",
        PickingTask: "Picking task",
        Shipment: "Shipment",
        InventoryCount: "Inventory count",
      },
    },
    list: {
      eyebrow: "Audit traceability",
      title: "Append-only visibility for important business actions",
      description:
        "Audit log is a read-only business traceability layer. It is append-only, it is not the stock ledger, and it does not replace workflow tables or live operational pages.",
      searchLabel: "Search",
      searchPlaceholder: "Search by actor, action, entity, summary, or id",
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
      exportLabel: "Export audit log",
      exportEmptyLabel: "No audit-log rows to export",
      viewDetail: "View detail",
      performedByTemplate: "Performed {timestamp} by {actor}.",
      entityTemplate: "Entity {entityType} / {entityId}",
      traceabilityDescription:
        "This entry is read-only trace data. Audit history supports business visibility, while inventory movement history remains the stock ledger.",
      emptyEyebrow: "No audit entries matched",
      emptyMessage:
        "Adjust the current search to bring append-only business trace entries back into view.",
      metrics: {
        performed: "Performed",
        actor: "Actor",
        actionType: "Action type",
        entityType: "Entity type",
        entityId: "Entity id",
      },
      exportColumns: {
        performedAtUtc: "Performed at",
        actorUserId: "Actor user id",
        actorUserName: "Actor user name",
        actorRolesSummary: "Actor roles",
        actionType: "Action type",
        entityType: "Entity type",
        entityId: "Entity id",
        summary: "Summary",
        metadataJson: "Metadata JSON",
      },
    },
    detail: {
      titleTemplate: "Audit entry {id}",
      description:
        "Audit log is an append-only business traceability layer. It stays read-only here, it does not replace workflow tables, and it is not the stock ledger.",
      backToAuditLogs: "Back to audit logs",
      summaryEyebrow: "Business trace summary",
      summaryDescription:
        "This entry records a successful business action or important state transition. Use it for operational traceability, then use the linked workflow pages and inventory movement history for the live process and stock details.",
      actorContextEyebrow: "Actor context",
      actorDisplay: "Actor display",
      actorUserName: "Actor user name",
      actorRoles: "Actor roles",
      actorUserId: "Actor user id",
      entityContextEyebrow: "Entity context",
      auditEntryId: "Audit entry id",
      performedAt: "Performed at",
      metadataEyebrow: "Metadata",
      metadataDescription:
        "Metadata stays compact and read-only here. When valid JSON is available, it is formatted for readability. Otherwise, the raw metadata string is shown unchanged.",
      noMetadata: "No metadata was recorded for this audit entry.",
      notRecorded: "Not recorded",
      metrics: {
        performed: "Performed",
        actor: "Actor",
        actionType: "Action type",
        entityType: "Entity type",
        entityId: "Entity id",
      },
    },
  },
  inventoryCounts: {
    route: {
      listUnavailableTitle: "Inventory counts could not be loaded",
      listUnavailableFallback:
        "The backend did not return a usable inventory-count response.",
      createProductsFallback:
        "Unable to load products for inventory-count creation right now.",
      createLocationsFallback:
        "Unable to load locations for inventory-count creation right now.",
      expectedPreviewFallback:
        "Current expected-quantity preview is unavailable. The backend snapshot on create remains authoritative.",
      detailUnavailableTitle: "Inventory count could not be loaded",
      detailUnavailableFallback:
        "The backend did not return the requested inventory count.",
    },
    list: {
      eyebrow: "Inventory-count workflow",
      title: "Explicit stock counts with visible expected, counted, and variance state",
      description:
        "Inventory counts stay separate from transfer, replenishment, picking, and shipment. Creating, starting, and cancelling are stock-neutral; Complete count posts reconciliation.",
      actionBlockedEyebrow: "Workflow action blocked",
      searchLabel: "Search",
      searchPlaceholder: "Search by count, product, location, or status",
      statusLabel: "Status",
      openCountsFirst: "Open counts first",
      allCounts: "All counts",
      resultsLabel: "Results",
      resultsTemplate: "Showing {filtered} of {total}",
      exportLabel: "Export inventory counts",
      exportEmptyLabel: "No inventory-count rows to export",
      countBadgeTemplate: "Count {id}",
      lineCountTemplate: "{count} count line{suffix}",
      moreTemplate: "{preview} +{count} more",
      locationsTemplate: "Locations {locations}",
      workflowBoundary:
        "Only complete count posts adjustments. Positive variance posts stock in, negative variance posts stock out, and reserved plus picked quantities are not directly edited here.",
      viewDetails: "View details",
      enterCountedQuantities: "Enter counted quantities",
      metrics: {
        expected: "Expected",
        counted: "Counted",
        netVariance: "Net variance",
        created: "Created",
        completed: "Completed",
      },
      notCompleted: "Not completed",
      start: "Start count",
      cancel: "Cancel count",
      emptyEyebrow: "No inventory counts matched",
      emptyMessage:
        "Adjust the current search or status filter to bring count work back into view.",
      exportColumns: {
        inventoryCountId: "Count id",
        status: "Status",
        createdAtUtc: "Created at",
        startedAtUtc: "Started at",
        completedAtUtc: "Completed at",
        cancelledAtUtc: "Cancelled at",
        productSku: "Product SKU",
        productName: "Product name",
        warehouseCode: "Warehouse",
        zoneCode: "Zone",
        locationCode: "Location code",
        locationName: "Location name",
        locationType: "Location type",
        locationIsActive: "Location active",
        locationIsBlocked: "Location blocked",
        expectedSystemQuantity: "Expected quantity",
        countedQuantity: "Counted quantity",
        varianceQuantity: "Variance quantity",
      },
    },
      form: {
        eyebrow: "Create inventory count",
        description:
          "Counts stay explicit and stock-neutral until completion. Complete count posts reconciliation adjustments.",
      meaningEyebrow: "Count meaning",
      meaningDescription:
        "Every line keeps expected/system quantity, counted quantity, and variance explicit. Positive variance posts stock in, negative variance posts stock out, and reserved plus picked quantities are not directly edited here.",
      readinessEyebrow: "Count readiness",
      readinessDescription:
        "Inventory-count authoring needs maintained products and maintained locations so each count line stays explicit.",
      noProductsWarning:
        "No maintained products are available right now. Add products before creating count lines.",
      noLocationsWarning:
        "No maintained locations are available right now. Complete warehouse setup before creating a count from this UI.",
      linesTitle: "Count lines",
      linesDescription:
        "Add explicit product and location pairs. The current expected preview uses existing balance rows when available, but the backend snapshot taken on create remains authoritative.",
        linesBlockedWarning:
          "Products and locations are both required before count lines can be added and saved.",
        barcodeContextLabel: "inventory-count line",
        barcodeApplied:
          "Applied product to inventory-count line {lineNumber}.",
        barcodeAdded:
          "Added product as new inventory-count line {lineNumber}.",
        addLine: "Add line",
        remove: "Remove",
      productLabelTemplate: "Product {index}",
      locationLabelTemplate: "Location {index}",
      productPlaceholder: "Select a product",
      productUnavailable: "No products available",
      locationPlaceholder: "Select a location",
      locationUnavailable: "No locations available",
      summary: {
        expectedSystemPreview: "Expected/system preview",
        productState: "Product state",
        locationPath: "Location path",
        locationState: "Location state",
        previewUnavailable: "Unavailable",
        previewUnavailableCaption:
          "Current preview could not be loaded. The backend snapshot on create stays authoritative.",
        previewCurrentBalanceCaption:
          "Current on-hand snapshot from the existing balance row.",
        previewNoBalanceCaption:
          "No current balance row. This line can still represent unexpected found stock.",
        selectProduct: "Select product",
        selectProductCaption:
          "Choose the product being counted on this line.",
        selectLocation: "Select location",
        selectLocationCaption:
          "Choose the specific location being counted.",
        notSelected: "Not selected",
        locationStateCaptionTemplate:
          "{type} location state stays visible instead of being hidden.",
        locationStateCaptionUnselected:
          "Location state will appear once a location is selected.",
      },
      createSubmit: "Create inventory count",
      pending: "Saving...",
    },
    detail: {
      countBadgeTemplate: "Count {id}",
      titleTemplate: "Inventory count {id}",
      description:
        "Inventory count stays separate from transfer, replenishment, picking, and shipment. Creating, starting, and cancelling the count are stock-neutral. Complete count is the explicit reconciliation-posting step that may adjust only on hand.",
      backToList: "Back to inventory counts",
      metrics: {
        lines: "Lines",
        expected: "Expected",
        counted: "Counted",
        netVariance: "Net variance",
        completed: "Completed",
      },
      notCompleted: "Not completed",
      actionBlockedEyebrow: "Workflow action blocked",
      workflowActionsEyebrow: "Workflow actions",
      workflowActionsDescription:
        "Create, start, and cancel are stock-neutral. Completing the count posts inventory adjustments. Positive variance posts stock in, negative variance posts stock out, and reserved plus picked quantities are not directly edited.",
      start: "Start count",
      cancel: "Cancel count",
      noFurtherAction:
        "No further execution action is available for the current role and count state.",
      summaryEyebrow: "Count summary",
      inventoryCountId: "Inventory count id",
      created: "Created",
      started: "Started",
      cancelled: "Cancelled",
      notStarted: "Not started",
      notCancelled: "Not cancelled",
      completionGuardEyebrow: "Completion guard",
      completionGuardDescription:
        "Completing the count can be rejected if the system on-hand stock drifted after count creation or if the resulting on-hand quantity would fall below current reserved plus picked stock. The frontend surfaces those backend validation errors directly instead of trying to override them.",
      countedQuantitiesEyebrow: "Counted quantities",
      countedQuantitiesDescription:
        "Enter the physically counted quantity for every line. The variance preview is explicit here, but stock is not adjusted until you complete the count.",
      completeSubmit: "Complete and post adjustments",
      posting: "Posting...",
      locationActive: "Location active",
      locationInactive: "Location inactive",
      locationBlocked: "Location blocked",
      locationUnblocked: "Location unblocked",
      locationTemplate: "Location {path} - {name}",
      lineWorkflowBoundary:
        "Completing this count posts on-hand reconciliation only. Reserved and picked quantities remain separate and are not directly edited here.",
      lineMetrics: {
        expected: "Expected",
        countedQuantity: "Counted quantity",
        variancePreview: "Variance preview",
        balanceRow: "Balance row",
        counted: "Counted",
        variance: "Variance",
      },
      countedQuantityPlaceholder: "Enter counted quantity",
      pendingEntry: "Pending entry",
      pendingPreview: "Pending preview",
      notRecorded: "Not recorded",
      notPosted: "Not posted",
      none: "None",
      countLineId: "Count line id",
      inventoryBalanceId: "Inventory balance id",
      missingBalanceEditable:
        "No existing balance row. This line can represent unexpected found stock.",
      missingBalanceReadonly:
        "No existing balance row. This line represented unexpected found stock.",
    },
    actions: {
      createFallback: "Unable to create the inventory count right now.",
      completeFallback:
        "Unable to complete the inventory count. Review the current stock state and try again.",
      startFallback: "Unable to start the inventory count right now.",
      cancelFallback: "Unable to cancel the inventory count right now.",
      idRequired: "Inventory count id is required.",
      atLeastOneLine:
        "Add at least one product and location pair before creating a count.",
      lineParseError: "Inventory-count lines could not be parsed correctly.",
      productRequired: "Product {index} is required.",
      locationRequired: "Location {index} is required.",
      countedLinesRequired:
        "Every count line needs an explicit counted quantity before completion.",
      countedLineMatchError:
        "Counted quantities could not be matched to the current count lines.",
      countedLineIdMissing: "Count line {index} is missing its identifier.",
      countedQuantityRequired:
        "Counted quantity for line {index} is required.",
      countedQuantityValid:
        "Counted quantity for line {index} must be zero or greater.",
    },
  },
} as const;
