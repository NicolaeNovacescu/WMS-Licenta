using Wms.Domain.Authentication;

namespace Wms.Domain.Audit;

public sealed class AuditLog
{
    public Guid Id { get; set; }

    public DateTimeOffset PerformedAtUtc { get; set; }

    public Guid? ActorUserId { get; set; }
    public User? ActorUser { get; set; }

    public string? ActorUserName { get; set; }
    public string? ActorRolesSummary { get; set; }

    public string ActionType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string? MetadataJson { get; set; }
}
