using Wms.Application.Audit.Abstractions;
using Wms.Application.Audit.Models;

namespace Wms.Application.Audit;

public sealed class AuditLogService(IAuditLogRepository repository)
{
    public async Task<IReadOnlyList<AuditLogDto>> ListAuditLogsAsync(CancellationToken cancellationToken)
    {
        var auditLogs = await repository.ListAuditLogsAsync(cancellationToken);
        return auditLogs
            .Select(MapAuditLog)
            .ToArray();
    }

    public async Task<AuditLogDto?> GetAuditLogByIdAsync(Guid auditLogId, CancellationToken cancellationToken)
    {
        var auditLog = await repository.FindAuditLogByIdAsync(auditLogId, cancellationToken);
        return auditLog is null ? null : MapAuditLog(auditLog);
    }

    private static AuditLogDto MapAuditLog(Domain.Audit.AuditLog auditLog) =>
        new(
            auditLog.Id,
            auditLog.PerformedAtUtc,
            auditLog.ActorUserId,
            EmptyToNull(auditLog.ActorUserName),
            EmptyToNull(auditLog.ActorRolesSummary),
            auditLog.ActionType,
            auditLog.EntityType,
            auditLog.EntityId,
            auditLog.Summary,
            EmptyToNull(auditLog.MetadataJson));

    private static string? EmptyToNull(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;
}
