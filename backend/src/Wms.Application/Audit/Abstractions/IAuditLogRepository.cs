using Wms.Domain.Audit;

namespace Wms.Application.Audit.Abstractions;

public interface IAuditLogRepository
{
    Task<IReadOnlyList<AuditLog>> ListAuditLogsAsync(CancellationToken cancellationToken);
    Task<AuditLog?> FindAuditLogByIdAsync(Guid auditLogId, CancellationToken cancellationToken);
}
