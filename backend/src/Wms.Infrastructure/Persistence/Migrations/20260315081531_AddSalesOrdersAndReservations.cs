using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wms.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesOrdersAndReservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "sales_orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ConfirmedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CancelledAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_orders", x => x.Id);
                    table.CheckConstraint("CK_sales_orders_status_supported", "\"Status\" IN ('Draft', 'Confirmed', 'PartiallyReserved', 'FullyReserved', 'Cancelled')");
                });

            migrationBuilder.CreateTable(
                name: "sales_order_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderedQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ReservedQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_order_lines", x => x.Id);
                    table.CheckConstraint("CK_sales_order_lines_ordered_positive", "\"OrderedQuantity\" > 0");
                    table.CheckConstraint("CK_sales_order_lines_reserved_non_negative", "\"ReservedQuantity\" >= 0");
                    table.CheckConstraint("CK_sales_order_lines_reserved_not_greater_than_ordered", "\"ReservedQuantity\" <= \"OrderedQuantity\"");
                    table.ForeignKey(
                        name: "FK_sales_order_lines_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_order_lines_sales_orders_SalesOrderId",
                        column: x => x.SalesOrderId,
                        principalTable: "sales_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sales_order_reservations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesOrderLineId = table.Column<Guid>(type: "uuid", nullable: false),
                    InventoryBalanceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_order_reservations", x => x.Id);
                    table.CheckConstraint("CK_sales_order_reservations_quantity_positive", "\"Quantity\" > 0");
                    table.ForeignKey(
                        name: "FK_sales_order_reservations_inventory_balances_InventoryBalanc~",
                        column: x => x.InventoryBalanceId,
                        principalTable: "inventory_balances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sales_order_reservations_sales_order_lines_SalesOrderLineId",
                        column: x => x.SalesOrderLineId,
                        principalTable: "sales_order_lines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_sales_order_lines_ProductId",
                table: "sales_order_lines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_order_lines_SalesOrderId",
                table: "sales_order_lines",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_order_reservations_InventoryBalanceId",
                table: "sales_order_reservations",
                column: "InventoryBalanceId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_order_reservations_SalesOrderLineId",
                table: "sales_order_reservations",
                column: "SalesOrderLineId");

            migrationBuilder.CreateIndex(
                name: "IX_sales_order_reservations_SalesOrderLineId_InventoryBalanceId",
                table: "sales_order_reservations",
                columns: new[] { "SalesOrderLineId", "InventoryBalanceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sales_orders_CreatedAtUtc",
                table: "sales_orders",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_sales_orders_Status",
                table: "sales_orders",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "sales_order_reservations");

            migrationBuilder.DropTable(
                name: "sales_order_lines");

            migrationBuilder.DropTable(
                name: "sales_orders");
        }
    }
}
