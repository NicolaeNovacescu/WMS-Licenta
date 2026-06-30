import "server-only";

import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";
import type { PutawayTask, PutawayTaskPayload } from "@/types/putaway";

export function listPutawayTasks() {
  return getWmsJson<PutawayTask[]>("/api/putaway-tasks");
}

export function getPutawayTask(putawayTaskId: string) {
  return getWmsJson<PutawayTask>(`/api/putaway-tasks/${putawayTaskId}`);
}

export function createPutawayTask(payload: PutawayTaskPayload) {
  return mutateWmsJson<PutawayTask>("/api/putaway-tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function startPutawayTask(putawayTaskId: string) {
  return mutateWmsJson<PutawayTask>(`/api/putaway-tasks/${putawayTaskId}/start`, {
    method: "PATCH",
  });
}

export function completePutawayTask(putawayTaskId: string) {
  return mutateWmsJson<PutawayTask>(
    `/api/putaway-tasks/${putawayTaskId}/complete`,
    {
      method: "PATCH",
    },
  );
}

export function cancelPutawayTask(putawayTaskId: string) {
  return mutateWmsJson<PutawayTask>(`/api/putaway-tasks/${putawayTaskId}/cancel`, {
    method: "PATCH",
  });
}
