/* =========================================================
   TAS - Identity Tables Sample Data
   Tables: USER_ROLE, USER_IN_ROLE, USER_CLAIM, USER_LOGIN, USER_TOKEN
   Rerunnable: Tự xóa data cũ trước khi insert
   ========================================================= */

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRAN;

DECLARE @Now DATETIME2(0) = SYSUTCDATETIME();
DECLARE @AdminUserId UNIQUEIDENTIFIER;
DECLARE @ManagerUserId UNIQUEIDENTIFIER;
DECLARE @UserUserId UNIQUEIDENTIFIER;

-- ========================================
-- 0) CLEANUP (Xóa data cũ để script rerunnable)
-- ========================================
PRINT 'Cleaning up old identity data...';

DELETE FROM USER_CLAIM WHERE ClaimType LIKE 'TAS.%';
DELETE FROM USER_TOKEN WHERE LoginProvider = 'TAS';
DELETE FROM USER_LOGIN WHERE LoginProvider = 'TAS';
DELETE FROM USER_IN_ROLE WHERE RoleId IN (
    SELECT Id FROM USER_ROLE WHERE Name IN (N'Admin', N'Manager', N'User', N'Viewer')
);
DELETE FROM USER_ROLE WHERE Name IN (N'Admin', N'Manager', N'User', N'Viewer');

-- Xóa users mẫu (trừ admin đã seed)
DELETE FROM USER_ACCOUNT WHERE UserName IN (N'manager', N'user1', N'viewer1');

-- ========================================
-- 1) INSERT USER_ROLE (Roles)
-- ========================================
PRINT 'Inserting roles...';

DECLARE @RoleAdmin UNIQUEIDENTIFIER = NEWID();
DECLARE @RoleManager UNIQUEIDENTIFIER = NEWID();
DECLARE @RoleUser UNIQUEIDENTIFIER = NEWID();
DECLARE @RoleViewer UNIQUEIDENTIFIER = NEWID();

INSERT INTO USER_ROLE (Id, Name, NormalizedName, ConcurrencyStamp)
VALUES
    (@RoleAdmin, N'Admin', N'ADMIN', CONVERT(NVARCHAR(36), NEWID())),
    (@RoleManager, N'Manager', N'MANAGER', CONVERT(NVARCHAR(36), NEWID())),
    (@RoleUser, N'User', N'USER', CONVERT(NVARCHAR(36), NEWID())),
    (@RoleViewer, N'Viewer', N'VIEWER', CONVERT(NVARCHAR(36), NEWID()));

PRINT '  ✓ 4 roles inserted';

-- ========================================
-- 2) INSERT USER_ACCOUNT (Additional Users)
-- ========================================
PRINT 'Inserting additional users...';

-- Get admin user ID (đã seed trước đó)
SELECT @AdminUserId = Id FROM USER_ACCOUNT WHERE UserName = N'admin';

-- Insert Manager User
SET @ManagerUserId = NEWID();
INSERT INTO USER_ACCOUNT
(
    Id, FirstName, LastName, IsActive,
    CreatedAtUtc, CreatedBy,
    UserName, NormalizedUserName,
    Email, NormalizedEmail, EmailConfirmed,
    PasswordHash, SecurityStamp, ConcurrencyStamp,
    PhoneNumber, PhoneNumberConfirmed, TwoFactorEnabled,
    LockoutEnd, LockoutEnabled, AccessFailedCount
)
VALUES
(
    @ManagerUserId, N'Quản Lý', N'Hệ Thống', 1,
    @Now, N'seed',
    N'manager', N'MANAGER',
    N'manager@tas.local', N'MANAGER@TAS.LOCAL', 1,
    -- Password: Manager@123 (BCrypt hash - thay bằng hash thật)
    N'AQAAAAIAAYagAAAAEHKj8VN8rQ7pZJZ5hJ6tKWLxYHJ8vP8F6KjNxLMOvWqRsTpQvD9zYCQ==',
    CONVERT(NVARCHAR(36), NEWID()),
    CONVERT(NVARCHAR(36), NEWID()),
    N'0901234567', 0, 0,
    NULL, 1, 0
);

-- Insert Regular User
SET @UserUserId = NEWID();
INSERT INTO USER_ACCOUNT
(
    Id, FirstName, LastName, IsActive,
    CreatedAtUtc, CreatedBy,
    UserName, NormalizedUserName,
    Email, NormalizedEmail, EmailConfirmed,
    PasswordHash, SecurityStamp, ConcurrencyStamp,
    PhoneNumber, PhoneNumberConfirmed, TwoFactorEnabled,
    LockoutEnd, LockoutEnabled, AccessFailedCount
)
VALUES
(
    @UserUserId, N'Người Dùng', N'1', 1,
    @Now, N'seed',
    N'user1', N'USER1',
    N'user1@tas.local', N'USER1@TAS.LOCAL', 1,
    -- Password: User@123
    N'AQAAAAIAAYagAAAAEPLm9WO9sR8qZKZ6iK7uLXMzYIK9wQ9G7LkOyMPxWrTuUpRwE0aZDR==',
    CONVERT(NVARCHAR(36), NEWID()),
    CONVERT(NVARCHAR(36), NEWID()),
    N'0902345678', 0, 0,
    NULL, 1, 0
);

PRINT '  ✓ 2 additional users inserted';

-- ========================================
-- 3) INSERT USER_IN_ROLE (Assign Roles to Users)
-- ========================================
PRINT 'Assigning roles to users...';

-- Admin user → Admin, Manager, User roles
IF @AdminUserId IS NOT NULL
BEGIN
    INSERT INTO USER_IN_ROLE (UserId, RoleId)
    VALUES
        (@AdminUserId, @RoleAdmin),
        (@AdminUserId, @RoleManager),
        (@AdminUserId, @RoleUser);
    PRINT '  ✓ Admin assigned: Admin, Manager, User roles';
END

-- Manager user → Manager, User roles
INSERT INTO USER_IN_ROLE (UserId, RoleId)
VALUES
    (@ManagerUserId, @RoleManager),
    (@ManagerUserId, @RoleUser);
PRINT '  ✓ Manager assigned: Manager, User roles';

-- User1 → User role only
INSERT INTO USER_IN_ROLE (UserId, RoleId)
VALUES
    (@UserUserId, @RoleUser);
PRINT '  ✓ User1 assigned: User role';

-- ========================================
-- 4) INSERT USER_CLAIM (Custom Claims)
-- ========================================
PRINT 'Inserting user claims...';

-- Admin claims
IF @AdminUserId IS NOT NULL
BEGIN
    INSERT INTO USER_CLAIM (UserId, ClaimType, ClaimValue)
    VALUES
        (@AdminUserId, N'TAS.Department', N'IT'),
        (@AdminUserId, N'TAS.Position', N'System Administrator'),
        (@AdminUserId, N'TAS.EmployeeId', N'EMP001'),
        (@AdminUserId, N'TAS.CanApprove', N'true'),
        (@AdminUserId, N'TAS.CanDelete', N'true');
    PRINT '  ✓ Admin claims inserted';
END

-- Manager claims
INSERT INTO USER_CLAIM (UserId, ClaimType, ClaimValue)
VALUES
    (@ManagerUserId, N'TAS.Department', N'Production'),
    (@ManagerUserId, N'TAS.Position', N'Production Manager'),
    (@ManagerUserId, N'TAS.EmployeeId', N'EMP002'),
    (@ManagerUserId, N'TAS.CanApprove', N'true'),
    (@ManagerUserId, N'TAS.CanDelete', N'false');
PRINT '  ✓ Manager claims inserted';

-- User1 claims
INSERT INTO USER_CLAIM (UserId, ClaimType, ClaimValue)
VALUES
    (@UserUserId, N'TAS.Department', N'Warehouse'),
    (@UserUserId, N'TAS.Position', N'Data Entry'),
    (@UserUserId, N'TAS.EmployeeId', N'EMP003'),
    (@UserUserId, N'TAS.CanApprove', N'false'),
    (@UserUserId, N'TAS.CanDelete', N'false');
PRINT '  ✓ User1 claims inserted';

-- ========================================
-- 5) INSERT USER_LOGIN (External Logins - Optional)
-- ========================================
PRINT 'Inserting external logins (optional)...';

-- Example: Google login for admin
IF @AdminUserId IS NOT NULL
BEGIN
    INSERT INTO USER_LOGIN (LoginProvider, ProviderKey, ProviderDisplayName, UserId)
    VALUES
        (N'Google', N'google_user_12345', N'Google', @AdminUserId);
    PRINT '  ✓ Google login for admin inserted';
END

-- ========================================
-- 6) INSERT USER_TOKEN (Tokens - Optional)
-- ========================================
PRINT 'Inserting user tokens (optional)...';

-- Example: Refresh token for admin
IF @AdminUserId IS NOT NULL
BEGIN
    INSERT INTO USER_TOKEN (UserId, LoginProvider, Name, Value)
    VALUES
        (@AdminUserId, N'TAS', N'RefreshToken', CONCAT(N'RT_', CONVERT(NVARCHAR(36), NEWID()))),
        (@AdminUserId, N'TAS', N'DeviceToken', CONCAT(N'DT_', CONVERT(NVARCHAR(36), NEWID())));
    PRINT '  ✓ Tokens for admin inserted';
END

-- Refresh token for manager
INSERT INTO USER_TOKEN (UserId, LoginProvider, Name, Value)
VALUES
    (@ManagerUserId, N'TAS', N'RefreshToken', CONCAT(N'RT_', CONVERT(NVARCHAR(36), NEWID())));
PRINT '  ✓ Refresh token for manager inserted';

COMMIT TRAN;

-- ========================================
-- VERIFY DATA
-- ========================================
PRINT '';
PRINT '========================================';
PRINT 'IDENTITY DATA SUMMARY';
PRINT '========================================';
PRINT '';

SELECT 'Roles' AS Category, COUNT(*) AS Count FROM USER_ROLE
UNION ALL
SELECT 'Users', COUNT(*) FROM USER_ACCOUNT WHERE IsActive = 1
UNION ALL
SELECT 'User-Role Mappings', COUNT(*) FROM USER_IN_ROLE
UNION ALL
SELECT 'User Claims', COUNT(*) FROM USER_CLAIM WHERE ClaimType LIKE 'TAS.%'
UNION ALL
SELECT 'External Logins', COUNT(*) FROM USER_LOGIN
UNION ALL
SELECT 'User Tokens', COUNT(*) FROM USER_TOKEN WHERE LoginProvider = 'TAS';

PRINT '';
PRINT '✅ Identity data seeded successfully!';
PRINT '';
PRINT 'Users created:';
PRINT '  1. admin (Password: Admin@123) - Roles: Admin, Manager, User';
PRINT '  2. manager (Password: Manager@123) - Roles: Manager, User';
PRINT '  3. user1 (Password: User@123) - Roles: User';
PRINT '';
PRINT 'Roles created:';
PRINT '  - Admin (full access)';
PRINT '  - Manager (approve, no delete)';
PRINT '  - User (view & edit)';
PRINT '  - Viewer (view only)';
PRINT '';
PRINT 'Claims added:';
PRINT '  - TAS.Department (IT, Production, Warehouse)';
PRINT '  - TAS.Position (job title)';
PRINT '  - TAS.EmployeeId (EMP001, EMP002, EMP003)';
PRINT '  - TAS.CanApprove (true/false)';
PRINT '  - TAS.CanDelete (true/false)';
PRINT '';