namespace Wms.Application.Audit.Models;

public sealed record AuditLogDto(
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
