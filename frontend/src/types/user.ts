import type { AppRole } from "@/types/auth";

export const assignableUserRoles = [
  "Admin",
  "Warehouse",
  "Sales",
] as const satisfies readonly AppRole[];

export type ManagedUserRole = (typeof assignableUserRoles)[number];

export type ManagedUser = {
  id: string;
  userName: string;
  isActive: boolean;
  createdAtUtc: string;
  roles: readonly ManagedUserRole[];
};

export type CreateUserPayload = {
  userName: string;
  password: string;
  roles: readonly ManagedUserRole[];
};

export type UpdateUserPayload = {
  userName: string;
  password?: string;
  roles: readonly ManagedUserRole[];
};

export type UserWorkflowFormState = {
  error: string | null;
  successMessage: string | null;
};
