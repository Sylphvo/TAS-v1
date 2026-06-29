//#region LotModels.cs (Updated)

using ClosedXML.Excel;
using Dapper;
using System.Data;
using TAS.DTOs;
using TAS.Repository;
using TAS.TagHelpers;
using System.IO;

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

        /// <summary>
        /// Lấy thông tin chi tiết một Hồ/Lô theo ID (MỚI BỔ SUNG)
        /// </summary>
        public async Task<RubberLotResponse> GetLotByIdAsync(int id)
        {
            try
            {
                string sql = @"
					SELECT 
						LotId,
						LotCode,
						LotName,
						CapacityKg,
						DailyCapacityKg,
						CurrentNetKg,
						Status,
						CreateBy,
						CreateByDate,
						UpdateDate,
						UpdateBy
					FROM RubberLots 
					WHERE LotId = @Id";

                return await _dbHelper.QueryFirstOrDefaultAsync<RubberLotResponse>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in GetLotByIdAsync for ID: {id}");
                throw;
            }
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

                if (!string.IsNullOrEmpty(filter.Keyword))
                {
                    whereConditions.Add(@"(
						l.LotCode LIKE @Keyword OR 
						l.LotName LIKE @Keyword OR 
						l.CreateBy LIKE @Keyword
					)");
                    parameters.Add("@Keyword", $"%{filter.Keyword}%");
                }

                string whereSql = string.Join(" AND ", whereConditions);

                var countSql = $@"SELECT COUNT(1) FROM RubberLots l WHERE {whereSql}";
                var totalRecords = await _dbHelper.ExecuteScalarAsync<int>(countSql, parameters);

                var dataSql = $@"
				SELECT 
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
        public async Task<long> AddOrUpdateLotAsync(RubberLotRequest request)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@LotCode", request.LotCode);
                parameters.Add("@LotName", request.LotName);
                parameters.Add("@CapacityKg", request.CapacityKg);
                parameters.Add("@DailyCapacityKg", request.DailyCapacityKg);
                parameters.Add("@CurrentNetKg", request.CurrentNetKg ?? 0);
                parameters.Add("@Status", request.Status);

                if (request.LotId > 0)
                {
                    parameters.Add("@LotId", request.LotId);
                    parameters.Add("@UpdateBy", request.UpdateBy);

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
                    return request.LotId;
                }
                else
                {
                    parameters.Add("@CreateBy", request.CreateBy);
                    string insertSql = @"
					INSERT INTO RubberLots (LotCode, LotName, CapacityKg, DailyCapacityKg, CurrentNetKg, Status, CreateByDate, CreateBy)
					VALUES (@LotCode, @LotName, @CapacityKg, @DailyCapacityKg, @CurrentNetKg, @Status, GETDATE(), @CreateBy);
					SELECT CAST(SCOPE_IDENTITY() as bigint);";

                    return await _dbHelper.ExecuteScalarAsync<long>(insertSql, parameters);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddOrUpdateLotAsync");
                throw;
            }
        }

        public async Task<bool> DeleteLotAsync(int lotId)
        {
            try
            {
                string deleteSql = "DELETE FROM RubberLots WHERE LotId = @LotId";
                var rowsAffected = await _dbHelper.ExecuteAsync(deleteSql, new { LotId = lotId });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in DeleteLotAsync. Id: {lotId}");
                throw;
            }
        }

        public async Task<bool> SaveBatchLotsAsync(List<RubberLotRequest> lots)
        {
            try
            {
                foreach (var lot in lots)
                {
                    await AddOrUpdateLotAsync(lot);
                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SaveBatchLotsAsync");
                throw;
            }
        }

        public async Task<bool> DeleteBatchLotsAsync(List<long> lotIds)
        {
            try
            {
                string sql = "DELETE FROM RubberLots WHERE LotId IN @Ids";
                int affectedRows = await _dbHelper.ExecuteAsync(sql, new { Ids = lotIds });
                return affectedRows > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteBatchLotsAsync");
                throw;
            }
        }

        public async Task<bool> UpdateStatusAsync(long lotId, int status)
        {
            try
            {
                string sql = "UPDATE RubberLots SET Status = @Status, UpdateDate = GETDATE() WHERE LotId = @LotId";
                int affectedRows = await _dbHelper.ExecuteAsync(sql, new { Status = status, LotId = lotId });
                return affectedRows > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in UpdateStatusAsync for LotId {lotId}");
                throw;
            }
        }

        public async Task<byte[]> ExportLotsToExcelAsync(List<long> lotIds)
        {
            try
            {
                var parameters = new DynamicParameters();
                string dataSql = "SELECT LotCode, LotName, CapacityKg, CurrentNetKg, Status FROM RubberLots ";

                if (lotIds != null && lotIds.Any())
                {
                    dataSql += "WHERE LotId IN @Ids ";
                    parameters.Add("@Ids", lotIds);
                }
                dataSql += "ORDER BY LotId DESC";

                var items = await _dbHelper.QueryAsync<RubberLotResponse>(dataSql, parameters);

                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Danh Sách Hồ Lô");
                    worksheet.Cell(1, 1).Value = "Mã hồ";
                    worksheet.Cell(1, 2).Value = "Tên hồ";
                    worksheet.Cell(1, 3).Value = "Dung tích (kg)";
                    worksheet.Cell(1, 4).Value = "KL hiện tại (kg)";
                    worksheet.Cell(1, 5).Value = "Trạng thái";

                    var headerRange = worksheet.Range("A1:E1");
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

                    int currentRow = 2;
                    foreach (var item in items)
                    {
                        worksheet.Cell(currentRow, 1).Value = item.LotCode;
                        worksheet.Cell(currentRow, 2).Value = item.LotName;
                        worksheet.Cell(currentRow, 3).Value = item.CapacityKg;
                        worksheet.Cell(currentRow, 4).Value = item.CurrentNetKg;
                        worksheet.Cell(currentRow, 5).Value = item.Status;
                        currentRow++;
                    }

                    worksheet.Columns().AdjustToContents();
                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        return stream.ToArray();
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ExportLotsToExcelAsync");
                throw;
            }
        }
    }
}