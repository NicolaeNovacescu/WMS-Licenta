import "server-only";

import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";
import type { TransferTask, TransferTaskPayload } from "@/types/transfer";

export function listTransferTasks() {
  return getWmsJson<TransferTask[]>("/api/transfer-tasks");
}

export function getTransferTask(transferTaskId: string) {
  return getWmsJson<TransferTask>(`/api/transfer-tasks/${transferTaskId}`);
}

export function createTransferTask(payload: TransferTaskPayload) {
  return mutateWmsJson<TransferTask>("/api/transfer-tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function startTransferTask(transferTaskId: string) {
  return mutateWmsJson<TransferTask>(`/api/transfer-tasks/${transferTaskId}/start`, {
    method: "PATCH",
  });
}

export function completeTransferTask(transferTaskId: string) {
  return mutateWmsJson<TransferTask>(
    `/api/transfer-tasks/${transferTaskId}/complete`,
    {
      method: "PATCH",
    },
  );
}

export function cancelTransferTask(transferTaskId: string) {
  return mutateWmsJson<TransferTask>(`/api/transfer-tasks/${transferTaskId}/cancel`, {
    method: "PATCH",
  });
}
