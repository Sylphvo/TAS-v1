using ClosedXML.Excel;
using Dapper;
using System.Data;
using TAS.DTOs;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class LotModels
	{
		private readonly ConnectDbHelper _dbHelper;
		private readonly ILogger<LotModels> _logger;

		public LotModels(ConnectDbHelper dbHelper, ILogger<LotModels> logger)
		{
			_dbHelper = dbHelper;
			_logger = logger;
		}

		// ========================================
		// GET ALL PONDS WITH FILTER AND PAGINATION
		// ========================================
		public async Task<PagedResult<RubberLotResponse>> GetLotsWithFilterAsync(RubberLotRequest filter)
		{
			try
			{
				var parameters = new DynamicParameters();
				var whereConditions = new List<string>();
				whereConditions.Add(" 1 = 1 ");

				// --- 1. TÌM KIẾM (Theo mã hồ hoặc tên hồ) ---
				if (!string.IsNullOrEmpty(filter.Keyword))
				{
					whereConditions.Add(@"(
						l.LotCode LIKE @Keyword OR 
						l.LotName LIKE @Keyword OR 
						l.CreateBy LIKE @Keyword
					)");
					parameters.Add("@Keyword", $"%{filter.Keyword}%");
				}

				//// --- 2. LỌC TRẠNG THÁI ---
				//if (filter.Status.HasValue)
				//{
				//	whereConditions.Add("l.Status = @Status");
				//	parameters.Add("@Status", filter.Status.Value);
				//}

				//// --- 3. LỌC NGÀY TẠO ---
				//if (filter.FromDate.HasValue)
				//{
				//	whereConditions.Add("l.CreateByDate >= @FromDate");
				//	parameters.Add("@FromDate", filter.FromDate.Value);
				//}
				//if (filter.ToDate.HasValue)
				//{
				//	whereConditions.Add("l.CreateByDate < @ToDate");
				//	parameters.Add("@ToDate", filter.ToDate.Value.AddDays(1)); // Lấy đến hết ngày cuối
				//}

				string whereSql = string.Join(" AND ", whereConditions);

				// --- BƯỚC 2: ĐẾM TỔNG SỐ DÒNG ---
				var countSql = $@"
				SELECT COUNT(1) 
				FROM RubberLots l 
				WHERE {whereSql}";

				var totalRecords = await _dbHelper.ExecuteScalarAsync<int>(countSql, parameters);

				// --- BƯỚC 3: LẤY DỮ LIỆU PHÂN TRANG ---
				var dataSql = $@"
				SELECT 
					-- Tạo số thứ tự (Row Number)
					RowNo = ROW_NUMBER() OVER (ORDER BY l.LotId DESC),
					l.LotId,
					l.LotCode,
					l.LotName,
					l.CapacityKg,
					l.DailyCapacityKg,
					l.CurrentNetKg,
					l.Status,
					l.CreateBy,
					CreateByDate = FORMAT(l.CreateByDate, 'yyyy-MM-dd HH:mm'),
					l.UpdateDate,
					l.UpdateBy
				FROM RubberLots l
				WHERE {whereSql}
				ORDER BY l.LotId DESC
				OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY";

				// Thêm tham số phân trang
				parameters.Add("@Skip", (filter.PageIndex - 1) * filter.PageSize);
				parameters.Add("@Take", filter.PageSize);

				var items = await _dbHelper.QueryAsync<RubberLotResponse>(dataSql, parameters);

				return new PagedResult<RubberLotResponse>
				{
					Items = items.ToList(),
					TotalRecords = totalRecords
				};
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetLotsWithFilterAsync");
				throw;
			}
		}
		/// <summary>
		/// Thêm mới hoặc Cập nhật Lô/Hồ
		/// </summary>
		/// <param name="request"></param>
		/// <returns></returns>
		public async Task<long> AddOrUpdateLotAsync(RubberLotRequest request)
		{
			try
			{
				var parameters = new DynamicParameters();

				// 1. CHUẨN BỊ DỮ LIỆU CƠ BẢN
				parameters.Add("@LotCode", request.LotCode);
				parameters.Add("@LotName", request.LotName);
				parameters.Add("@CapacityKg", request.CapacityKg);
				parameters.Add("@DailyCapacityKg", request.DailyCapacityKg);
				parameters.Add("@CurrentNetKg", request.CurrentNetKg ?? 0);
				parameters.Add("@Status", request.Status);

				// 2. KIỂM TRA LOGIC ADD HAY UPDATE
				if (request.LotId > 0)
				{
					// --- TRƯỜNG HỢP UPDATE ---
					parameters.Add("@LotId", request.LotId);
					parameters.Add("@UpdateBy", request.UpdateBy); // Người cập nhật (Lấy từ User context trên Controller truyền xuống)

					string updateSql = @"
					UPDATE RubberLots
					SET 
						LotCode = @LotCode,
						LotName = @LotName,
						CapacityKg = @CapacityKg,
						DailyCapacityKg = @DailyCapacityKg,
						CurrentNetKg = @CurrentNetKg,
						Status = @Status,
						UpdateDate = GETDATE(),
						UpdateBy = @UpdateBy
					WHERE LotId = @LotId";

					await _dbHelper.ExecuteAsync(updateSql, parameters);

					// Trả về chính ID đang sửa
					return request.LotId;
				}
				else
				{
					// --- TRƯỜNG HỢP INSERT ---
					parameters.Add("@CreateBy", request.CreateBy); // Người tạo

					// SCOPE_IDENTITY() để lấy ID vừa tự sinh ra
					string insertSql = @"
					INSERT INTO RubberLots (LotCode, LotName, CapacityKg, DailyCapacityKg, CurrentNetKg, Status, CreateByDate, CreateBy)
					VALUES (@LotCode, @LotName, @CapacityKg, @DailyCapacityKg, @CurrentNetKg, @Status, GETDATE(), @CreateBy);
					
					SELECT CAST(SCOPE_IDENTITY() as bigint);";

					var newId = await _dbHelper.ExecuteScalarAsync<long>(insertSql, parameters);

					// Trả về ID mới để Frontend cập nhật
					return newId;
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error in AddOrUpdateLotAsync. Data: {System.Text.Json.JsonSerializer.Serialize(request)}");
				throw;
			}
		}

		/// <summary>
		/// Xóa Lô/Hồ theo LotId
		/// </summary>
		/// <param name="lotId"></param>
		/// <returns></returns>
		public async Task<bool> DeleteLotAsync(int lotId)
		{
			try
			{
				var parameters = new DynamicParameters();
				parameters.Add("@LotId", lotId);

				// --- BƯỚC 1: (Tùy chọn) KIỂM TRA ĐIỀU KIỆN TRƯỚC KHI XÓA ---
				// Ví dụ: Kiểm tra xem Lô này đang có sản xuất hay không
				// string checkSql = "SELECT Status FROM RubberLots WHERE LotId = @LotId";
				// var status = await _dbHelper.ExecuteScalarAsync<int>(checkSql, parameters);

				// --- BƯỚC 2: THỰC HIỆN XÓA ---
				string deleteSql = @"
				DELETE FROM RubberLots 
				WHERE LotId = @LotId";

				var rowsAffected = await _dbHelper.ExecuteAsync(deleteSql, parameters);

				// Trả về true nếu có ít nhất 1 dòng bị xóa
				return rowsAffected > 0;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error in DeleteLotAsync. Id: {lotId}");
				throw;
			}
		}

	}
}