namespace Wms.Application.Audit.Models;

public sealed record AuditLogWriteEntry(
    string ActionType,
    string EntityType,
    string EntityId,
    string Summary,
    object? Metadata = null);
