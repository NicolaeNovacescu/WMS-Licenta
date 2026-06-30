export type BarcodeLookup = {
  lookupType: "Product" | string;
  entityId: string;
  code: string;
  displayName: string;
  barcode: string;
  isActive: boolean;
};

export type BarcodeLookupViewState =
  | {
      kind: "idle";
    }
  | {
      kind: "success";
      value: string;
      result: BarcodeLookup;
      navigationHref: string | null;
    }
  | {
      kind: "not-found";
      value: string;
      message: string | null;
    }
  | {
      kind: "conflict";
      value: string;
      message: string | null;
    }
  | {
      kind: "error";
      value: string;
      message: string | null;
    };
