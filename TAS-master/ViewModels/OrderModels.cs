using ClosedXML.Excel;
using Dapper;
using System.Data;
using System.Data.Common;
using TAS.DTOs;
using TAS.Models.DTOs;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class OrderModels
	{
		private readonly ConnectDbHelper _dbHelper;
		private readonly ILogger<OrderModels> _logger;

		public OrderModels(ConnectDbHelper dbHelper, ILogger<OrderModels> logger)
		{
			_dbHelper = dbHelper;
			_logger = logger;
		}

		// ========================================
		// GET ALL ORDERS
		// ========================================
		public async Task<PagedResult<RubberOrderResponse>> GetOrdersWithFilterAsync(OrderFilterRequest filter)
		{
			try
			{
				// Khởi tạo params cho Dapper
				var parameters = new DynamicParameters();

				// --- BƯỚC 1: Xây dựng câu WHERE động ---
				var whereConditions = new List<string>();

				// Luôn đúng để dễ nối chuỗi (hoặc xử lý logic IsDeleted nếu có)
				whereConditions.Add("1=1");

				// 1. Tìm kiếm theo Keyword (Mã đơn, Tên đơn, Tên đại lý, Booking)
				if (!string.IsNullOrEmpty(filter.Keyword))
				{
					whereConditions.Add(@"(
						o.OrderCode LIKE @Keyword OR 
						o.OrderName LIKE @Keyword OR 
						a.AgentName LIKE @Keyword OR 
						o.BookingRef LIKE @Keyword
					)");
					parameters.Add("@Keyword", $"%{filter.Keyword}%");
				}

				// 2. Lọc theo Trạng thái
				if (filter.Status.HasValue)
				{
					whereConditions.Add("o.Status = @Status");
					parameters.Add("@Status", filter.Status.Value);
				}

				// 3. Lọc theo Ngày (Ví dụ lọc theo OrderDate)
				if (filter.FromDate.HasValue)
				{
					whereConditions.Add("o.OrderDate >= @FromDate");
					parameters.Add("@FromDate", filter.FromDate.Value);
				}
				if (filter.ToDate.HasValue)
				{
					// Cộng thêm 1 ngày để lấy trọn vẹn ngày cuối
					whereConditions.Add("o.OrderDate < @ToDate");
					parameters.Add("@ToDate", filter.ToDate.Value.AddDays(1));
				}

				string whereSql = string.Join(" AND ", whereConditions);

				// --- BƯỚC 2: Câu lệnh đếm tổng số dòng (Total Count) ---
				// Cần đếm trước để FE biết có bao nhiêu trang tất cả
				var countSql = $@"
					SELECT COUNT(1)
					FROM RubberOrders o
					INNER JOIN RubberAgent a ON a.AgentCode = o.AgentCode -- Giữ logic JOIN cũ của bạn
					WHERE {whereSql}";

				var totalRecords = await _dbHelper.ExecuteScalarAsync<int>(countSql, parameters);

				// --- BƯỚC 3: Câu lệnh lấy dữ liệu có Phân trang (Pagination) ---
				// Sử dụng OFFSET - FETCH (SQL Server 2012+) thay cho ROW_NUMBER() để nhanh hơn
				var dataSql = $@"
						SELECT 
							rowNo = ROW_NUMBER() OVER(ORDER BY o.CreatedDate DESC, o.OrderId DESC),
							o.OrderId,
							o.OrderCode,
							o.OrderName,        -- Mới thêm
							--o.AgentCode,
							--a.AgentName,
							--o.BuyerCompany,     -- Ưu tiên hiển thị Công ty Buyer
							o.OrderDate,
							o.ETD,              -- Ngày tàu chạy (quan trọng cho export)
							o.PortOfDischarge,  -- Cảng đến
							o.ProductType,
							o.TotalNetKg,
							o.Status,
							o.Note,
							o.CreatedDate
						FROM RubberOrders o
						INNER JOIN RubberAgent a ON a.AgentCode = o.AgentCode
						WHERE {whereSql}
						ORDER BY o.OrderId DESC
						OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY";

				// Thêm tham số phân trang
				parameters.Add("@Skip", (filter.PageIndex - 1) * filter.PageSize);
				parameters.Add("@Take", filter.PageSize);

				var items = await _dbHelper.QueryAsync<RubberOrderResponse>(dataSql, parameters);

				// --- BƯỚC 4: Trả về kết quả ---
				return new PagedResult<RubberOrderResponse>
				{
					Items = items.ToList(),
					TotalRecords = totalRecords
				};
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetOrdersWithFilterAsync");
				throw;
			}
		}
		// ==========================================================
		// 1. CREATE (THÊM MỚI) - Tối ưu: Trả về ID ngay lập tức
		// ==========================================================
		public async Task<RubberOrderResult> CreateOrderAsync(RubberOrderDto dto, string createdBy)
		{
			try
			{
				// 1. Sinh mã tự động (VD: EXP-2026-001)
				var orderCode = await GenerateOrderCodeAsync();

				var sql = @"
                INSERT INTO RubberOrders 
                (
                    OrderCode, OrderName, 
                    AgentId, BuyerId,
                    OrderDate, ETD, 
                    ProductType, PackagingType, TotalNetKg, 
                    BookingRef, Incoterm, PortOfDischarge,
                    Status, Note,
                    CreatedDate, CreatedBy
                )
                VALUES 
                (
                    @OrderCode, @OrderName, 
                    @AgentId, @BuyerId,
                    @OrderDate, @ETD, 
                    @ProductType, @PackagingType, @TotalNetKg, 
                    @BookingRef, @Incoterm, @PortOfDischarge,
                    0, @Note, -- Status mặc định là 0 (Mới)
                    GETDATE(), @CreatedBy
                );
                
                -- Trả về ID vừa sinh ra ngay lập tức
                SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
            ";

				// Dapper tự map các property trùng tên từ 'dto' vào '@Param'
				// Ta tạo object ẩn danh để bổ sung các tham số không có trong dto (như OrderCode, CreatedBy)
				var parameters = new DynamicParameters(dto);
				parameters.Add("OrderCode", orderCode);
				parameters.Add("CreatedBy", createdBy);

				var newId = await _dbConnection.QuerySingleAsync<long>(sql, parameters);

				return new RubberOrderResponse { Success = true, Message = "Tạo đơn hàng thành công", OrderId = newId };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "CreateOrder Error");
				return new RubberOrderResponse { Success = false, Message = "Lỗi: " + ex.Message };
			}
		}

		// ==========================================================
		// 2. UPDATE (CẬP NHẬT) - Tối ưu: Chỉ update trường cho phép
		// ==========================================================
		public async Task<RubberOrderResult> UpdateOrderAsync(RubberOrderResult dto, string updatedBy)
		{
			try
			{
				// Không update OrderCode, CreatedDate, CreatedBy để bảo toàn lịch sử
				var sql = @"
                UPDATE RubberOrders
                SET 
                    OrderName       = @OrderName,
                    AgentId         = @AgentId,
                    BuyerId         = @BuyerId,
                    OrderDate       = @OrderDate,
                    ETD             = @ETD,
                    PortOfDischarge = @PortOfDischarge,
                    ProductType     = @ProductType,
                    PackagingType   = @PackagingType,
                    TotalNetKg      = @TotalNetKg,
                    BookingRef      = @BookingRef,
                    Incoterm        = @Incoterm,
                    Note            = @Note,
                    
                    -- Nếu bạn có cột UpdateInfo thì mở dòng dưới
                    -- UpdateDate      = GETDATE(),
                    -- UpdatePerson    = @UpdatedBy
                WHERE OrderId = @OrderId
            ";

				// Map thêm tham số UpdatedBy vào
				var parameters = new DynamicParameters(dto);
				parameters.Add("UpdatedBy", updatedBy);

				var affectedRows = await _dbConnection.ExecuteAsync(sql, parameters);

				if (affectedRows > 0)
					return new RubberOrderResponse { Success = true, Message = "Cập nhật thành công" };
				else
					return new RubberOrderResponse { Success = false, Message = "Không tìm thấy đơn hàng để sửa" };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "UpdateOrder Error");
				return new RubberOrderResponse { Success = false, Message = "Lỗi: " + ex.Message };
			}
		}

		// ==========================================================
		// 3. DELETE (XÓA) - Tối ưu: Validate nghiệp vụ trước khi xóa
		// ==========================================================
		public async Task<RubberOrderResult> DeleteOrderAsync(long orderId)
		{
			try
			{
				// BƯỚC 1: Kiểm tra trạng thái (Không cho xóa đơn đã xuất đi)
				// Giả sử Status >= 2 là "Đã lên tàu" hoặc "Hoàn thành"
				var status = await _dbConnection.QueryFirstOrDefaultAsync<byte?>("SELECT Status FROM RubberOrders WHERE OrderId = @Id", new { Id = orderId });

				if (status == null) return new RubberOrderResult { Success = false, Message = "Đơn hàng không tồn tại" };
				if (status >= 2) return new RubberOrderResult { Success = false, Message = "Không thể xóa đơn hàng đã xuất đi (Status >= 2)" };

				// BƯỚC 2: Kiểm tra ràng buộc dữ liệu (Pallet/Container)
				// Nếu đơn hàng đã lỡ nhập pallet rồi thì không cho xóa ẩu
				var checkSql = "SELECT COUNT(1) FROM RubberPallet WHERE OrderId = @Id";
				var count = await _dbConnection.ExecuteScalarAsync<int>(checkSql, new { Id = orderId });

				if (count > 0)
				{
					return new RubberOrderResult { Success = false, Message = $"Đơn hàng đang chứa {count} kiện hàng (Pallet). Vui lòng xóa kiện hàng trước." };
				}

				// BƯỚC 3: Xóa thật (Physical Delete)
				var deleteSql = "DELETE FROM RubberOrders WHERE OrderId = @Id";
				await _dbConnection.ExecuteAsync(deleteSql, new { Id = orderId });

				return new RubberOrderResult { Success = true, Message = "Xóa đơn hàng thành công" };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "DeleteOrder Error");
				// Bắt lỗi khóa ngoại (Foreign Key) nếu Bước 2 chưa bao phủ hết
				if (ex.Message.Contains("REFERENCE constraint"))
					return new RubberOrderResult { Success = false, Message = "Dữ liệu đang được sử dụng ở bảng khác, không thể xóa." };

				return new RubberOrderResult { Success = false, Message = "Lỗi: " + ex.Message };
			}
		}

		// Hàm phụ trợ sinh mã
		private async Task<string> GenerateOrderCodeAsync()
		{
			// Logic sinh mã: EXP-Năm-SốTăngDần (VD: EXP-2026-005)
			// ... code logic của bạn ...
			return "EXP-" + DateTime.Now.Year + "-" + Guid.NewGuid().ToString().Substring(0, 4).ToUpper();
		}
	}
}