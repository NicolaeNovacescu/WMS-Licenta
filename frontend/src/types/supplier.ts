export type ManagedSupplier = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type ManagedSupplierDetail = ManagedSupplier & {
  referencedInboundOrderCount: number;
  activeReferencedInboundOrderCount: number;
};

export type SupplierPayload = {
  code: string;
  name: string;
};

export type SupplierWorkflowFormState = {
  error: string | null;
  successMessage: string | null;
};
