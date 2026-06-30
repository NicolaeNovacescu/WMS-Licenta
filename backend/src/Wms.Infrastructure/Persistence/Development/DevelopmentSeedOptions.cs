namespace Wms.Infrastructure.Persistence.Development;

public sealed class DevelopmentSeedOptions
{
    public const string SectionName = "DevelopmentSeed";

    public bool ApplyMigrations { get; set; } = true;
    public bool SeedAuth { get; set; } = true;
    public bool SeedDemoData { get; set; }
}
