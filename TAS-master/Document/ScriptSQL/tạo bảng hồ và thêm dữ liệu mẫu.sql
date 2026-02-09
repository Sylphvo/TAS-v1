CREATE TABLE RubberLots (
    LotId INT PRIMARY KEY IDENTITY(1,1), -- Khóa chính tự tăng
    LotCode NVARCHAR(50) NOT NULL,        -- Mã hồ
    LotName NVARCHAR(255),               -- Tên hồ
    CapacityKg DECIMAL(18, 2),            -- Dung tích (kg)
    DailyCapacityKg DECIMAL(18, 2),       -- Công suất hàng ngày (kg)
    CurrentNetKg DECIMAL(18, 2),          -- Khối lượng hiện tại (kg)
    Status INT DEFAULT 1,                  -- Trạng thái (1: Hoạt động, 0: Khóa...)
    CreateByDate DATETIME2 DEFAULT GETDATE(), -- Ngày đăng ký
    CreateBy NVARCHAR(100),         -- Người đăng ký
    UpdateDate DATETIME2 NULL,             -- Ngày cập nhật
    UpdateBy NVARCHAR(100) NULL        -- Người cập nhật
);
GO

INSERT INTO RubberLots (LotCode, LotName, CapacityKg, DailyCapacityKg, CurrentNetKg, Status, CreateByDate, CreateBy)
VALUES 
('LOT-2026-001', N'Hồ Cao Su Miền Đông 01', 10000.00, 1000.00, 500.50, 1, '2026-01-10 08:00:00', 'ADMIN'),
('LOT-2026-002', N'Hồ Cao Su Miền Tây 02', 20000.00, 2000.00, 1500.00, 1, '2026-01-12 09:30:00', 'SEED'),
('LOT-2026-003', N'Hồ Lưu Trữ Bình Dương', 15000.00, 1500.00, 0.00, 0, '2026-01-15 10:15:00', 'ADMIN'),
('LOT-2026-004', N'Hồ Sơ Chế Đồng Nai', 12000.00, 1200.00, 12000.00, 1, '2026-01-20 14:00:00', 'USER_01'),
('LOT-2026-005', N'Hồ Tổng Hợp Vũng Tàu', 50000.00, 5000.00, 25000.75, 1, '2026-01-22 16:45:00', 'SEED'),
('LOT-2026-006', N'Hồ Kiểm Định Chất Lượng', 5000.00, 500.00, 100.00, 1, '2026-02-01 07:20:00', 'ADMIN'),
('LOT-2026-007', N'Hồ Phụ Trợ 07', 8000.00, 800.00, 0.00, 2, '2026-02-03 11:10:00', 'USER_02'),
('LOT-2026-008', N'Hồ Cao Su Thiên Nhiên A1', 30000.00, 3000.00, 15500.20, 1, '2026-02-05 13:00:00', 'SEED'),
('LOT-2026-009', N'Hồ Cao Su Tổng Hợp B2', 30000.00, 3000.00, 10.00, 1, '2026-02-07 15:30:00', 'ADMIN'),
('LOT-2026-010', N'Hồ Xuất Khẩu Giai Đoạn 1', 45000.00, 4500.00, 44000.00, 1, '2026-02-09 09:00:00', 'USER_01');
GO