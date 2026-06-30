import "server-only";

import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";
import type { PickingTask, PickingTaskPayload } from "@/types/picking";

export function listPickingTasks() {
  return getWmsJson<PickingTask[]>("/api/picking-tasks");
}

export function getPickingTask(pickingTaskId: string) {
  return getWmsJson<PickingTask>(`/api/picking-tasks/${pickingTaskId}`);
}

export function createPickingTask(payload: PickingTaskPayload) {
  return mutateWmsJson<PickingTask>("/api/picking-tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function startPickingTask(pickingTaskId: string) {
  return mutateWmsJson<PickingTask>(`/api/picking-tasks/${pickingTaskId}/start`, {
    method: "PATCH",
  });
}

export function completePickingTask(pickingTaskId: string) {
  return mutateWmsJson<PickingTask>(`/api/picking-tasks/${pickingTaskId}/complete`, {
    method: "PATCH",
  });
}

export function cancelPickingTask(pickingTaskId: string) {
  return mutateWmsJson<PickingTask>(`/api/picking-tasks/${pickingTaskId}/cancel`, {
    method: "PATCH",
  });
}
