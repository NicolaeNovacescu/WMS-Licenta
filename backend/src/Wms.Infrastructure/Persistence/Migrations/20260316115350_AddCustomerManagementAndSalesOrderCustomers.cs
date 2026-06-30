using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wms.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerManagementAndSalesOrderCustomers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                table: "sales_orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "customers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customers", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_sales_orders_CustomerId",
                table: "sales_orders",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_customers_Code",
                table: "customers",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_sales_orders_customers_CustomerId",
                table: "sales_orders",
                column: "CustomerId",
                principalTable: "customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_sales_orders_customers_CustomerId",
                table: "sales_orders");

            migrationBuilder.DropTable(
                name: "customers");

            migrationBuilder.DropIndex(
                name: "IX_sales_orders_CustomerId",
                table: "sales_orders");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "sales_orders");
        }
    }
}
