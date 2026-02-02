CREATE TABLE RubberOrders (
    -- Định danh hệ thống
    OrderId BIGINT IDENTITY(1,1) PRIMARY KEY,

    -- Thông tin hợp đồng & Pháp lý
    OrderCode NVARCHAR(50) NOT NULL,          -- Mã hợp đồng (Contract No)
	OrderName NVARCHAR(50) NOT NULL,          -- Mã hợp đồng (Contract No)
    BookingRef NVARCHAR(50),                  -- Số Booking (Của hãng tàu cấp)
    Incoterm NVARCHAR(10),                    -- Điều kiện giao hàng (FOB, CIF, CFR...) - Rất quan trọng khi xuất Âu
    PaymentTerm NVARCHAR(50),                 -- Điều khoản thanh toán (T/T, LC...)

    -- Bên tham gia
    AgentCode NVARCHAR(50) NOT NULL,                     -- ID Đại lý/Nhà vườn (VN)
    BuyerId INT NOT NULL,                     -- ID Khách hàng (EU)

    -- Thông tin hàng hóa (Cao su)
    ProductType NVARCHAR(20),                 -- Chủng loại: SVR 3L, SVR 10, SVR CV60...
    PackagingType NVARCHAR(50),               -- Quy cách: Bales 33.33kg, Wooden Pallet, Shrink Wrap (Khách Âu rất kỹ vụ gỗ kê hàng)
    TotalNetKg DECIMAL(18, 2),                -- Tổng trọng lượng tịnh
    TotalGrossKg DECIMAL(18, 2),              -- Tổng trọng lượng cả bì
    ContainerCount INT DEFAULT 1,             -- Số lượng Container (thường là Cont 20ft cho cao su)

    -- Logistics & Vận tải biển (VN -> EU)
    VesselName NVARCHAR(100),                 -- Tên tàu
    VoyageNo NVARCHAR(50),                    -- Số chuyến (Voyage)
    PortOfLoading NVARCHAR(100),              -- Cảng đi (VD: Cat Lai, HCMC)
    PortOfDischarge NVARCHAR(100),            -- Cảng đến (VD: Rotterdam, Hamburg, Genoa)
    BillOfLadingNo NVARCHAR(50),              -- Số vận đơn (B/L) - Có sau khi tàu chạy

    -- Thời gian quan trọng
    OrderDate DATETIME DEFAULT GETDATE(),     -- Ngày ký hợp đồng
    ETD DATETIME,                             -- Ngày tàu chạy dự kiến (Estimated Time of Departure)
    ETA DATETIME,                             -- Ngày tàu đến dự kiến (Estimated Time of Arrival)
    DocClosingDate DATETIME,                  -- Hạn chốt hồ sơ (Cut-off time)

    -- Trạng thái & Quản trị
    Status TINYINT,                           -- 0: Draft, 1: Stuffing (Đóng hàng), 2: On Board (Trên tàu), 3: Completed
    Note NVARCHAR(MAX),
    CreatedBy NVARCHAR(50),
    CreatedDate DATETIME DEFAULT GETDATE()
);
INSERT INTO RubberOrders (
    OrderCode, OrderName, BookingRef, Incoterm, PaymentTerm, 
    AgentCode, BuyerId, 
    ProductType, PackagingType, TotalNetKg, TotalGrossKg, ContainerCount, 
    VesselName, VoyageNo, PortOfLoading, PortOfDischarge, BillOfLadingNo, 
    OrderDate, ETD, ETA, DocClosingDate, 
    Status, Note, CreatedBy
)
VALUES 
-- 1. Đơn hàng đi Đức (Continental) - Đã lên tàu (On Board)
(
    'EXP-2026-001', N'Đơn Continental T2', 'MAEU123456', 'CIF', 'LC at sight',
    'AG001', 101, -- Agent 1 (VN) bán cho Buyer 101 (Đức)
    'SVR 3L', 'Wooden Pallet, Shrink Wrap', 38400.00, 39600.00, 2, 
    'MAERSK HANOI', 'V.2026N', 'Cat Lai, VN', 'Hamburg, DE', 'MAEU-BL-999',
    '2026-01-15', '2026-02-10', '2026-03-15', '2026-02-08',
    2, N'Lô hàng ưu tiên chất lượng cao cho lốp xe.', 'Admin'
),

-- 2. Đơn hàng đi Pháp (Michelin) - Đang đóng hàng (Stuffing)
(
    'EXP-2026-002', N'Michelin Le Havre', 'CMA888999', 'FOB', 'T/T 30/70',
    'AG001', 102, 
    'SVR 10', 'Bales 33.33kg (Loose)', 19200.00, 19250.00, 1, 
    'CMA CGM ANTOINE', 'V.456W', 'Cai Mep, VN', 'Le Havre, FR', NULL,
    '2026-01-28', '2026-02-15', '2026-03-20', '2026-02-12',
    1, N'Đang chờ hun trùng pallet gỗ.', 'Sale01'
),

-- 3. Đơn hàng đi Hà Lan (Thương mại) - Mới tạo (Draft)
(
    'EXP-2026-003', N'Thử nghiệm Rotterdam', NULL, 'CIF', 'T/T 100%',
    'AG001', 103, 
    'SVR CV60', 'Wooden Pallet', 19200.00, 20000.00, 1, 
    NULL, NULL, 'Cat Lai, VN', 'Rotterdam, NL', NULL,
    '2026-02-01', '2026-02-28', '2026-03-30', NULL,
    0, N'Khách yêu cầu gửi mẫu trước khi chốt cont.', 'Sale02'
),

-- 4. Đơn hàng đi Ý (Pirelli) - Đã hoàn thành (Completed)
(
    'EXP-2025-150', N'Pirelli Q4-2025', 'MSC777111', 'FOB', 'LC 60 days',
    'AG001', 104, 
    'SVR 3L', 'Shrink Wrap Only', 57600.00, 58500.00, 3, 
    'MSC GULSUN', 'V.999E', 'Cat Lai, VN', 'Genoa, IT', 'MSC-BL-555',
    '2025-11-20', '2025-12-05', '2026-01-10', '2025-12-02',
    3, N'Đã thanh toán đủ, khách phản hồi tốt.', 'Admin'
),

-- 5. Đơn hàng đi Tây Ban Nha - Đang làm thủ tục (Customs)
(
    'EXP-2026-004', N'Lô hàng Valencia', 'ONE222333', 'CFR', 'DP',
    'AG001', 105, 
    'SVR 20', 'Wooden Pallet', 19200.00, 19800.00, 1, 
    'ONE ALTAIR', 'V.123W', 'Da Nang, VN', 'Valencia, ES', NULL,
    '2026-01-25', '2026-02-12', '2026-03-18', '2026-02-10',
    1, N'Lưu ý kiểm tra độ ẩm trước khi đóng cont.', 'Logistics01'
),

-- 6. Đơn hàng đi Bỉ (Antwerp) - Đã lên tàu
(
    'EXP-2026-005', N'Kho ngoại quan Bỉ', 'HLC888555', 'CIF', 'T/T 50/50',
    'AG001', 106, 
    'RSS 3', 'Bales in Crate', 38400.00, 40000.00, 2, 
    'HMM ALGECIRAS', 'V.789W', 'Cai Mep, VN', 'Antwerp, BE', 'HLC-BL-123',
    '2026-01-10', '2026-01-30', '2026-03-05', '2026-01-28',
    2, N'Tàu delay 2 ngày do thời tiết.', 'Logistics02'
),

-- 7. Đơn hàng đi Ba Lan (Qua cảng Gdynia) - Mới tạo
(
    'EXP-2026-006', N'Đơn hàng Đông Âu', NULL, 'FOB', 'LC at sight',
    'AG001', 107, 
    'SVR 10', 'Wooden Pallet', 76800.00, 79200.00, 4, 
    NULL, NULL, 'Cat Lai, VN', 'Gdynia, PL', NULL,
    '2026-02-02', '2026-03-15', '2026-04-20', NULL,
    0, N'Đang thương lượng giá cước vận tải.', 'Sale01'
),

-- 8. Đơn hàng đi Thổ Nhĩ Kỳ - Đang đóng hàng
(
    'EXP-2026-007', N'Istanbul Fast', 'COS999000', 'CIF', 'T/T 20/80',
    'AG001', 108, 
    'SVR 3L', 'Shrink Wrap', 19200.00, 19600.00, 1, 
    'COSCO SHIPPING', 'V.555E', 'Hai Phong, VN', 'Istanbul, TR', NULL,
    '2026-01-29', '2026-02-20', '2026-03-25', '2026-02-18',
    1, N'Gấp, cần hạ bãi sớm trước Cut-off.', 'Logistics01'
),

-- 9. Đơn hàng đi Bồ Đào Nha - Đã hoàn thành
(
    'EXP-2025-148', N'Sines Port Stock', 'EMC111222', 'CFR', 'T/T 100%',
    'AG001', 109, 
    'SVR CV50', 'Wooden Box', 19200.00, 21000.00, 1, 
    'EVER ACE', 'V.111W', 'Cat Lai, VN', 'Sines, PT', 'EMC-BL-777',
    '2025-10-15', '2025-11-01', '2025-12-10', '2025-10-28',
    3, N'Hàng giao đúng hạn.', 'Admin'
),

-- 10. Đơn hàng đi Slovenia (Cửa ngõ Trung Âu) - Đã lên tàu
(
    'EXP-2026-008', N'Koper Hub Supply', 'ZIM444555', 'FOB', 'LC 90 days',
    'AG001', 101, 
    'SVR 10', 'Wooden Pallet', 38400.00, 39600.00, 2, 
    'ZIM ROTTERDAM', 'V.333E', 'Cai Mep, VN', 'Koper, SI', 'ZIM-BL-888',
    '2026-01-20', '2026-02-05', '2026-03-12', '2026-02-03',
    2, N'Đang gửi bộ chứng từ gốc cho ngân hàng.', 'Logistics02'
);