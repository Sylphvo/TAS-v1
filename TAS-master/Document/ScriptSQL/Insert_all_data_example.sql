/* =========================================================
   TAS - Sample Seed Data (SQL Server) - OPTIMIZED VERSION
   Flow: Farm -> Agent -> Intake -> Pond -> Pallet(2325kg) -> Order
   Đồng bộ với TAS_Schema_Optimized.sql
   Rerunnable: Script tự xóa data sample trước khi chạy lại
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
-- Columns: AgentCode, AgentName, OwnerName, AgentPhone, AgentAddress, 
--          IsActive, RegisterDate, RegisterPerson
------------------------------------------------------------
INSERT INTO dbo.RubberAgent
(
    AgentCode, AgentName, OwnerName, AgentPhone, AgentAddress,
    IsActive, RegisterDate, RegisterPerson
)
VALUES
(@AgentCode1, N'Đại lý Bình Minh', N'Nguyễn Văn A', N'0901123456', N'Q1, TP.HCM', 
 1, @Now, @SeedPerson),
 
(@AgentCode2, N'Đại lý Hưng Thịnh', N'Trần Văn B', N'0902234567', N'Tân Uyên, Bình Dương', 
 1, @Now, @SeedPerson);

------------------------------------------------------------
-- 2) INSERT MASTER: Farms
-- Columns: FarmCode, AgentCode, FarmerName, FarmPhone, FarmAddress,
--          IsActive, RegisterDate, RegisterPerson
------------------------------------------------------------
INSERT INTO dbo.RubberFarm
(
    FarmCode, AgentCode, FarmerName, FarmPhone, FarmAddress,
    IsActive, RegisterDate, RegisterPerson
)
VALUES
(@FarmCode1, @AgentCode1, N'Vườn Cao Su An Phát', N'0901000001', N'Đồng Phú, Bình Phước',
 1, @Now, @SeedPerson),

(@FarmCode2, @AgentCode1, N'Vườn Cao Su Tân Lộc', N'0901000002', N'Chơn Thành, Bình Phước',
 1, @Now, @SeedPerson),

(@FarmCode3, @AgentCode2, N'Vườn Cao Su Phú Quý', N'0902000003', N'Bàu Bàng, Bình Dương',
 1, @Now, @SeedPerson),

(@FarmCode4, @AgentCode2, N'Vườn Cao Su Minh Tâm', N'0902000004', N'Dầu Tiếng, Bình Dương',
 1, @Now, @SeedPerson);

------------------------------------------------------------
-- 3) INSERT MASTER: RubberType
-- Columns: TypeCode, TypeName, UpdateDate, UpdatePerson
------------------------------------------------------------
INSERT INTO dbo.RubberType (TypeCode, TypeName, UpdateDate, UpdatePerson)
VALUES
(N'LATEX',   N'Mủ nước / Latex', @Now, @SeedPerson),
(N'CUPLUMP', N'Mủ chén / Cup-lump', @Now, @SeedPerson);

------------------------------------------------------------
-- 4) INSERT TRANSACTION: Intake (thu mua từ nhà vườn)
-- Columns: IntakeCode, FarmCode, FarmerName, RubberKg, TSCPercent,
--          FinishedProductKg, Status, RegisterDate, RegisterPerson
------------------------------------------------------------
DECLARE @Intake TABLE(Label NVARCHAR(10), IntakeId BIGINT);

-- Intake 1: FR001 - 8000kg
INSERT INTO dbo.RubberIntake
(
    IntakeCode, FarmCode, FarmerName,
    RubberKg, TSCPercent, FinishedProductKg,
    Status, RegisterDate, RegisterPerson
)
OUTPUT 'IN001', inserted.IntakeId INTO @Intake(Label, IntakeId)
VALUES
(N'INT_20251219_001', @FarmCode1, N'Vườn Cao Su An Phát',
 8000.000, 32.50, 2600.000,
 1, DATEADD(DAY,-3,@Now), @SeedPerson);

-- Intake 2: FR002 - 7000kg
INSERT INTO dbo.RubberIntake
(
    IntakeCode, FarmCode, FarmerName,
    RubberKg, TSCPercent, FinishedProductKg,
    Status, RegisterDate, RegisterPerson
)
OUTPUT 'IN002', inserted.IntakeId INTO @Intake(Label, IntakeId)
VALUES
(N'INT_20251220_002', @FarmCode2, N'Vườn Cao Su Tân Lộc',
 7000.000, 31.20, 2184.000,
 1, DATEADD(DAY,-2,@Now), @SeedPerson);

-- Intake 3: FR003 - 6000kg
INSERT INTO dbo.RubberIntake
(
    IntakeCode, FarmCode, FarmerName,
    RubberKg, TSCPercent, FinishedProductKg,
    Status, RegisterDate, RegisterPerson
)
OUTPUT 'IN003', inserted.IntakeId INTO @Intake(Label, IntakeId)
VALUES
(N'INT_20251219_003', @FarmCode3, N'Vườn Cao Su Phú Quý',
 6000.000, 33.10, 1986.000,
 1, DATEADD(DAY,-3,@Now), @SeedPerson);

-- Intake 4: FR004 - 6000kg
INSERT INTO dbo.RubberIntake
(
    IntakeCode, FarmCode, FarmerName,
    RubberKg, TSCPercent, FinishedProductKg,
    Status, RegisterDate, RegisterPerson
)
OUTPUT 'IN004', inserted.IntakeId INTO @Intake(Label, IntakeId)
VALUES
(N'INT_20251221_004', @FarmCode4, N'Vườn Cao Su Minh Tâm',
 6000.000, 32.80, 1968.000,
 1, DATEADD(DAY,-1,@Now), @SeedPerson);

-- Lấy IntakeId
SELECT @Intake1Id = IntakeId FROM @Intake WHERE Label='IN001';
SELECT @Intake2Id = IntakeId FROM @Intake WHERE Label='IN002';
SELECT @Intake3Id = IntakeId FROM @Intake WHERE Label='IN003';
SELECT @Intake4Id = IntakeId FROM @Intake WHERE Label='IN004';

------------------------------------------------------------
-- 5) INSERT PROCESS: Pond (hồ xử lý)
-- Columns: PondCode, AgentCode, PondName, CapacityKg, DailyCapacityKg,
--          CurrentNetKg, Status, RegisterDate, RegisterPerson
------------------------------------------------------------
INSERT INTO dbo.RubberPond
(
    PondCode, AgentCode, PondName,
    CapacityKg, DailyCapacityKg, CurrentNetKg, Status,
    RegisterDate, RegisterPerson
)
VALUES
(@PondCode1, @AgentCode1, N'Hồ 01 - AG001',
 50000.000, 5000.000, 0.000, 1,
 @Now, @SeedPerson);

SET @Pond1Id = SCOPE_IDENTITY();

INSERT INTO dbo.RubberPond
(
    PondCode, AgentCode, PondName,
    CapacityKg, DailyCapacityKg, CurrentNetKg, Status,
    RegisterDate, RegisterPerson
)
VALUES
(@PondCode2, @AgentCode2, N'Hồ 01 - AG002',
 50000.000, 5000.000, 0.000, 1,
 @Now, @SeedPerson);

SET @Pond2Id = SCOPE_IDENTITY();

------------------------------------------------------------
-- 6) INSERT BRIDGE: PondIntake (đổ intake vào hồ)
-- Columns: PondId, IntakeId, PouredKg, PouredAt
------------------------------------------------------------
INSERT INTO dbo.RubberPondIntake (PondId, IntakeId, PouredKg, PouredAt)
VALUES
(@Pond1Id, @Intake1Id, 2600.000, DATEADD(DAY,-3,@Now)),
(@Pond1Id, @Intake2Id, 2184.000, DATEADD(DAY,-2,@Now)),
(@Pond2Id, @Intake3Id, 1986.000, DATEADD(DAY,-3,@Now)),
(@Pond2Id, @Intake4Id, 1968.000, DATEADD(DAY,-1,@Now));

-- Cập nhật CurrentNetKg của Pond
UPDATE dbo.RubberPond
SET CurrentNetKg = (
    SELECT SUM(PouredKg)
    FROM dbo.RubberPondIntake
    WHERE PondId = dbo.RubberPond.PondId
)
WHERE PondId IN (@Pond1Id, @Pond2Id);

-- Cập nhật Status của Intake thành "Đã vào hồ"
UPDATE dbo.RubberIntake
SET Status = 2, UpdateDate = @Now, UpdatePerson = @SeedPerson
WHERE IntakeId IN (@Intake1Id, @Intake2Id, @Intake3Id, @Intake4Id);

------------------------------------------------------------
-- 7) INSERT SHIPPING: Orders
-- Columns: OrderCode, AgentCode, BuyerName, BuyerCompany, OrderDate,
--          ExpectedShipDate, ProductType, TotalNetKg, Status, Note,
--          RegisterDate, RegisterPerson
------------------------------------------------------------
INSERT INTO dbo.RubberOrder
(
    OrderCode, AgentCode, BuyerName, BuyerCompany,
    OrderDate, ExpectedShipDate,
    ProductType, TotalNetKg, Status, Note,
    RegisterDate, RegisterPerson
)
VALUES
(@OrderCode1, @AgentCode1, N'Nguyễn Khách 1', N'Công ty Cao Su Xuất Khẩu A',
 CAST(@Now AS DATE), DATEADD(DAY,3,@Now),
 N'LATEX', 6975.000, 1, N'Order seed AG001 (3 pallets)',
 @Now, @SeedPerson);

SET @Order1Id = SCOPE_IDENTITY();

INSERT INTO dbo.RubberOrder
(
    OrderCode, AgentCode, BuyerName, BuyerCompany,
    OrderDate, ExpectedShipDate,
    ProductType, TotalNetKg, Status, Note,
    RegisterDate, RegisterPerson
)
VALUES
(@OrderCode2, @AgentCode2, N'Trần Khách 2', N'Công ty Cao Su Xuất Khẩu B',
 CAST(@Now AS DATE), DATEADD(DAY,5,@Now),
 N'LATEX', 9300.000, 1, N'Order seed AG002 (4 pallets)',
 @Now, @SeedPerson);

SET @Order2Id = SCOPE_IDENTITY();

------------------------------------------------------------
-- 8) INSERT BRIDGE: OrderPond (đơn lấy từ hồ bao nhiêu)
-- Columns: OrderId, PondId, AllocatedKg, LoadedAt, BatchNo
------------------------------------------------------------
INSERT INTO dbo.RubberOrderPond (OrderId, PondId, AllocatedKg, LoadedAt, BatchNo)
VALUES
(@Order1Id, @Pond1Id, 4784.000, @Now, N'BATCH-AG001-001'),
(@Order2Id, @Pond2Id, 3954.000, @Now, N'BATCH-AG002-001');

------------------------------------------------------------
-- 9) INSERT OUTPUT: Pallets (2325kg/pallet)
-- Columns: OrderId, PondId, PalletCode, PalletName, PalletNo, WeightKg,
--          StandardWeightKg, IsActive, Status, RegisterDate, RegisterPerson
------------------------------------------------------------

-- Order 1: 4784kg = 2 pallet đầy (2325×2) + 1 pallet lẻ (134kg)
INSERT INTO dbo.RubberPallets
(OrderId, PondId, PalletCode, PalletName, PalletNo, WeightKg, StandardWeightKg, IsActive, Status, RegisterDate, RegisterPerson)
VALUES
(@Order1Id, @Pond1Id, CONCAT(@OrderCode1, N'__PL_001'), N'Pallet 001', 1, 2325.000, 2325.000, 1, 1, @Now, @SeedPerson),
(@Order1Id, @Pond1Id, CONCAT(@OrderCode1, N'__PL_002'), N'Pallet 002', 2, 2325.000, 2325.000, 1, 1, @Now, @SeedPerson),
(@Order1Id, @Pond1Id, CONCAT(@OrderCode1, N'__PL_003'), N'Pallet 003', 3, 134.000,  2325.000, 1, 1, @Now, @SeedPerson);

-- Order 2: 3954kg = 1 pallet đầy (2325) + 1 pallet lẻ (1629kg)
INSERT INTO dbo.RubberPallets
(OrderId, PondId, PalletCode, PalletName, PalletNo, WeightKg, StandardWeightKg, IsActive, Status, RegisterDate, RegisterPerson)
VALUES
(@Order2Id, @Pond2Id, CONCAT(@OrderCode2, N'__PL_001'), N'Pallet 001', 1, 2325.000, 2325.000, 1, 1, @Now, @SeedPerson),
(@Order2Id, @Pond2Id, CONCAT(@OrderCode2, N'__PL_002'), N'Pallet 002', 2, 1629.000, 2325.000, 1, 1, @Now, @SeedPerson);

-- Cập nhật CurrentNetKg của Pond sau khi xuất
UPDATE dbo.RubberPond
SET CurrentNetKg = CurrentNetKg - (
    SELECT ISNULL(SUM(AllocatedKg), 0)
    FROM dbo.RubberOrderPond
    WHERE PondId = dbo.RubberPond.PondId
)
WHERE PondId IN (@Pond1Id, @Pond2Id);

------------------------------------------------------------
-- 10) INSERT USER: Admin Account
-- Columns: Id, FirstName, LastName, IsActive, CreatedAtUtc, CreatedBy,
--          UserName, NormalizedUserName, Email, NormalizedEmail,
--          EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp,
--          PhoneNumber, PhoneNumberConfirmed, TwoFactorEnabled,
--          LockoutEnd, LockoutEnabled, AccessFailedCount
------------------------------------------------------------

-- Kiểm tra nếu chưa có user admin
IF NOT EXISTS (SELECT 1 FROM dbo.USER_ACCOUNT WHERE UserName = N'admin')
BEGIN
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
        -- Password: Admin@123 (BCrypt hash - thay bằng hash thật từ ASP.NET Identity)
        N'AQAAAAIAAYagAAAAEGK3VN8rQ7pZJZ5hJ6tKWLxYHJ8vP8F6KjNxLMOvWqRsTpQvD9zYCQ==',
        CONVERT(NVARCHAR(36), NEWID()), 
        CONVERT(NVARCHAR(36), NEWID()),
        NULL, 0, 0,
        NULL, 1, 0
    );
    
    PRINT 'Admin user created: username=admin';
END
ELSE
BEGIN
    PRINT 'Admin user already exists, skipped.';
END

COMMIT TRAN;

------------------------------------------------------------
-- VERIFY DATA
------------------------------------------------------------
PRINT '';
PRINT '========================================';
PRINT 'SEED DATA SUMMARY';
PRINT '========================================';
PRINT '';

SELECT 'Agents' AS Category, COUNT(*) AS Count FROM dbo.RubberAgent WHERE RegisterPerson = @SeedPerson
UNION ALL
SELECT 'Farms', COUNT(*) FROM dbo.RubberFarm WHERE RegisterPerson = @SeedPerson
UNION ALL
SELECT 'Types', COUNT(*) FROM dbo.RubberType WHERE UpdatePerson = @SeedPerson
UNION ALL
SELECT 'Intakes', COUNT(*) FROM dbo.RubberIntake WHERE RegisterPerson = @SeedPerson
UNION ALL
SELECT 'Ponds', COUNT(*) FROM dbo.RubberPond WHERE RegisterPerson = @SeedPerson
UNION ALL
SELECT 'PondIntakes', COUNT(*) FROM dbo.RubberPondIntake
UNION ALL
SELECT 'Orders', COUNT(*) FROM dbo.RubberOrder WHERE RegisterPerson = @SeedPerson
UNION ALL
SELECT 'OrderPonds', COUNT(*) FROM dbo.RubberOrderPond
UNION ALL
SELECT 'Pallets', COUNT(*) FROM dbo.RubberPallets WHERE RegisterPerson = @SeedPerson;

PRINT '';
PRINT '✅ Seed completed successfully!';
PRINT '';
PRINT 'Sample data created:';
PRINT '  - 2 Agents (AG001, AG002)';
PRINT '  - 4 Farms (FR001-FR004)';
PRINT '  - 2 Rubber Types (LATEX, CUPLUMP)';
PRINT '  - 4 Intakes (total ~27,000kg raw rubber)';
PRINT '  - 2 Ponds';
PRINT '  - 4 PondIntake records';
PRINT '  - 2 Orders';
PRINT '  - 2 OrderPond records';
PRINT '  - 5 Pallets (2325kg each, except last ones)';
PRINT '  - 1 Admin user (if not exists)';
PRINT '';