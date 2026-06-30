export type AuditLog = {
  id: string;
  performedAtUtc: string;
  actorUserId: string | null;
  actorUserName: string | null;
  actorRolesSummary: string | null;
  actionType: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadataJson: string | null;
};
