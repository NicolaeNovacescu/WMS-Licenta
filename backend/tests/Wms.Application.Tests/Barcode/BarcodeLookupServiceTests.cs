using Wms.Application.Barcode;
using Wms.Application.Barcode.Abstractions;
using Wms.Domain.Catalog;
using Xunit;

namespace Wms.Application.Tests.Barcode;

public sealed class BarcodeLookupServiceTests
{
    [Fact]
    public async Task LookupAsync_ReturnsProductLookup_WhenSingleProductMatches()
    {
        var repository = new InMemoryBarcodeLookupRepository();
        var product = repository.SeedProduct("FG-1000", "5940000000011", "Demo Finished Product", true);
        var service = new BarcodeLookupService(repository);

        var result = await service.LookupAsync("5940000000011", CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Product", result!.LookupType);
        Assert.Equal(product.Id, result.EntityId);
        Assert.Equal("FG-1000", result.Code);
        Assert.Equal("Demo Finished Product", result.DisplayName);
        Assert.Equal("5940000000011", result.Barcode);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task LookupAsync_TrimsInputBeforeMatching()
    {
        var repository = new InMemoryBarcodeLookupRepository();
        repository.SeedProduct("RM-2000", "5940000000028", "Demo Raw Material", true);
        var service = new BarcodeLookupService(repository);

        var result = await service.LookupAsync(" 5940000000028 ", CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("5940000000028", result!.Barcode);
    }

    [Fact]
    public async Task LookupAsync_ReturnsNull_WhenNoProductMatches()
    {
        var service = new BarcodeLookupService(new InMemoryBarcodeLookupRepository());

        var result = await service.LookupAsync("9999999999999", CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task LookupAsync_RejectsBlankBarcodeValue()
    {
        var service = new BarcodeLookupService(new InMemoryBarcodeLookupRepository());

        var exception = await Assert.ThrowsAsync<ArgumentException>(() =>
            service.LookupAsync("   ", CancellationToken.None));

        Assert.Equal("barcodeValue", exception.ParamName);
    }

    [Fact]
    public async Task LookupAsync_RejectsDuplicateProductBarcodes()
    {
        var repository = new InMemoryBarcodeLookupRepository();
        repository.SeedProduct("FG-1000", "5940000000011", "Demo Finished Product", true);
        repository.SeedProduct("FG-1001", "5940000000011", "Duplicate Finished Product", false);
        var service = new BarcodeLookupService(repository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.LookupAsync("5940000000011", CancellationToken.None));

        Assert.Contains("assigned to multiple products", exception.Message, StringComparison.Ordinal);
    }

    private sealed class InMemoryBarcodeLookupRepository : IBarcodeLookupRepository
    {
        private readonly List<Product> _products = [];

        public Task<IReadOnlyList<Product>> ListProductsByBarcodeAsync(string barcode, CancellationToken cancellationToken)
        {
            IReadOnlyList<Product> products = _products
                .Where(product => string.Equals(product.Barcode, barcode, StringComparison.Ordinal))
                .OrderBy(product => product.Name, StringComparer.Ordinal)
                .ToArray();

            return Task.FromResult(products);
        }

        public Product SeedProduct(string sku, string barcode, string name, bool isActive)
        {
            var product = new Product
            {
                Id = Guid.NewGuid(),
                Sku = sku,
                Barcode = barcode,
                Name = name,
                IsActive = isActive,
            };

            _products.Add(product);
            return product;
        }
    }
}
