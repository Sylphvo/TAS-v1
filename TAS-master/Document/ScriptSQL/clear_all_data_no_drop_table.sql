USE [TAS];
GO
SET NOCOUNT ON;

DECLARE @sql NVARCHAR(MAX) = N'';

-- 1) Disable trigger trên tất cả bảng
SELECT @sql += N'DISABLE TRIGGER ALL ON '
            + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N';' + CHAR(10)
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0;

IF (@sql <> N'') EXEC sp_executesql @sql;

-- 2) Disable constraints (FK/CHECK)
SET @sql = N'';
SELECT @sql += N'ALTER TABLE '
            + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name)
            + N' NOCHECK CONSTRAINT ALL;' + CHAR(10)
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0;

IF (@sql <> N'') EXEC sp_executesql @sql;

-- 3) DELETE sạch dữ liệu
SET @sql = N'';
SELECT @sql += N'DELETE FROM '
            + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N';' + CHAR(10)
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0;

IF (@sql <> N'') EXEC sp_executesql @sql;

-- 4) (OPTIONAL) reset identity về 0
SET @sql = N'';
SELECT @sql += N'DBCC CHECKIDENT ('''
            + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name)
            + N''', RESEED, 0) WITH NO_INFOMSGS;' + CHAR(10)
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0
  AND EXISTS (SELECT 1 FROM sys.identity_columns ic WHERE ic.object_id = t.object_id);

IF (@sql <> N'') EXEC sp_executesql @sql;

-- 5) Enable lại constraints + validate
SET @sql = N'';
SELECT @sql += N'ALTER TABLE '
            + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name)
            + N' WITH CHECK CHECK CONSTRAINT ALL;' + CHAR(10)
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0;

IF (@sql <> N'') EXEC sp_executesql @sql;

-- 6) Enable lại trigger
SET @sql = N'';
SELECT @sql += N'ENABLE TRIGGER ALL ON '
            + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N';' + CHAR(10)
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0;

IF (@sql <> N'') EXEC sp_executesql @sql;
GO
