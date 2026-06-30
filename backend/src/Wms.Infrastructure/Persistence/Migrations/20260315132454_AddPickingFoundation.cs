using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wms.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPickingFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_sales_order_reservations_quantity_positive",
                table: "sales_order_reservations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_sales_order_lines_reserved_not_greater_than_ordered",
                table: "sales_order_lines");

            migrationBuilder.DropCheckConstraint(
                name: "CK_inventory_balances_reserved_not_greater_than_on_hand",
                table: "inventory_balances");

            migrationBuilder.AddColumn<decimal>(
                name: "PickedQuantity",
                table: "sales_order_reservations",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PickedQuantity",
                table: "sales_order_lines",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PickedQuantity",
                table: "inventory_balances",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "picking_tasks",
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
                    table.PrimaryKey("PK_picking_tasks", x => x.Id);
                    table.CheckConstraint("CK_picking_tasks_status_supported", "\"Status\" IN ('Pending', 'InProgress', 'Completed', 'Cancelled')");
                    table.ForeignKey(
                        name: "FK_picking_tasks_sales_orders_SalesOrderId",
                        column: x => x.SalesOrderId,
                        principalTable: "sales_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "picking_task_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PickingTaskId = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesOrderLineId = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesOrderReservationId = table.Column<Guid>(type: "uuid", nullable: false),
                    InventoryBalanceId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityToPick = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PickedQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_picking_task_lines", x => x.Id);
                    table.CheckConstraint("CK_picking_task_lines_picked_non_negative", "\"PickedQuantity\" >= 0");
                    table.CheckConstraint("CK_picking_task_lines_picked_not_greater_than_quantity", "\"PickedQuantity\" <= \"QuantityToPick\"");
                    table.CheckConstraint("CK_picking_task_lines_quantity_positive", "\"QuantityToPick\" > 0");
                    table.ForeignKey(
                        name: "FK_picking_task_lines_inventory_balances_InventoryBalanceId",
                        column: x => x.InventoryBalanceId,
                        principalTable: "inventory_balances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_picking_task_lines_picking_tasks_PickingTaskId",
                        column: x => x.PickingTaskId,
                        principalTable: "picking_tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_picking_task_lines_sales_order_lines_SalesOrderLineId",
                        column: x => x.SalesOrderLineId,
                        principalTable: "sales_order_lines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_picking_task_lines_sales_order_reservations_SalesOrderReser~",
                        column: x => x.SalesOrderReservationId,
                        principalTable: "sales_order_reservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_sales_order_reservations_picked_non_negative",
                table: "sales_order_reservations",
                sql: "\"PickedQuantity\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_sales_order_reservations_quantity_non_negative",
                table: "sales_order_reservations",
                sql: "\"Quantity\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_sales_order_lines_committed_not_greater_than_ordered",
                table: "sales_order_lines",
                sql: "\"ReservedQuantity\" + \"PickedQuantity\" <= \"OrderedQuantity\"");

            migrationBuilder.AddCheckConstraint(
                name: "CK_sales_order_lines_picked_non_negative",
                table: "sales_order_lines",
                sql: "\"PickedQuantity\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_inventory_balances_committed_not_greater_than_on_hand",
                table: "inventory_balances",
                sql: "\"ReservedQuantity\" + \"PickedQuantity\" <= \"OnHandQuantity\"");

            migrationBuilder.AddCheckConstraint(
                name: "CK_inventory_balances_picked_non_negative",
                table: "inventory_balances",
                sql: "\"PickedQuantity\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_inventory_balances_reserved_non_negative",
                table: "inventory_balances",
                sql: "\"ReservedQuantity\" >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_picking_task_lines_InventoryBalanceId",
                table: "picking_task_lines",
                column: "InventoryBalanceId");

            migrationBuilder.CreateIndex(
                name: "IX_picking_task_lines_PickingTaskId",
                table: "picking_task_lines",
                column: "PickingTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_picking_task_lines_SalesOrderLineId",
                table: "picking_task_lines",
                column: "SalesOrderLineId");

            migrationBuilder.CreateIndex(
                name: "IX_picking_task_lines_SalesOrderReservationId",
                table: "picking_task_lines",
                column: "SalesOrderReservationId");

            migrationBuilder.CreateIndex(
                name: "IX_picking_tasks_CreatedAtUtc",
                table: "picking_tasks",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_picking_tasks_SalesOrderId",
                table: "picking_tasks",
                column: "SalesOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_picking_tasks_Status",
                table: "picking_tasks",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "picking_task_lines");

            migrationBuilder.DropTable(
                name: "picking_tasks");

            migrationBuilder.DropCheckConstraint(
                name: "CK_sales_order_reservations_picked_non_negative",
                table: "sales_order_reservations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_sales_order_reservations_quantity_non_negative",
                table: "sales_order_reservations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_sales_order_lines_committed_not_greater_than_ordered",
                table: "sales_order_lines");

            migrationBuilder.DropCheckConstraint(
                name: "CK_sales_order_lines_picked_non_negative",
                table: "sales_order_lines");

            migrationBuilder.DropCheckConstraint(
                name: "CK_inventory_balances_committed_not_greater_than_on_hand",
                table: "inventory_balances");

            migrationBuilder.DropCheckConstraint(
                name: "CK_inventory_balances_picked_non_negative",
                table: "inventory_balances");

            migrationBuilder.DropCheckConstraint(
                name: "CK_inventory_balances_reserved_non_negative",
                table: "inventory_balances");

            migrationBuilder.DropColumn(
                name: "PickedQuantity",
                table: "sales_order_reservations");

            migrationBuilder.DropColumn(
                name: "PickedQuantity",
                table: "sales_order_lines");

            migrationBuilder.DropColumn(
                name: "PickedQuantity",
                table: "inventory_balances");

            migrationBuilder.AddCheckConstraint(
                name: "CK_sales_order_reservations_quantity_positive",
                table: "sales_order_reservations",
                sql: "\"Quantity\" > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_sales_order_lines_reserved_not_greater_than_ordered",
                table: "sales_order_lines",
                sql: "\"ReservedQuantity\" <= \"OrderedQuantity\"");

            migrationBuilder.AddCheckConstraint(
                name: "CK_inventory_balances_reserved_not_greater_than_on_hand",
                table: "inventory_balances",
                sql: "\"ReservedQuantity\" <= \"OnHandQuantity\"");
        }
    }
}
