import "server-only";

import { getWmsJson, mutateWmsJson } from "@/lib/api/wms-api";
import type {
  ReplenishmentRule,
  ReplenishmentRulePayload,
  ReplenishmentTask,
  ReplenishmentTaskPayload,
} from "@/types/replenishment";

export function listReplenishmentRules() {
  return getWmsJson<ReplenishmentRule[]>("/api/replenishment-rules");
}

export function getReplenishmentRule(replenishmentRuleId: string) {
  return getWmsJson<ReplenishmentRule>(
    `/api/replenishment-rules/${replenishmentRuleId}`,
  );
}

export function createReplenishmentRule(payload: ReplenishmentRulePayload) {
  return mutateWmsJson<ReplenishmentRule>("/api/replenishment-rules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateReplenishmentRule(
  replenishmentRuleId: string,
  payload: ReplenishmentRulePayload,
) {
  return mutateWmsJson<ReplenishmentRule>(
    `/api/replenishment-rules/${replenishmentRuleId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function deactivateReplenishmentRule(replenishmentRuleId: string) {
  return mutateWmsJson<ReplenishmentRule>(
    `/api/replenishment-rules/${replenishmentRuleId}/deactivate`,
    {
      method: "PATCH",
    },
  );
}

export function listReplenishmentTasks() {
  return getWmsJson<ReplenishmentTask[]>("/api/replenishment-tasks");
}

export function getReplenishmentTask(replenishmentTaskId: string) {
  return getWmsJson<ReplenishmentTask>(
    `/api/replenishment-tasks/${replenishmentTaskId}`,
  );
}

export function createReplenishmentTask(payload: ReplenishmentTaskPayload) {
  return mutateWmsJson<ReplenishmentTask>("/api/replenishment-tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function startReplenishmentTask(replenishmentTaskId: string) {
  return mutateWmsJson<ReplenishmentTask>(
    `/api/replenishment-tasks/${replenishmentTaskId}/start`,
    {
      method: "PATCH",
    },
  );
}

export function completeReplenishmentTask(replenishmentTaskId: string) {
  return mutateWmsJson<ReplenishmentTask>(
    `/api/replenishment-tasks/${replenishmentTaskId}/complete`,
    {
      method: "PATCH",
    },
  );
}

export function cancelReplenishmentTask(replenishmentTaskId: string) {
  return mutateWmsJson<ReplenishmentTask>(
    `/api/replenishment-tasks/${replenishmentTaskId}/cancel`,
    {
      method: "PATCH",
    },
  );
}
