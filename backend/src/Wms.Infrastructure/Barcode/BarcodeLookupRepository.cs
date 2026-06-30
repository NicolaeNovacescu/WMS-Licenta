using Microsoft.EntityFrameworkCore;
using Wms.Application.Barcode.Abstractions;
using Wms.Domain.Catalog;
using Wms.Infrastructure.Persistence;

namespace Wms.Infrastructure.Barcode;

public sealed class BarcodeLookupRepository(WmsDbContext dbContext) : IBarcodeLookupRepository
{
    public async Task<IReadOnlyList<Product>> ListProductsByBarcodeAsync(
        string barcode,
        CancellationToken cancellationToken) =>
        await dbContext.Products
            .AsNoTracking()
            .Where(product => product.Barcode == barcode)
            .OrderBy(product => product.Name)
            .ToArrayAsync(cancellationToken);
}
