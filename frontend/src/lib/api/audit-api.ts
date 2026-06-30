import "server-only";

import { getWmsJson } from "@/lib/api/wms-api";
import type { AuditLog } from "@/types/audit";

export function listAuditLogs() {
  return getWmsJson<AuditLog[]>("/api/audit-logs");
}

export function getAuditLog(auditLogId: string) {
  return getWmsJson<AuditLog>(`/api/audit-logs/${auditLogId}`);
}
