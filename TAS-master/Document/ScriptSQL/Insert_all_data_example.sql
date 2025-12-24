/* =========================================================
   TAS - Sample Seed Data (SQL Server)
   Flow: Farm -> Agent -> Intake -> Pond -> Pallet(2325kg) -> Order
   Rerunnable: script tự dọn data sample theo code đã tạo
   ========================================================= */

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRAN;

DECLARE @Now DATETIME2(0) = SYSDATETIME();

DECLARE @AgentCode1 NVARCHAR(50) = N'AG001';
DECLARE @AgentCode2 NVARCHAR(50) = N'AG002';

DECLARE @FarmCode1 NVARCHAR(50) = N'FR001';
DECLARE @FarmCode2 NVARCHAR(50) = N'FR002';
DECLARE @FarmCode3 NVARCHAR(50) = N'FR003';
DECLARE @FarmCode4 NVARCHAR(50) = N'FR004';

DECLARE @PondCode1 NVARCHAR(50) = N'POND__AG001__001';
DECLARE @PondCode2 NVARCHAR(50) = N'POND__AG002__001';

DECLARE @OrderCode1 NVARCHAR(50) = N'ORD__20251222__AG001__001';
DECLARE @OrderCode2 NVARCHAR(50) = N'ORD__20251222__AG002__001';

DECLARE @SeedPerson NVARCHAR(50) = N'SEED';

DECLARE @Order1Id BIGINT, @Order2Id BIGINT;
DECLARE @Pond1Id BIGINT,  @Pond2Id BIGINT;

DECLARE @Intake1Id BIGINT, @Intake2Id BIGINT, @Intake3Id BIGINT, @Intake4Id BIGINT;

------------------------------------------------------------
-- 0) CLEANUP sample data (để chạy lại không bị trùng)
------------------------------------------------------------
SELECT @Order1Id = OrderId FROM dbo.RubberOrder WHERE OrderCode = @OrderCode1;
SELECT @Order2Id = OrderId FROM dbo.RubberOrder WHERE OrderCode = @OrderCode2;

IF @Order1Id IS NOT NULL
BEGIN
    DELETE FROM dbo.RubberOrderPond WHERE OrderId = @Order1Id;
    DELETE FROM dbo.RubberPallets  WHERE OrderId = @Order1Id;
    DELETE FROM dbo.RubberOrder    WHERE OrderId = @Order1Id;
END

IF @Order2Id IS NOT NULL
BEGIN
    DELETE FROM dbo.RubberOrderPond WHERE OrderId = @Order2Id;
    DELETE FROM dbo.RubberPallets  WHERE OrderId = @Order2Id;
    DELETE FROM dbo.RubberOrder    WHERE OrderId = @Order2Id;
END

SELECT @Pond1Id = PondId FROM dbo.RubberPond WHERE PondCode = @PondCode1;
SELECT @Pond2Id = PondId FROM dbo.RubberPond WHERE PondCode = @PondCode2;

IF @Pond1Id IS NOT NULL
BEGIN
    DELETE FROM dbo.RubberPondIntake WHERE PondId = @Pond1Id;
    DELETE FROM dbo.RubberPond       WHERE PondId = @Pond1Id;
END

IF @Pond2Id IS NOT NULL
BEGIN
    DELETE FROM dbo.RubberPondIntake WHERE PondId = @Pond2Id;
    DELETE FROM dbo.RubberPond       WHERE PondId = @Pond2Id;
END

-- intake sample: xóa theo RegisterPerson = SEED (an toàn)
DELETE FROM dbo.RubberIntake WHERE RegisterPerson = @SeedPerson;

-- farms & agents sample: xóa theo code
DELETE FROM dbo.RubberFarm WHERE FarmCode IN (@FarmCode1,@FarmCode2,@FarmCode3,@FarmCode4);
DELETE FROM dbo.RubberType WHERE TypeCode IN (N'LATEX', N'CUPLUMP');
DELETE FROM dbo.RubberAgent WHERE AgentCode IN (@AgentCode1,@AgentCode2);

------------------------------------------------------------
-- 1) INSERT MASTER: Agents
------------------------------------------------------------
INSERT INTO dbo.RubberAgent
(
    AgentCode, AgentName, OwnerName, TaxCode, AgentAddress,
    IsActive, RegisterDate, RegisterPerson, UpdateDate, UpdatePerson
)
VALUES
(@AgentCode1, N'Đại lý Bình Minh', N'Nguyễn Văn A', N'0101010101', N'Q1, TP.HCM', 1, @Now, @SeedPerson, NULL, NULL),
(@AgentCode2, N'Đại lý Hưng Thịnh', N'Trần Văn B',   N'0202020202', N'Tân Uyên, Bình Dương', 1, @Now, @SeedPerson, NULL, NULL);

------------------------------------------------------------
-- 2) INSERT MASTER: Farms
------------------------------------------------------------
INSERT INTO dbo.RubberFarm
(
    FarmCode, AgentCode, FarmerName, FarmPhone, FarmAddress, Certificates,
    TotalAreaHa, RubberAreaHa, TotalExploit,
    IsActive, RegisterDate, RegisterPerson, UpdateDate, UpdatePerson, Polygon
)
VALUES
(@FarmCode1, @AgentCode1, N'Vườn Cao Su An Phát', N'0901000001', N'Đồng Phú, Bình Phước', N'VietGAP',
 12.500, 10.000, 50000.000, 1, @Now, @SeedPerson, NULL, NULL, NULL),

(@FarmCode2, @AgentCode1, N'Vườn Cao Su Tân Lộc', N'0901000002', N'Chơn Thành, Bình Phước', N'',
  8.000,  7.200, 30000.000, 1, @Now, @SeedPerson, NULL, NULL, NULL),

(@FarmCode3, @AgentCode2, N'Vườn Cao Su Phú Quý', N'0902000003', N'Bàu Bàng, Bình Dương', N'FSC',
 15.000, 12.500, 60000.000, 1, @Now, @SeedPerson, NULL, NULL, NULL),

(@FarmCode4, @AgentCode2, N'Vườn Cao Su Minh Tâm', N'0902000004', N'Dầu Tiếng, Bình Dương', N'',
  9.500,  8.000, 40000.000, 1, @Now, @SeedPerson, NULL, NULL, NULL);

------------------------------------------------------------
-- 3) INSERT MASTER: RubberType
------------------------------------------------------------
INSERT INTO dbo.RubberType (TypeCode, TypeName, UpdateDate, UpdatePerson)
VALUES
(N'LATEX',   N'Mủ nước / Latex', @Now, @SeedPerson),
(N'CUPLUMP', N'Mủ chén / Cup-lump', @Now, @SeedPerson);

------------------------------------------------------------
-- 4) INSERT TRANSACTION: Intake (thu mua từ nhà vườn)
------------------------------------------------------------
DECLARE @Intake TABLE(Label NVARCHAR(10), IntakeId BIGINT);

INSERT INTO dbo.RubberIntake
(
    FarmCode, OrderCode, FarmerName,
    RubberKg, TSCPercent, DRCPercent, FinishedProductKg, CentrifugeProductKg,
    Status, RegisterDate, RegisterPerson, UpdateDate, UpdatePerson
)
OUTPUT 'IN001', inserted.IntakeId INTO @Intake(Label, IntakeId)
VALUES
(@FarmCode1, NULL, N'Vườn Cao Su An Phát',
 8000.000, 32.50, 30.10, 2408.000, 0.000,
 1, DATEADD(DAY,-3,@Now), @SeedPerson, NULL, NULL);

INSERT INTO dbo.RubberIntake
(
    FarmCode, OrderCode, FarmerName,
    RubberKg, TSCPercent, DRCPercent, FinishedProductKg, CentrifugeProductKg,
    Status, RegisterDate, RegisterPerson, UpdateDate, UpdatePerson
)
OUTPUT 'IN002', inserted.IntakeId INTO @Intake(Label, IntakeId)
VALUES
(@FarmCode2, NULL, N'Vườn Cao Su Tân Lộc',
 7000.000, 31.20, 29.80, 2086.000, 0.000,
 1, DATEADD(DAY,-2,@Now), @SeedPerson, NULL, NULL);

INSERT INTO dbo.RubberIntake
(
    FarmCode, OrderCode, FarmerName,
    RubberKg, TSCPercent, DRCPercent, FinishedProductKg, CentrifugeProductKg,
    Status, RegisterDate, RegisterPerson, UpdateDate, UpdatePerson
)
OUTPUT 'IN003', inserted.IntakeId INTO @Intake(Label, IntakeId)
VALUES
(@FarmCode3, NULL, N'Vườn Cao Su Phú Quý',
 6000.000, 33.10, 31.00, 1860.000, 0.000,
 1, DATEADD(DAY,-3,@Now), @SeedPerson, NULL, NULL);

INSERT INTO dbo.RubberIntake
(
    FarmCode, OrderCode, FarmerName,
    RubberKg, TSCPercent, DRCPercent, FinishedProductKg, CentrifugeProductKg,
    Status, RegisterDate, RegisterPerson, UpdateDate, UpdatePerson
)
OUTPUT 'IN004', inserted.IntakeId INTO @Intake(Label, IntakeId)
VALUES
(@FarmCode4, NULL, N'Vườn Cao Su Minh Tâm',
 6000.000, 32.80, 30.50, 1830.000, 0.000,
 1, DATEADD(DAY,-1,@Now), @SeedPerson, NULL, NULL);

SELECT @Intake1Id = IntakeId FROM @Intake WHERE Label='IN001';
SELECT @Intake2Id = IntakeId FROM @Intake WHERE Label='IN002';
SELECT @Intake3Id = IntakeId FROM @Intake WHERE Label='IN003';
SELECT @Intake4Id = IntakeId FROM @Intake WHERE Label='IN004';

------------------------------------------------------------
-- 5) INSERT PROCESS: Pond (hồ xử lý)
------------------------------------------------------------
INSERT INTO dbo.RubberPond
(
    PondCode, AgentCode, PondName, Location,
    CapacityKg, CurrentNetKg, Status, LastCleanedAt, Note,
    RegisterDate, RegisterPerson, UpdateDate, UpdatePerson
)
VALUES
(@PondCode1, @AgentCode1, N'Hồ 01 - AG001', N'Nhà máy Khu A',
 50000.000, 8025.000, 1, DATEADD(DAY,-10,@Now), N'Seed pond AG001',
 @Now, @SeedPerson, NULL, NULL);

SET @Pond1Id = SCOPE_IDENTITY();

INSERT INTO dbo.RubberPond
(
    PondCode, AgentCode, PondName, Location,
    CapacityKg, CurrentNetKg, Status, LastCleanedAt, Note,
    RegisterDate, RegisterPerson, UpdateDate, UpdatePerson
)
VALUES
(@PondCode2, @AgentCode2, N'Hồ 01 - AG002', N'Nhà máy Khu B',
 50000.000, 2700.000, 1, DATEADD(DAY,-8,@Now), N'Seed pond AG002',
 @Now, @SeedPerson, NULL, NULL);

SET @Pond2Id = SCOPE_IDENTITY();

------------------------------------------------------------
-- 6) INSERT BRIDGE: PondIntake (đổ intake vào hồ)
------------------------------------------------------------
INSERT INTO dbo.RubberPondIntake (PondId, IntakeId, PouredKg, PouredAt)
VALUES
(@Pond1Id, @Intake1Id, 8000.000, DATEADD(DAY,-3,@Now)),
(@Pond1Id, @Intake2Id, 7000.000, DATEADD(DAY,-2,@Now)),
(@Pond2Id, @Intake3Id, 6000.000, DATEADD(DAY,-3,@Now)),
(@Pond2Id, @Intake4Id, 6000.000, DATEADD(DAY,-1,@Now));

------------------------------------------------------------
-- 7) INSERT SHIPPING: Orders
------------------------------------------------------------
INSERT INTO dbo.RubberOrder
(
    OrderCode, AgentCode, OrderDate, ExpectedShipDate, ShippedAt,
    BuyerName, BuyerCompany, ContractNo, Destination, DeliveryAddress,
    ProductType, TargetTSC, TargetDRC, TotalNetKg, UnitPrice, Status, Note,
    RegisterDate, RegisterPerson, UpdateDate, UpdatePerson
)
VALUES
(@OrderCode1, @AgentCode1, CAST(@Now AS DATE), DATEADD(DAY,3,@Now), NULL,
 N'Nguyễn Khách 1', N'Cty Cao Su Xuất Khẩu A', N'CTR-AG001-001', N'Cảng Cát Lái', N'Q2, TP.HCM',
 N'LATEX', 32.00, 30.00, 6975.000, 18500.00, 1, N'Order seed AG001 (3 pallets)',
 @Now, @SeedPerson, NULL, NULL);

SET @Order1Id = SCOPE_IDENTITY();

INSERT INTO dbo.RubberOrder
(
    OrderCode, AgentCode, OrderDate, ExpectedShipDate, ShippedAt,
    BuyerName, BuyerCompany, ContractNo, Destination, DeliveryAddress,
    ProductType, TargetTSC, TargetDRC, TotalNetKg, UnitPrice, Status, Note,
    RegisterDate, RegisterPerson, UpdateDate, UpdatePerson
)
VALUES
(@OrderCode2, @AgentCode2, CAST(@Now AS DATE), DATEADD(DAY,5,@Now), NULL,
 N'Trần Khách 2', N'Cty Cao Su Xuất Khẩu B', N'CTR-AG002-001', N'Cảng SP-ITC', N'Q7, TP.HCM',
 N'LATEX', 32.50, 30.50, 9300.000, 18650.00, 1, N'Order seed AG002 (4 pallets)',
 @Now, @SeedPerson, NULL, NULL);

SET @Order2Id = SCOPE_IDENTITY();

------------------------------------------------------------
-- 8) INSERT BRIDGE: OrderPond (đơn lấy từ hồ bao nhiêu)
--    Lưu ý: AllocatedKg là decimal? -> dùng decimal literal (0m tương đương 0.000)
------------------------------------------------------------
INSERT INTO dbo.RubberOrderPond (OrderId, PondId, AllocatedKg, LoadedAt, BatchNo)
VALUES
(@Order1Id, @Pond1Id, 6975.000, NULL, N'BATCH-AG001-001'),
(@Order2Id, @Pond2Id, 9300.000, NULL, N'BATCH-AG002-001');

------------------------------------------------------------
-- 9) INSERT OUTPUT: Pallets (2325kg/pallet)
--    Nếu đã migration thêm PondId thì insert có PondId, chưa có thì insert không PondId
------------------------------------------------------------
IF COL_LENGTH('dbo.RubberPallets','PondId') IS NOT NULL
BEGIN
    INSERT INTO dbo.RubberPallets
    (OrderId, PondId, PalletCode, PalletName, PalletNo, WeightKg, IsActive, RegisterDate, RegisterPerson, UpdateDate, UpdatePerson)
    VALUES
    (@Order1Id, @Pond1Id, CONCAT(@OrderCode1, N'__PL_001'), N'Pallet 001', 1, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),
    (@Order1Id, @Pond1Id, CONCAT(@OrderCode1, N'__PL_002'), N'Pallet 002', 2, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),
    (@Order1Id, @Pond1Id, CONCAT(@OrderCode1, N'__PL_003'), N'Pallet 003', 3, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),

    (@Order2Id, @Pond2Id, CONCAT(@OrderCode2, N'__PL_001'), N'Pallet 001', 1, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),
    (@Order2Id, @Pond2Id, CONCAT(@OrderCode2, N'__PL_002'), N'Pallet 002', 2, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),
    (@Order2Id, @Pond2Id, CONCAT(@OrderCode2, N'__PL_003'), N'Pallet 003', 3, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),
    (@Order2Id, @Pond2Id, CONCAT(@OrderCode2, N'__PL_004'), N'Pallet 004', 4, 2325.000, 1, @Now, @SeedPerson, NULL, NULL);
END
ELSE
BEGIN
    INSERT INTO dbo.RubberPallets
    (OrderId, PalletCode, PalletName, PalletNo, WeightKg, IsActive, RegisterDate, RegisterPerson, UpdateDate, UpdatePerson)
    VALUES
    (@Order1Id, CONCAT(@OrderCode1, N'__PL_001'), N'Pallet 001', 1, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),
    (@Order1Id, CONCAT(@OrderCode1, N'__PL_002'), N'Pallet 002', 2, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),
    (@Order1Id, CONCAT(@OrderCode1, N'__PL_003'), N'Pallet 003', 3, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),

    (@Order2Id, CONCAT(@OrderCode2, N'__PL_001'), N'Pallet 001', 1, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),
    (@Order2Id, CONCAT(@OrderCode2, N'__PL_002'), N'Pallet 002', 2, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),
    (@Order2Id, CONCAT(@OrderCode2, N'__PL_003'), N'Pallet 003', 3, 2325.000, 1, @Now, @SeedPerson, NULL, NULL),
    (@Order2Id, CONCAT(@OrderCode2, N'__PL_004'), N'Pallet 004', 4, 2325.000, 1, @Now, @SeedPerson, NULL, NULL);
END
INSERT INTO dbo.USER_ACCOUNT
(
  Id, FirstName, LastName, IsActive,
  CreatedAtUtc, CreatedBy, UpdatedAtUtc, UpdatedBy,
  LogInUtc, LogOutUtc,
  UserName, NormalizedUserName,
  Email, NormalizedEmail, EmailConfirmed,
  PasswordHash, SecurityStamp, ConcurrencyStamp,
  PhoneNumber, PhoneNumberConfirmed, TwoFactorEnabled,
  LockoutEnd, LockoutEnabled, AccessFailedCount
)
VALUES
(
  NEWID(), N'Admin', N'TAS', 1,
  SYSUTCDATETIME(), N'seed', SYSUTCDATETIME(), N'seed',
  NULL, NULL,
  N'admin', N'ADMIN',
  N'admin@tas.local', N'ADMIN@TAS.LOCAL', 1,
  N'$2b$10$EAyEiBtoKX3PhpGG/37lMuoS2jFTjSR8G1zuqMcSMm9F8HlHjdY8.',  -- dán hash thật vào đây (bcrypt/identity hash tuỳ hệ bạn)
  CONVERT(nvarchar(36), NEWID()), CONVERT(nvarchar(36), NEWID()),
  NULL, 0, 0,
  NULL, 1, 0
);
COMMIT TRAN;

PRINT 'Seed OK: Agents/Farms/Types/Intakes/Ponds/Orders/Pallets created.';
