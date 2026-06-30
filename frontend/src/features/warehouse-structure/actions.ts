"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  blockLocation,
  createLocation,
  createWarehouse,
  createZone,
  updateWarehouse,
  updateZone,
  unblockLocation,
  updateLocation,
} from "@/lib/api/warehouse-structure-api";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getMessages, interpolateMessage, type Messages } from "@/lib/i18n/messages";
import type {
  LocationPayload,
  WarehousePayload,
  WarehouseStructureFormState,
  ZonePayload,
} from "@/types/warehouse-structure";

const initialState: WarehouseStructureFormState = {
  error: null,
  successMessage: null,
};

export async function createWarehouseAction(
  _: WarehouseStructureFormState,
  formData: FormData,
): Promise<WarehouseStructureFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseWarehousePayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createWarehouse(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.warehouseSetup.forms.errors.createWarehouse,
    };
  }

  revalidateStructurePages();

  return {
    ...initialState,
    successMessage: interpolateMessage(
      messages.warehouseSetup.forms.success.warehouseCreated,
      { code: result.data.code },
    ),
  };
}

export async function createZoneAction(
  _: WarehouseStructureFormState,
  formData: FormData,
): Promise<WarehouseStructureFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseZonePayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createZone(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.warehouseSetup.forms.errors.createZone,
    };
  }

  revalidateStructurePages();

  return {
    ...initialState,
    successMessage: interpolateMessage(
      messages.warehouseSetup.forms.success.zoneCreated,
      { code: result.data.code },
    ),
  };
}

export async function updateWarehouseAction(
  warehouseId: string,
  _: WarehouseStructureFormState,
  formData: FormData,
): Promise<WarehouseStructureFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseWarehousePayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await updateWarehouse(warehouseId, parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.warehouseSetup.forms.errors.updateWarehouse,
    };
  }

  revalidateStructurePages();

  return {
    ...initialState,
    successMessage: interpolateMessage(
      messages.warehouseSetup.forms.success.warehouseUpdated,
      { code: result.data.code },
    ),
  };
}

export async function updateZoneAction(
  zoneId: string,
  _: WarehouseStructureFormState,
  formData: FormData,
): Promise<WarehouseStructureFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseZonePayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await updateZone(zoneId, parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.warehouseSetup.forms.errors.updateZone,
    };
  }

  revalidateStructurePages();

  return {
    ...initialState,
    successMessage: interpolateMessage(
      messages.warehouseSetup.forms.success.zoneUpdated,
      { code: result.data.code },
    ),
  };
}

export async function createLocationAction(
  _: WarehouseStructureFormState,
  formData: FormData,
): Promise<WarehouseStructureFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseLocationPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await createLocation(parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.warehouseSetup.forms.errors.createLocation,
    };
  }

  revalidateStructurePages();

  return {
    ...initialState,
    successMessage: interpolateMessage(
      messages.warehouseSetup.forms.success.locationCreated,
      { code: result.data.code },
    ),
  };
}

export async function updateLocationAction(
  locationId: string,
  _: WarehouseStructureFormState,
  formData: FormData,
): Promise<WarehouseStructureFormState> {
  const messages = getMessages(await getRequestLocale());
  const parsed = parseLocationPayload(formData, messages);

  if (!parsed.ok) {
    return {
      ...initialState,
      error: parsed.error,
    };
  }

  const result = await updateLocation(locationId, parsed.payload);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.warehouseSetup.forms.errors.updateLocation,
    };
  }

  revalidateStructurePages();
  revalidatePath(`/locations/${locationId}`);

  return {
    ...initialState,
    successMessage: interpolateMessage(
      messages.warehouseSetup.forms.success.locationUpdated,
      { code: result.data.code },
    ),
  };
}

export async function blockLocationAction(locationId: string) {
  const messages = getMessages(await getRequestLocale());
  const result = await blockLocation(locationId);

  if (!result.ok) {
    throw new Error(
      result.message ?? messages.warehouseSetup.forms.errors.blockLocation,
    );
  }

  revalidateStructurePages();
  revalidatePath(`/locations/${locationId}`);
  redirect(`/locations/${locationId}`);
}

export async function unblockLocationAction(locationId: string) {
  const messages = getMessages(await getRequestLocale());
  const result = await unblockLocation(locationId);

  if (!result.ok) {
    throw new Error(
      result.message ?? messages.warehouseSetup.forms.errors.unblockLocation,
    );
  }

  revalidateStructurePages();
  revalidatePath(`/locations/${locationId}`);
  redirect(`/locations/${locationId}`);
}

export async function blockLocationInlineAction(
  locationId: string,
  state: WarehouseStructureFormState,
  formData: FormData,
): Promise<WarehouseStructureFormState> {
  const messages = getMessages(await getRequestLocale());
  void state;
  void formData;
  const result = await blockLocation(locationId);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.warehouseSetup.forms.errors.blockLocation,
    };
  }

  revalidateStructurePages();
  revalidatePath(`/locations/${locationId}`);

  return {
    ...initialState,
    successMessage: messages.warehouseSetup.forms.success.locationBlocked,
  };
}

export async function unblockLocationInlineAction(
  locationId: string,
  state: WarehouseStructureFormState,
  formData: FormData,
): Promise<WarehouseStructureFormState> {
  const messages = getMessages(await getRequestLocale());
  void state;
  void formData;
  const result = await unblockLocation(locationId);

  if (!result.ok) {
    return {
      ...initialState,
      error: result.message ?? messages.warehouseSetup.forms.errors.unblockLocation,
    };
  }

  revalidateStructurePages();
  revalidatePath(`/locations/${locationId}`);

  return {
    ...initialState,
    successMessage: messages.warehouseSetup.forms.success.locationUnblocked,
  };
}

function revalidateStructurePages() {
  revalidatePath("/warehouse-map");
  revalidatePath("/locations");
  revalidatePath("/warehouse-setup");
}

function parseWarehousePayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: WarehousePayload }
  | { ok: false; error: string } {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();

  if (!code || !name) {
    return {
      ok: false,
      error: messages.warehouseSetup.forms.validation.warehouseRequired,
    };
  }

  return {
    ok: true,
    payload: {
      code,
      name,
      isActive: formData.get("isActive") === "on",
    },
  };
}

function parseZonePayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: ZonePayload }
  | { ok: false; error: string } {
  const warehouseId = String(formData.get("warehouseId") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();

  if (!warehouseId || !code || !name) {
    return {
      ok: false,
      error: messages.warehouseSetup.forms.validation.zoneRequired,
    };
  }

  return {
    ok: true,
    payload: {
      warehouseId,
      code,
      name,
      isActive: formData.get("isActive") === "on",
    },
  };
}

function parseLocationPayload(
  formData: FormData,
  messages: Messages,
):
  | { ok: true; payload: LocationPayload }
  | { ok: false; error: string } {
  const warehouseId = String(formData.get("warehouseId") ?? "").trim();
  const zoneId = String(formData.get("zoneId") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();
  const locationType = String(formData.get("locationType") ?? "").trim();
  const mapRow = Number.parseInt(String(formData.get("mapRow") ?? "").trim(), 10);
  const mapColumn = Number.parseInt(
    String(formData.get("mapColumn") ?? "").trim(),
    10,
  );

  if (!warehouseId || !zoneId || !code || !name || !locationType) {
    return {
      ok: false,
      error: messages.warehouseSetup.forms.validation.locationRequired,
    };
  }

  if (!Number.isInteger(mapRow) || !Number.isInteger(mapColumn)) {
    return {
      ok: false,
      error: messages.warehouseSetup.forms.validation.mapWholeNumbers,
    };
  }

  return {
    ok: true,
    payload: {
      warehouseId,
      zoneId,
      code,
      name,
      locationType,
      isActive: formData.get("isActive") === "on",
      mapRow,
      mapColumn,
    },
  };
}
