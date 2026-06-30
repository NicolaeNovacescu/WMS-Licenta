using Wms.Application.Audit.Models;

namespace Wms.Application.Audit.Abstractions;

public interface IAuditLogWriter
{
    void Write(AuditLogWriteEntry entry);
}

internal sealed class NullAuditLogWriter : IAuditLogWriter
{
    public static NullAuditLogWriter Instance { get; } = new();

    public void Write(AuditLogWriteEntry entry)
    {
    }
}
