export type ManagedCustomer = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type ManagedCustomerDetail = ManagedCustomer & {
  referencedSalesOrderCount: number;
  activeReferencedSalesOrderCount: number;
};

export type CustomerPayload = {
  code: string;
  name: string;
};

export type CustomerWorkflowFormState = {
  error: string | null;
  successMessage: string | null;
};
