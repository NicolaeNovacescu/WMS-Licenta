using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Wms.Infrastructure.Persistence;

public sealed class WmsDbContextFactory : IDesignTimeDbContextFactory<WmsDbContext>
{
    private const string DefaultConnectionString =
        "Host=localhost;Port=5432;Database=wms;Username=wms;Password=wms";

    public WmsDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__Postgres")
            ?? DefaultConnectionString;

        var optionsBuilder = new DbContextOptionsBuilder<WmsDbContext>();
        optionsBuilder.UseNpgsql(
            connectionString,
            npgsql => npgsql.MigrationsAssembly(typeof(WmsDbContext).Assembly.FullName));

        return new WmsDbContext(optionsBuilder.Options);
    }
}
