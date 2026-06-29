using ClosedXML.Excel;
using Dapper;
using System.Data;
using TAS.DTOs;
using TAS.Models;
using TAS.Repository;
using TAS.TagHelpers;
using System.IO;

namespace TAS.ViewModels
{
    public class FarmModels
    {
        private readonly ICurrentUser _userManage;
        private readonly ConnectDbHelper _dbHelper;
        private readonly ILogger<FarmModels> _logger;

        public FarmModels(ICurrentUser userManage, ILogger<FarmModels> logger, ConnectDbHelper dbHelper)
        {
            _userManage = userManage;
            _logger = logger;
            _dbHelper = dbHelper;
        }

        // ========================================
        // 1. GET ALL WITH FILTER AND PAGINATION
        // ========================================
        public async Task<PagedResult<RubberFarmResponse>> GetFarmsWithFilterAsync(RubberFarmRequest filter)
        {
            try
            {
                var whereConditions = new List<string> { "1=1" };
                var parameters = new DynamicParameters();

                if (!string.IsNullOrWhiteSpace(filter.Keyword))
                {
                    whereConditions.Add(@"(
                        f.FarmCode LIKE @Keyword OR 
                        f.FarmName LIKE @Keyword OR 
                        f.OwnerName LIKE @Keyword OR 
                        f.Phone LIKE @Keyword OR
                        f.Address LIKE @Keyword
                    )");
                    parameters.Add("@Keyword", $"%{filter.Keyword}%");
                }

                if (!string.IsNullOrEmpty(filter.AgentCode))
                {
                    whereConditions.Add("f.AgentCode = @AgentCode");
                    parameters.Add("@AgentCode", filter.AgentCode);
                }

                string whereSql = string.Join(" AND ", whereConditions);

                var countSql = $"SELECT COUNT(1) FROM RubberFarm f WHERE {whereSql}";
                var totalRecords = await _dbHelper.ExecuteScalarAsync<int>(countSql, parameters);

                var dataSql = $@"
                SELECT 
                    RowNo = ROW_NUMBER() OVER (ORDER BY f.FarmId DESC),
                    f.FarmId, f.FarmCode, f.FarmName, f.OwnerName, f.AgentCode, 
                    f.Phone, f.Area, f.Address, f.Coordinates, f.Status
                FROM RubberFarm f
                WHERE {whereSql}
                ORDER BY f.FarmId DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY";

                parameters.Add("@Skip", (filter.PageIndex - 1) * filter.PageSize);
                parameters.Add("@Take", filter.PageSize);

                var items = await _dbHelper.QueryAsync<RubberFarmResponse>(dataSql, parameters);

                return new PagedResult<RubberFarmResponse>
                {
                    Items = items.ToList(),
                    TotalRecords = totalRecords
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetFarmsWithFilterAsync");
                throw;
            }
        }

        // ========================================
        // 2. GET BY ID
        // ========================================
        public async Task<RubberFarmResponse> GetFarmByIdAsync(int id)
        {
            try
            {
                string sql = "SELECT * FROM RubberFarm WHERE FarmId = @Id";
                return await _dbHelper.QueryFirstOrDefaultAsync<RubberFarmResponse>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in GetFarmByIdAsync ID: {id}");
                throw;
            }
        }

        // ========================================
        // 3. ADD OR UPDATE
        // ========================================
        public async Task<long> AddOrUpdateFarmAsync(RubberFarmRequest request)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@FarmCode", request.FarmCode);
                parameters.Add("@FarmName", request.FarmName);
                parameters.Add("@OwnerName", request.OwnerName);
                parameters.Add("@AgentCode", request.AgentCode);
                parameters.Add("@Phone", request.FarmPhone);
                parameters.Add("@Area", request.Area);
                parameters.Add("@Address", request.FarmAddress);
                parameters.Add("@Coordinates", request.Coordinates);
                parameters.Add("@Status", request.Status);

                if (request.FarmId > 0)
                {
                    parameters.Add("@FarmId", request.FarmId);
                    string updateSql = @"
                        UPDATE RubberFarm SET 
                            FarmCode = @FarmCode, FarmName = @FarmName, OwnerName = @OwnerName, 
                            AgentCode = @AgentCode, Phone = @Phone, Area = @Area, 
                            Address = @Address, Coordinates = @Coordinates, Status = @Status
                        WHERE FarmId = @FarmId";
                    await _dbHelper.ExecuteAsync(updateSql, parameters);
                    return request.FarmId;
                }
                else
                {
                    string insertSql = @"
                        INSERT INTO RubberFarm (FarmCode, FarmName, OwnerName, AgentCode, Phone, Area, Address, Coordinates, Status)
                        VALUES (@FarmCode, @FarmName, @OwnerName, @AgentCode, @Phone, @Area, @Address, @Coordinates, @Status);
                        SELECT CAST(SCOPE_IDENTITY() as bigint);";
                    return await _dbHelper.ExecuteScalarAsync<long>(insertSql, parameters);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddOrUpdateFarmAsync");
                throw;
            }
        }

        // ========================================
        // 4. BATCH SAVE & DELETE
        // ========================================
        public async Task<bool> SaveBatchFarmsAsync(List<RubberFarmRequest> requests)
        {
            try
            {
                foreach (var req in requests) { await AddOrUpdateFarmAsync(req); }
                return true;
            }
            catch (Exception ex) { _logger.LogError(ex, "Error in SaveBatchFarmsAsync"); throw; }
        }

        public async Task<bool> DeleteFarmAsync(int farmId)
        {
            try
            {
                string sql = "DELETE FROM RubberFarm WHERE FarmId = @Id";
                return await _dbHelper.ExecuteAsync(sql, new { Id = farmId }) > 0;
            }
            catch (Exception ex) { _logger.LogError(ex, "Error in DeleteFarmAsync"); throw; }
        }

        public async Task<bool> DeleteBatchFarmsAsync(List<long> farmIds)
        {
            try
            {
                string sql = "DELETE FROM RubberFarm WHERE FarmId IN @Ids";
                return await _dbHelper.ExecuteAsync(sql, new { Ids = farmIds }) > 0;
            }
            catch (Exception ex) { _logger.LogError(ex, "Error in DeleteBatchFarmsAsync"); throw; }
        }

        // ========================================
        // 5. EXPORT EXCEL
        // ========================================
        public async Task<byte[]> ExportFarmsToExcelAsync(List<long> farmIds)
        {
            try
            {
                var parameters = new DynamicParameters();
                string sql = "SELECT FarmCode, FarmName, OwnerName, AgentCode, Phone, Area, Address, Status FROM RubberFarm ";

                if (farmIds != null && farmIds.Any())
                {
                    sql += "WHERE FarmId IN @Ids ";
                    parameters.Add("@Ids", farmIds);
                }
                sql += "ORDER BY FarmId DESC";

                var items = await _dbHelper.QueryAsync<RubberFarmResponse>(sql, parameters);

                using (var workbook = new XLWorkbook())
                {
                    var ws = workbook.Worksheets.Add("Nông Trường");
                    ws.Cell(1, 1).Value = "Mã NT";
                    ws.Cell(1, 2).Value = "Tên NT";
                    ws.Cell(1, 3).Value = "Chủ vườn";
                    ws.Cell(1, 4).Value = "Mã Đại lý";
                    ws.Cell(1, 5).Value = "Số điện thoại";
                    ws.Cell(1, 6).Value = "Diện tích (Ha)";
                    ws.Cell(1, 7).Value = "Địa chỉ";
                    ws.Cell(1, 8).Value = "Trạng thái";

                    ws.Range("A1:H1").Style.Font.Bold = true;
                    ws.Range("A1:H1").Style.Fill.BackgroundColor = XLColor.LightGray;

                    int row = 2;
                    foreach (var item in items)
                    {
                        ws.Cell(row, 1).Value = item.FarmCode;
                        ws.Cell(row, 2).Value = item.FarmName;
                        ws.Cell(row, 3).Value = item.OwnerName;
                        ws.Cell(row, 4).Value = item.AgentCode;
                        ws.Cell(row, 5).Value = item.FarmPhone;
                        ws.Cell(row, 6).Value = item.Area;
                        ws.Cell(row, 7).Value = item.FarmAddress;
                        ws.Cell(row, 8).Value = item.Status == 1 ? "Hoạt động" : "Ngưng";
                        row++;
                    }

                    ws.Columns().AdjustToContents();
                    using (var ms = new MemoryStream())
                    {
                        workbook.SaveAs(ms);
                        return ms.ToArray();
                    }
                }
            }
            catch (Exception ex) { _logger.LogError(ex, "Error in ExportFarmsToExcelAsync"); throw; }
        }
    }
}