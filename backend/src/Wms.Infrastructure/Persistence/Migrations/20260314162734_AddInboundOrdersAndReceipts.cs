using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wms.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddInboundOrdersAndReceipts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "suppliers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_suppliers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "inbound_orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierInvoiceReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Notes = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CancelledAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inbound_orders", x => x.Id);
                    table.CheckConstraint("CK_inbound_orders_status_supported", "\"Status\" IN ('Draft', 'ReadyForReceipt', 'PartiallyReceived', 'FullyReceived', 'Cancelled')");
                    table.ForeignKey(
                        name: "FK_inbound_orders_suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "inbound_order_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InboundOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpectedQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ReceivedQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inbound_order_lines", x => x.Id);
                    table.CheckConstraint("CK_inbound_order_lines_expected_non_negative", "\"ExpectedQuantity\" >= 0");
                    table.CheckConstraint("CK_inbound_order_lines_received_non_negative", "\"ReceivedQuantity\" >= 0");
                    table.CheckConstraint("CK_inbound_order_lines_received_not_greater_than_expected", "\"ReceivedQuantity\" <= \"ExpectedQuantity\"");
                    table.ForeignKey(
                        name: "FK_inbound_order_lines_inbound_orders_InboundOrderId",
                        column: x => x.InboundOrderId,
                        principalTable: "inbound_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_inbound_order_lines_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "receipts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InboundOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Notes = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    StartedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ConfirmedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CancelledAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_receipts", x => x.Id);
                    table.CheckConstraint("CK_receipts_status_supported", "\"Status\" IN ('Draft', 'InProgress', 'Confirmed', 'Cancelled')");
                    table.ForeignKey(
                        name: "FK_receipts_inbound_orders_InboundOrderId",
                        column: x => x.InboundOrderId,
                        principalTable: "inbound_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "receipt_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceiptId = table.Column<Guid>(type: "uuid", nullable: false),
                    InboundOrderLineId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceivingLocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_receipt_lines", x => x.Id);
                    table.CheckConstraint("CK_receipt_lines_quantity_positive", "\"Quantity\" > 0");
                    table.ForeignKey(
                        name: "FK_receipt_lines_inbound_order_lines_InboundOrderLineId",
                        column: x => x.InboundOrderLineId,
                        principalTable: "inbound_order_lines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_receipt_lines_locations_ReceivingLocationId",
                        column: x => x.ReceivingLocationId,
                        principalTable: "locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_receipt_lines_receipts_ReceiptId",
                        column: x => x.ReceiptId,
                        principalTable: "receipts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_inbound_order_lines_InboundOrderId",
                table: "inbound_order_lines",
                column: "InboundOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_inbound_order_lines_ProductId",
                table: "inbound_order_lines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_inbound_orders_Status",
                table: "inbound_orders",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_inbound_orders_SupplierId",
                table: "inbound_orders",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_receipt_lines_InboundOrderLineId",
                table: "receipt_lines",
                column: "InboundOrderLineId");

            migrationBuilder.CreateIndex(
                name: "IX_receipt_lines_ReceiptId",
                table: "receipt_lines",
                column: "ReceiptId");

            migrationBuilder.CreateIndex(
                name: "IX_receipt_lines_ReceivingLocationId",
                table: "receipt_lines",
                column: "ReceivingLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_receipts_CreatedAtUtc",
                table: "receipts",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_receipts_InboundOrderId",
                table: "receipts",
                column: "InboundOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_receipts_Status",
                table: "receipts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_suppliers_Code",
                table: "suppliers",
                column: "Code");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "receipt_lines");

            migrationBuilder.DropTable(
                name: "inbound_order_lines");

            migrationBuilder.DropTable(
                name: "receipts");

            migrationBuilder.DropTable(
                name: "inbound_orders");

            migrationBuilder.DropTable(
                name: "suppliers");
        }
    }
}
