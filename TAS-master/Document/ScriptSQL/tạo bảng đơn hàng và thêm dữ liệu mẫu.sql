
CREATE TABLE RubberOrder (
    -- Định danh hệ thống
    OrderId BIGINT IDENTITY(1,1) PRIMARY KEY,

    -- Thông tin hợp đồng & Pháp lý
    OrderCode NVARCHAR(50) NULL,          -- Mã hợp đồng (Contract No)
	OrderName NVARCHAR(50) NULL,          -- Tên hợp đồng (Contract No)
	OrderDate DATETIME NULL,          -- Tên hợp đồng (Contract No)

    -- Trạng thái & Quản trị
    Status int,                           -- 0: Draft, 1: Stuffing (Đóng hàng), 2: On Board (Trên tàu), 3: Completed
    Note NVARCHAR(MAX),
    CreatedBy NVARCHAR(50),
    CreatedDate DATETIME DEFAULT GETDATE(),
	UpdateBy NVARCHAR(50),
    UpdateDate DATETIME,
);
INSERT INTO RubberOrder (OrderCode, OrderName, OrderDate, Status, Note, CreatedBy, CreatedDate, UpdateBy, UpdateDate)
VALUES 
-- 1. Đã hoàn thành (Completed) - Có lịch sử cập nhật
(N'EXP-2025-099', N'HĐ Michelin Pháp - Q4', '2025-12-15', 3, N'Đã thanh toán đủ 100%. Hồ sơ đã lưu kho.', N'SaleAdmin', '2025-12-15', N'KeToan', '2026-01-05'),

-- 2. Đang đi biển (On Board) - Mới tạo, chưa sửa
(N'EXP-2026-001', N'Continental Đức - Lô 1', '2026-01-10', 2, N'Tàu MAERSK đã rời cảng. ETA Hamburg 20/02.', N'Logistics01', '2026-01-10', NULL, NULL),

-- 3. Đang đóng hàng (Stuffing) - Có cập nhật tiến độ
(N'EXP-2026-002', N'Bridgestone Nhật Bản', '2026-01-20', 1, N'Đang chờ kết quả kiểm định VLAB để đóng cont.', N'Sale02', '2026-01-20', N'QC_Team', '2026-02-01'),

-- 4. Mới tạo (Draft) - Chưa cập nhật
(N'EXP-2026-003', N'Goodyear Mỹ - Sample', '2026-02-01', 0, N'Gửi mẫu thử SVR CV60 (5kg) qua DHL.', N'Sale01', '2026-02-01', NULL, NULL),

-- 5. Đang đóng hàng (Stuffing) - Có vấn đề cần note
(N'EXP-2026-004', N'Hankook Korea', '2026-02-02', 1, N'Thiếu vỏ cont rỗng, đang yêu cầu hãng tàu cấp lại.', N'Logistics02', '2026-02-02', N'Logistics02', '2026-02-03'),

-- 6. Đang đi biển (On Board)
(N'EXP-2026-005', N'Lốp xe Kumho', '2026-01-25', 2, N'Đã gửi Bill Surrendered cho khách.', N'Admin', '2026-01-25', NULL, NULL),

-- 7. Đang đóng hàng (Stuffing) - Đơn gấp
(N'EXP-2026-006', N'Cheng Shin Taiwan', '2026-01-28', 1, N'Gấp: Phải hạ bãi trước 16:00 ngày mai (Cut-off).', N'Logistics01', '2026-01-28', N'Admin', '2026-02-02'),

-- 8. Mới tạo (Draft)
(N'EXP-2026-007', N'Nội địa - Kenda', '2026-02-03', 0, N'Đang thương lượng giá VAT và chi phí vận chuyển.', N'Sale01', '2026-02-03', NULL, NULL),

-- 9. Đã hoàn thành (Completed)
(N'EXP-2025-098', N'Pirelli Ý - Tổng kết', '2025-11-20', 3, N'Khách phản hồi tốt, đã chốt đơn hàng năm sau.', N'Manager', '2025-11-20', N'Manager', '2025-12-30'),

-- 10. Đang đi biển (On Board)
(N'EXP-2026-008', N'Đơn hàng Thổ Nhĩ Kỳ', '2026-01-15', 2, N'Đang làm thủ tục C/O (Chứng nhận xuất xứ).', N'DocTeam', '2026-01-15', NULL, NULL);