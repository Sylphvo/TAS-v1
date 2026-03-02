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

		/// <summary>
		/// Lấy danh sách đơn hàng với bộ lọc và phân trang
		/// </summary>
		/// <param name="filter"></param>
		/// <returns></returns>
		public async Task<PagedResult<RubberOrderResponse>> GetOrdersWithFilterAsync(RubberOrderRequest filter)
		{
			try
			{
				var parameters = new DynamicParameters();
				var whereConditions = new List<string>();
				whereConditions.Add(" 1 = 1");
				// --- 1. TÌM KIẾM (Chỉ tìm trên các cột có thực trong bảng mới) ---
				if (!string.IsNullOrEmpty(filter.Keyword))
				{
					whereConditions.Add(@"(
						o.OrderCode LIKE @Keyword OR 
						o.OrderName LIKE @Keyword OR 
						o.Note LIKE @Keyword
					)");
					parameters.Add("@Keyword", $"%{filter.Keyword}%");
				}

				// --- 2. LỌC TRẠNG THÁI ---
				if (filter.Status != null)
				{
					whereConditions.Add("o.Status = @Status");
					parameters.Add("@Status", filter.Status);
				}

				// --- 3. LỌC NGÀY (Dùng OrderDate hoặc CreatedDate) ---
				if (filter.FromDate.HasValue)
				{
					whereConditions.Add("o.OrderDate >= @FromDate");
					parameters.Add("@FromDate", filter.FromDate.Value);
				}
				if (filter.ToDate.HasValue)
				{
					whereConditions.Add("o.OrderDate < @ToDate");
					parameters.Add("@ToDate", filter.ToDate.Value.AddDays(1)); // +1 ngày để lấy hết ngày cuối
				}

				string whereSql = string.Join(" AND ", whereConditions);

				// --- BƯỚC 2: ĐẾM TỔNG SỐ DÒNG ---
				// Bỏ JOIN vì bảng đơn giản không cần
				var countSql = $@"
				SELECT COUNT(1) 
				FROM RubberOrder o 
				WHERE {whereSql}";

				var totalRecords = await _dbHelper.ExecuteScalarAsync<int>(countSql, parameters);

				// --- BƯỚC 3: LẤY DỮ LIỆU PHÂN TRANG ---
				// Lưu ý: Cột nào bảng RubberOrder KHÔNG CÓ thì tôi để NULL hoặc giá trị mặc định
				var dataSql = $@"
				SELECT 
					-- Tạo số thứ tự ảo (Để hiển thị STT trên Grid)
					rowNo = ROW_NUMBER() OVER (ORDER BY o.OrderId),
					-- Các cột có dữ liệu thật
					o.OrderId,
					o.OrderCode,
					o.OrderName,
					OrderDate = FORMAT(ISNULL(o.OrderDate, o.CreatedDate), 'yyyy-MM-dd'),
					o.Status,
					o.Note
				FROM RubberOrder o
				WHERE {whereSql}
				ORDER BY o.OrderId -- Sắp xếp đơn mới nhất lên đầu
				OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY";

				// Thêm tham số phân trang
				parameters.Add("@Skip", (filter.PageIndex - 1) * filter.PageSize);
				parameters.Add("@Take", filter.PageSize);

				var items = await _dbHelper.QueryAsync<RubberOrderResponse>(dataSql, parameters);

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
		/// <summary>
		/// Thêm mới hoặc Cập nhật đơn hàng
		/// </summary>
		/// <param name="request"></param>
		/// <returns></returns>
		public async Task<long> AddOrUpdateOrderAsync(RubberOrderRequest request)
		{
			try
			{
				var parameters = new DynamicParameters();

				// 1. CHUẨN BỊ DỮ LIỆU
				parameters.Add("@OrderCode", request.OrderCode);
				parameters.Add("@OrderName", request.OrderName);
				parameters.Add("@Status", request.Status ?? 0); // Mặc định là 0 nếu null
				parameters.Add("@Note", request.Note);

				// Xử lý chuyển đổi ngày (String -> DateTime)
				// Vì trong Model RubberOrderRequest bạn để string, nhưng DB là DateTime
				DateTime? parsedDate = null;
				if (!string.IsNullOrEmpty(request.OrderDate) && DateTime.TryParse(request.OrderDate, out var date))
				{
					parsedDate = date;
				}
				parameters.Add("@OrderDate", parsedDate);

				// 2. KIỂM TRA LOGIC ADD HAY UPDATE
				if (request.OrderId.HasValue && request.OrderId.Value > 0)
				{
					// --- TRƯỜNG HỢP UPDATE ---
					parameters.Add("@OrderId", request.OrderId.Value);

					string updateSql = @"
                UPDATE RubberOrder
                SET 
                    OrderCode = @OrderCode,
                    OrderName = @OrderName,
                    OrderDate = @OrderDate,
                    Status = @Status,
                    Note = @Note
                    --, UpdatedDate = GETDATE() -- Bỏ comment nếu bảng có cột này
                WHERE OrderId = @OrderId";

					await _dbHelper.ExecuteAsync(updateSql, parameters);

					// Trả về chính ID đang sửa
					return request.OrderId.Value;
				}
				else
				{
					// --- TRƯỜNG HỢP INSERT ---
					// SCOPE_IDENTITY() để lấy ID vừa tự sinh ra
					string insertSql = @"
                INSERT INTO RubberOrder (OrderCode, OrderName, OrderDate, Status, Note, CreatedDate)
                VALUES (@OrderCode, @OrderName, @OrderDate, @Status, @Note, GETDATE());
                
                SELECT CAST(SCOPE_IDENTITY() as bigint);";

					var newId = await _dbHelper.ExecuteScalarAsync<long>(insertSql, parameters);

					// Trả về ID mới để Frontend cập nhật
					return newId;
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error in AddOrUpdateOrderAsync. Data: {System.Text.Json.JsonSerializer.Serialize(request)}");
				throw;
			}
		}
		/// <summary>
		/// Xóa đơn hàng theo OrderId
		/// </summary>
		/// <param name="orderId"></param>
		/// <returns></returns>
		public async Task<bool> DeleteOrderAsync(int orderId)
		{
			try
			{
				var parameters = new DynamicParameters();
				parameters.Add("@OrderId", orderId);

				// --- BƯỚC 1: (Tùy chọn) KIỂM TRA ĐIỀU KIỆN TRƯỚC KHI XÓA ---
				// Ví dụ: Chỉ cho phép xóa đơn hàng đang ở trạng thái 'Draft' (0) hoặc 'Mới'
				// Nếu đã 'Completed' (3) thì không cho xóa.
				string checkSql = "SELECT Status FROM RubberOrder WHERE OrderId = @OrderId";
				var status = await _dbHelper.ExecuteScalarAsync<int>(checkSql, parameters);

				// --- BƯỚC 2: THỰC HIỆN XÓA ---
				// Lưu ý: Nếu bảng có ràng buộc khóa ngoại (Foreign Key) với bảng chi tiết,
				// bạn cần xóa bảng chi tiết trước hoặc dùng ON DELETE CASCADE trong SQL.
				string deleteSql = @"
				DELETE FROM RubberOrder 
				WHERE OrderId = @OrderId";

				var rowsAffected = await _dbHelper.ExecuteAsync(deleteSql, parameters);

				// Trả về true nếu có ít nhất 1 dòng bị xóa
				return rowsAffected > 0;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error in DeleteOrderAsync. Id: {orderId}");
				throw;
			}
		}
	}
}