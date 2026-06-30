import type {
  Location,
  Warehouse,
  Zone,
} from "@/types/warehouse-structure";

import {
  blockLocationInlineAction,
  createLocationAction,
  createWarehouseAction,
  createZoneAction,
  unblockLocationInlineAction,
  updateLocationAction,
  updateWarehouseAction,
  updateZoneAction,
} from "@/features/warehouse-structure/actions";
import { WarehouseSetupWorkspace } from "@/features/warehouse-structure/warehouse-setup-workspace";

type WarehouseSetupPageProps = {
  warehouses: readonly Warehouse[];
  zones: readonly Zone[];
  locations: readonly Location[];
};

export function WarehouseSetupPage({
  warehouses,
  zones,
  locations,
}: WarehouseSetupPageProps) {
  return (
    <WarehouseSetupWorkspace
      warehouses={warehouses}
      zones={zones}
      locations={locations}
      createWarehouseAction={createWarehouseAction}
      updateWarehouseAction={updateWarehouseAction}
      createZoneAction={createZoneAction}
      updateZoneAction={updateZoneAction}
      createLocationAction={createLocationAction}
      updateLocationAction={updateLocationAction}
      blockLocationInlineAction={blockLocationInlineAction}
      unblockLocationInlineAction={unblockLocationInlineAction}
    />
  );
}
