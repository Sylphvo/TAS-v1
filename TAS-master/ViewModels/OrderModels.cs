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
		public async Task<PagedResult<RubberOrderResponse>> GetOrdersWithFilterAsync(RubberOrderRequest filter)
		{
			try
			{
				var parameters = new DynamicParameters();
				var whereConditions = new List<string>();

				// Luôn đúng
				whereConditions.Add("1=1");

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
					rowNo = OrderId,
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
	}
}