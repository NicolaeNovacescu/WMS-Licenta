import "server-only";

import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";
import type {
  CreateUserPayload,
  ManagedUser,
  UpdateUserPayload,
} from "@/types/user";

export function listUsers() {
  return getWmsJson<ManagedUser[]>("/api/users");
}

export function getUser(userId: string) {
  return getWmsJson<ManagedUser>(`/api/users/${userId}`);
}

export function createUser(payload: CreateUserPayload) {
  return mutateWmsJson<ManagedUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(userId: string, payload: UpdateUserPayload) {
  return mutateWmsJson<ManagedUser>(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function activateUser(userId: string) {
  return mutateWmsJson<ManagedUser>(`/api/users/${userId}/activate`, {
    method: "PATCH",
  });
}

export function deactivateUser(userId: string) {
  return mutateWmsJson<ManagedUser>(`/api/users/${userId}/deactivate`, {
    method: "PATCH",
  });
}
