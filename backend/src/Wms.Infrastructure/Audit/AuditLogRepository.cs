using Microsoft.EntityFrameworkCore;
using Wms.Application.Audit.Abstractions;
using Wms.Domain.Audit;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Audit;

public sealed class AuditLogRepository(WmsDbContext dbContext) : IAuditLogRepository
{
    public async Task<IReadOnlyList<AuditLog>> ListAuditLogsAsync(CancellationToken cancellationToken) =>
        await dbContext.AuditLogs
            .AsNoTracking()
            .OrderByDescending(auditLog => auditLog.PerformedAtUtc)
            .ThenByDescending(auditLog => auditLog.Id)
            .ToArrayAsync(cancellationToken);

    public Task<AuditLog?> FindAuditLogByIdAsync(Guid auditLogId, CancellationToken cancellationToken) =>
        dbContext.AuditLogs
            .AsNoTracking()
            .SingleOrDefaultAsync(auditLog => auditLog.Id == auditLogId, cancellationToken);
}
