namespace Wms.Api.Contracts.AuditLogs;

public sealed record AuditLogResponse(
    Guid Id,
    DateTimeOffset PerformedAtUtc,
    Guid? ActorUserId,
    string? ActorUserName,
    string? ActorRolesSummary,
    string ActionType,
    string EntityType,
    string EntityId,
    string Summary,
    string? MetadataJson);
