using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wms.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryCountFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "inventory_counts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    StartedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CompletedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CancelledAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inventory_counts", x => x.Id);
                    table.CheckConstraint("CK_inventory_counts_status_supported", "\"Status\" IN ('Draft', 'InProgress', 'Completed', 'Cancelled')");
                });

            migrationBuilder.CreateTable(
                name: "inventory_count_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InventoryCountId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    InventoryBalanceId = table.Column<Guid>(type: "uuid", nullable: true),
                    ExpectedSystemQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CountedQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    VarianceQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inventory_count_lines", x => x.Id);
                    table.CheckConstraint("CK_inventory_count_lines_counted_non_negative", "\"CountedQuantity\" IS NULL OR \"CountedQuantity\" >= 0");
                    table.CheckConstraint("CK_inventory_count_lines_expected_non_negative", "\"ExpectedSystemQuantity\" >= 0");
                    table.CheckConstraint("CK_inventory_count_lines_variance_pairing", "(\"CountedQuantity\" IS NULL AND \"VarianceQuantity\" IS NULL) OR (\"CountedQuantity\" IS NOT NULL AND \"VarianceQuantity\" = (\"CountedQuantity\" - \"ExpectedSystemQuantity\"))");
                    table.ForeignKey(
                        name: "FK_inventory_count_lines_inventory_balances_InventoryBalanceId",
                        column: x => x.InventoryBalanceId,
                        principalTable: "inventory_balances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_inventory_count_lines_inventory_counts_InventoryCountId",
                        column: x => x.InventoryCountId,
                        principalTable: "inventory_counts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_inventory_count_lines_locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_inventory_count_lines_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_inventory_count_lines_InventoryBalanceId",
                table: "inventory_count_lines",
                column: "InventoryBalanceId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_count_lines_InventoryCountId_ProductId_LocationId",
                table: "inventory_count_lines",
                columns: new[] { "InventoryCountId", "ProductId", "LocationId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_inventory_count_lines_LocationId",
                table: "inventory_count_lines",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_count_lines_ProductId",
                table: "inventory_count_lines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_counts_CreatedAtUtc",
                table: "inventory_counts",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_counts_Status",
                table: "inventory_counts",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "inventory_count_lines");

            migrationBuilder.DropTable(
                name: "inventory_counts");
        }
    }
}
