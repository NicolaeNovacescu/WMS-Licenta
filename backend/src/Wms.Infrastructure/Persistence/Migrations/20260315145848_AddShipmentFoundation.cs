using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wms.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddShipmentFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "shipments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    StartedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CompletedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CancelledAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shipments", x => x.Id);
                    table.CheckConstraint("CK_shipments_status_supported", "\"Status\" IN ('Pending', 'InProgress', 'Completed', 'Cancelled')");
                    table.ForeignKey(
                        name: "FK_shipments_sales_orders_SalesOrderId",
                        column: x => x.SalesOrderId,
                        principalTable: "sales_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "shipment_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ShipmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    PickingTaskLineId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityToShip = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ShippedQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shipment_lines", x => x.Id);
                    table.CheckConstraint("CK_shipment_lines_quantity_positive", "\"QuantityToShip\" > 0");
                    table.CheckConstraint("CK_shipment_lines_shipped_non_negative", "\"ShippedQuantity\" >= 0");
                    table.CheckConstraint("CK_shipment_lines_shipped_not_greater_than_quantity", "\"ShippedQuantity\" <= \"QuantityToShip\"");
                    table.ForeignKey(
                        name: "FK_shipment_lines_picking_task_lines_PickingTaskLineId",
                        column: x => x.PickingTaskLineId,
                        principalTable: "picking_task_lines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_shipment_lines_shipments_ShipmentId",
                        column: x => x.ShipmentId,
                        principalTable: "shipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_shipment_lines_PickingTaskLineId",
                table: "shipment_lines",
                column: "PickingTaskLineId");

            migrationBuilder.CreateIndex(
                name: "IX_shipment_lines_ShipmentId",
                table: "shipment_lines",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_shipment_lines_ShipmentId_PickingTaskLineId",
                table: "shipment_lines",
                columns: new[] { "ShipmentId", "PickingTaskLineId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_shipments_CreatedAtUtc",
                table: "shipments",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_SalesOrderId",
                table: "shipments",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_Status",
                table: "shipments",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "shipment_lines");

            migrationBuilder.DropTable(
                name: "shipments");
        }
    }
}
