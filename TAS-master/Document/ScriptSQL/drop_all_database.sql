USE [TAS];
GO
SET NOCOUNT ON;

DECLARE @sql NVARCHAR(MAX) = N'';

-- 1) Drop all foreign keys
SELECT @sql += N'ALTER TABLE ' 
            + QUOTENAME(SCHEMA_NAME(t.schema_id)) + N'.' + QUOTENAME(t.name)
            + N' DROP CONSTRAINT ' + QUOTENAME(fk.name) + N';' + CHAR(10)
FROM sys.foreign_keys fk
JOIN sys.tables t ON fk.parent_object_id = t.object_id
WHERE t.is_ms_shipped = 0;

IF (@sql <> N'') EXEC sp_executesql @sql;

-- 2) Drop all tables
SET @sql = N'';
SELECT @sql += N'DROP TABLE '
            + QUOTENAME(SCHEMA_NAME(t.schema_id)) + N'.' + QUOTENAME(t.name)
            + N';' + CHAR(10)
FROM sys.tables t
WHERE t.is_ms_shipped = 0;

IF (@sql <> N'') EXEC sp_executesql @sql;
GO
