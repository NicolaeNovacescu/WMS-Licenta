import "server-only";

import { getWmsJson } from "@/lib/api/wms-api";
import type { BarcodeLookup } from "@/types/barcode";

export function lookupBarcode(value: string) {
  return getWmsJson<BarcodeLookup>(`/api/barcodes/${encodeURIComponent(value)}`);
}
