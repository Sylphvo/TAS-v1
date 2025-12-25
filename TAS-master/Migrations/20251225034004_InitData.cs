using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TAS.Migrations
{
    /// <inheritdoc />
    public partial class InitData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RubberAgent",
                columns: table => new
                {
                    AgentId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AgentCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AgentName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    OwnerName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    AgentPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    AgentAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RegisterDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSDATETIME()"),
                    RegisterPerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatePerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubberAgent", x => x.AgentId);
                    table.UniqueConstraint("AK_RubberAgent_AgentCode", x => x.AgentCode);
                });

            migrationBuilder.CreateTable(
                name: "RubberType",
                columns: table => new
                {
                    TypeId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TypeCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TypeName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatePerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubberType", x => x.TypeId);
                });

            migrationBuilder.CreateTable(
                name: "USER_ACCOUNT",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LogInUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LogOutUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USER_ACCOUNT", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "USER_ROLE",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USER_ROLE", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RubberFarm",
                columns: table => new
                {
                    FarmId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FarmCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AgentCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FarmerName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FarmPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FarmAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RegisterDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSDATETIME()"),
                    RegisterPerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatePerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Polygon = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubberFarm", x => x.FarmId);
                    table.UniqueConstraint("AK_RubberFarm_FarmCode", x => x.FarmCode);
                    table.ForeignKey(
                        name: "FK_RubberFarm_RubberAgent_AgentCode",
                        column: x => x.AgentCode,
                        principalTable: "RubberAgent",
                        principalColumn: "AgentCode",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RubberOrder",
                columns: table => new
                {
                    OrderId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AgentCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BuyerName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    BuyerCompany = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpectedShipDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ShippedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProductType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TotalNetKg = table.Column<decimal>(type: "decimal(10,2)", nullable: false, defaultValue: 0.00m),
                    Status = table.Column<byte>(type: "tinyint", nullable: false, defaultValue: (byte)1),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RegisterDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSDATETIME()"),
                    RegisterPerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatePerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubberOrder", x => x.OrderId);
                    table.ForeignKey(
                        name: "FK_RubberOrder_RubberAgent_AgentCode",
                        column: x => x.AgentCode,
                        principalTable: "RubberAgent",
                        principalColumn: "AgentCode",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RubberPond",
                columns: table => new
                {
                    PondId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PondCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AgentCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PondName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CapacityKg = table.Column<decimal>(type: "decimal(10,2)", nullable: false, defaultValue: 50000.00m),
                    DailyCapacityKg = table.Column<decimal>(type: "decimal(10,2)", nullable: false, defaultValue: 5000.00m),
                    CurrentNetKg = table.Column<decimal>(type: "decimal(10,2)", nullable: false, defaultValue: 0.00m),
                    Status = table.Column<byte>(type: "tinyint", nullable: false, defaultValue: (byte)1),
                    RegisterDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSDATETIME()"),
                    RegisterPerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatePerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubberPond", x => x.PondId);
                    table.ForeignKey(
                        name: "FK_RubberPond_RubberAgent_AgentCode",
                        column: x => x.AgentCode,
                        principalTable: "RubberAgent",
                        principalColumn: "AgentCode",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "USER_CLAIM",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USER_CLAIM", x => x.Id);
                    table.ForeignKey(
                        name: "FK_USER_CLAIM_USER_ACCOUNT_UserId",
                        column: x => x.UserId,
                        principalTable: "USER_ACCOUNT",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "USER_LOGIN",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USER_LOGIN", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_USER_LOGIN_USER_ACCOUNT_UserId",
                        column: x => x.UserId,
                        principalTable: "USER_ACCOUNT",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "USER_TOKEN",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USER_TOKEN", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_USER_TOKEN_USER_ACCOUNT_UserId",
                        column: x => x.UserId,
                        principalTable: "USER_ACCOUNT",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ROLE_CLAIM",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ROLE_CLAIM", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ROLE_CLAIM_USER_ROLE_RoleId",
                        column: x => x.RoleId,
                        principalTable: "USER_ROLE",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "USER_IN_ROLE",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USER_IN_ROLE", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_USER_IN_ROLE_USER_ACCOUNT_UserId",
                        column: x => x.UserId,
                        principalTable: "USER_ACCOUNT",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_USER_IN_ROLE_USER_ROLE_RoleId",
                        column: x => x.RoleId,
                        principalTable: "USER_ROLE",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RubberIntake",
                columns: table => new
                {
                    IntakeId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IntakeCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FarmCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FarmerName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    RubberKg = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    TSCPercent = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    FinishedProductKg = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Status = table.Column<byte>(type: "tinyint", nullable: false, defaultValue: (byte)1),
                    RegisterDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSDATETIME()"),
                    RegisterPerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatePerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubberIntake", x => x.IntakeId);
                    table.ForeignKey(
                        name: "FK_RubberIntake_RubberFarm_FarmCode",
                        column: x => x.FarmCode,
                        principalTable: "RubberFarm",
                        principalColumn: "FarmCode",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RubberOrderPond",
                columns: table => new
                {
                    OrderPondId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<long>(type: "bigint", nullable: false),
                    PondId = table.Column<long>(type: "bigint", nullable: false),
                    AllocatedKg = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    LoadedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BatchNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubberOrderPond", x => x.OrderPondId);
                    table.ForeignKey(
                        name: "FK_RubberOrderPond_RubberOrder_OrderId",
                        column: x => x.OrderId,
                        principalTable: "RubberOrder",
                        principalColumn: "OrderId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RubberOrderPond_RubberPond_PondId",
                        column: x => x.PondId,
                        principalTable: "RubberPond",
                        principalColumn: "PondId");
                });

            migrationBuilder.CreateTable(
                name: "RubberPallets",
                columns: table => new
                {
                    PalletId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<long>(type: "bigint", nullable: false),
                    PondId = table.Column<long>(type: "bigint", nullable: true),
                    PalletCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PalletName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PalletNo = table.Column<int>(type: "int", nullable: false),
                    WeightKg = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    StandardWeightKg = table.Column<decimal>(type: "decimal(10,2)", nullable: false, defaultValue: 2325.00m),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Status = table.Column<byte>(type: "tinyint", nullable: false, defaultValue: (byte)1),
                    RegisterDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSDATETIME()"),
                    RegisterPerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatePerson = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubberPallets", x => x.PalletId);
                    table.ForeignKey(
                        name: "FK_RubberPallets_RubberOrder_OrderId",
                        column: x => x.OrderId,
                        principalTable: "RubberOrder",
                        principalColumn: "OrderId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RubberPallets_RubberPond_PondId",
                        column: x => x.PondId,
                        principalTable: "RubberPond",
                        principalColumn: "PondId");
                });

            migrationBuilder.CreateTable(
                name: "RubberPondIntake",
                columns: table => new
                {
                    PondIntakeId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PondId = table.Column<long>(type: "bigint", nullable: false),
                    IntakeId = table.Column<long>(type: "bigint", nullable: false),
                    PouredKg = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    PouredAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubberPondIntake", x => x.PondIntakeId);
                    table.ForeignKey(
                        name: "FK_RubberPondIntake_RubberIntake_IntakeId",
                        column: x => x.IntakeId,
                        principalTable: "RubberIntake",
                        principalColumn: "IntakeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RubberPondIntake_RubberPond_PondId",
                        column: x => x.PondId,
                        principalTable: "RubberPond",
                        principalColumn: "PondId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ROLE_CLAIM_RoleId",
                table: "ROLE_CLAIM",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_RubberAgent_AgentCode",
                table: "RubberAgent",
                column: "AgentCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RubberFarm_AgentCode",
                table: "RubberFarm",
                column: "AgentCode");

            migrationBuilder.CreateIndex(
                name: "IX_RubberFarm_FarmCode",
                table: "RubberFarm",
                column: "FarmCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RubberIntake_FarmCode",
                table: "RubberIntake",
                column: "FarmCode");

            migrationBuilder.CreateIndex(
                name: "IX_RubberOrder_AgentCode",
                table: "RubberOrder",
                column: "AgentCode");

            migrationBuilder.CreateIndex(
                name: "IX_RubberOrder_OrderCode",
                table: "RubberOrder",
                column: "OrderCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RubberOrderPond_OrderId",
                table: "RubberOrderPond",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_RubberOrderPond_PondId",
                table: "RubberOrderPond",
                column: "PondId");

            migrationBuilder.CreateIndex(
                name: "IX_RubberPallets_OrderId",
                table: "RubberPallets",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_RubberPallets_PalletCode",
                table: "RubberPallets",
                column: "PalletCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RubberPallets_PondId",
                table: "RubberPallets",
                column: "PondId");

            migrationBuilder.CreateIndex(
                name: "IX_RubberPond_AgentCode",
                table: "RubberPond",
                column: "AgentCode");

            migrationBuilder.CreateIndex(
                name: "IX_RubberPond_PondCode",
                table: "RubberPond",
                column: "PondCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RubberPondIntake_IntakeId",
                table: "RubberPondIntake",
                column: "IntakeId");

            migrationBuilder.CreateIndex(
                name: "IX_RubberPondIntake_PondId",
                table: "RubberPondIntake",
                column: "PondId");

            migrationBuilder.CreateIndex(
                name: "IX_RubberType_TypeCode",
                table: "RubberType",
                column: "TypeCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "USER_ACCOUNT",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_USER_ACCOUNT_Email",
                table: "USER_ACCOUNT",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_USER_ACCOUNT_UserName",
                table: "USER_ACCOUNT",
                column: "UserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "USER_ACCOUNT",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_USER_CLAIM_UserId",
                table: "USER_CLAIM",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_USER_IN_ROLE_RoleId",
                table: "USER_IN_ROLE",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_USER_LOGIN_UserId",
                table: "USER_LOGIN",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "USER_ROLE",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ROLE_CLAIM");

            migrationBuilder.DropTable(
                name: "RubberOrderPond");

            migrationBuilder.DropTable(
                name: "RubberPallets");

            migrationBuilder.DropTable(
                name: "RubberPondIntake");

            migrationBuilder.DropTable(
                name: "RubberType");

            migrationBuilder.DropTable(
                name: "USER_CLAIM");

            migrationBuilder.DropTable(
                name: "USER_IN_ROLE");

            migrationBuilder.DropTable(
                name: "USER_LOGIN");

            migrationBuilder.DropTable(
                name: "USER_TOKEN");

            migrationBuilder.DropTable(
                name: "RubberOrder");

            migrationBuilder.DropTable(
                name: "RubberIntake");

            migrationBuilder.DropTable(
                name: "RubberPond");

            migrationBuilder.DropTable(
                name: "USER_ROLE");

            migrationBuilder.DropTable(
                name: "USER_ACCOUNT");

            migrationBuilder.DropTable(
                name: "RubberFarm");

            migrationBuilder.DropTable(
                name: "RubberAgent");
        }
    }
}
