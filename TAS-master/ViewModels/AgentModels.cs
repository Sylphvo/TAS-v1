using ClosedXML.Excel;
using Dapper;
using System.Data;
using TAS.DTOs;
using TAS.DTOs.TAS.DTOs;
using TAS.Repository;
using TAS.TagHelpers;
using System.IO;

namespace TAS.ViewModels
{
    public class AgentModels
    {
        private readonly ICurrentUser _userManage;
        private readonly ConnectDbHelper _dbHelper;
        private readonly ILogger<AgentModels> _logger;

        public AgentModels(ConnectDbHelper dbHelper, ILogger<AgentModels> logger, ICurrentUser userManage)
        {
            _dbHelper = dbHelper;
            _logger = logger;
            _userManage = userManage;
        }

        // ========================================
        // 1. GET ALL WITH FILTER AND PAGINATION
        // ========================================
        public async Task<PagedResult<RubberAgentResponse>> GetAgentsWithFilterAsync(RubberAgentRequest filter)
        {
            try
            {
                var whereConditions = new List<string> { "1=1" };
                var parameters = new DynamicParameters();

                if (!string.IsNullOrWhiteSpace(filter.Keyword))
                {
                    whereConditions.Add(@"(
                        AgentCode LIKE @Keyword OR 
                        AgentName LIKE @Keyword OR 
                        AgentPhone LIKE @Keyword OR 
                        AgentAddress LIKE @Keyword OR
                        Email LIKE @Keyword
                    )");
                    parameters.Add("@Keyword", $"%{filter.Keyword}%");
                }

                if (filter.Status.HasValue)
                {
                    whereConditions.Add("Status = @Status");
                    parameters.Add("@Status", filter.Status.Value);
                }

                string whereSql = string.Join(" AND ", whereConditions);
                var countSql = $"SELECT COUNT(1) FROM RubberAgent WHERE {whereSql}";
                var totalRecords = await _dbHelper.ExecuteScalarAsync<int>(countSql, parameters);

                var dataSql = $@"
                SELECT 
                    RowNo = ROW_NUMBER() OVER (ORDER BY AgentId DESC),
                    AgentId, AgentCode, AgentName, AgentAddress, AgentPhone, Email, Notes, Status
                FROM RubberAgent
                WHERE {whereSql}
                ORDER BY AgentId DESC
                OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY";

                parameters.Add("@Skip", (filter.PageIndex - 1) * filter.PageSize);
                parameters.Add("@Take", filter.PageSize);

                var items = await _dbHelper.QueryAsync<RubberAgentResponse>(dataSql, parameters);

                return new PagedResult<RubberAgentResponse>
                {
                    Items = items.ToList(),
                    TotalRecords = totalRecords
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAgentsWithFilterAsync");
                throw;
            }
        }

        // ========================================
        // 2. GET BY ID
        // ========================================
        public async Task<RubberAgentResponse> GetAgentByIdAsync(int id)
        {
            try
            {
                string sql = "SELECT * FROM RubberAgent WHERE AgentId = @Id";
                return await _dbHelper.QueryFirstOrDefaultAsync<RubberAgentResponse>(sql, new { Id = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in GetAgentByIdAsync ID: {id}");
                throw;
            }
        }

        // ========================================
        // 3. ADD OR UPDATE
        // ========================================
        public async Task<long> SaveAgentAsync(RubberAgentRequest request)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@AgentCode", request.AgentCode);
                parameters.Add("@AgentName", request.AgentName);
                parameters.Add("@Address", request.AgentAddress);
                parameters.Add("@Phone", request.AgentPhone);
                parameters.Add("@Email", request.Email);
                parameters.Add("@Notes", request.Notes);
                parameters.Add("@Status", request.Status);

                if (request.AgentId > 0)
                {
                    parameters.Add("@AgentId", request.AgentId);
                    string updateSql = @"
                        UPDATE RubberAgent SET 
                            AgentCode = @AgentCode, AgentName = @AgentName, AgentAddress = @Address, 
                            AgentPhone = @Phone, Email = @Email, Notes = @Notes, Status = @Status
                        WHERE AgentId = @AgentId";
                    await _dbHelper.ExecuteAsync(updateSql, parameters);
                    return request.AgentId;
                }
                else
                {
                    string insertSql = @"
                        INSERT INTO RubberAgent (AgentCode, AgentName, AgentAddress, AgentPhone, Email, Notes, Status)
                        VALUES (@AgentCode, @AgentName, @Address, @Phone, @Email, @Notes, @Status);
                        SELECT CAST(SCOPE_IDENTITY() as bigint);";
                    return await _dbHelper.ExecuteScalarAsync<long>(insertSql, parameters);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SaveAgentAsync");
                throw;
            }
        }

        // ========================================
        // 4. BATCH SAVE & DELETE
        // ========================================
        public async Task<bool> SaveBatchAgentsAsync(List<RubberAgentRequest> requests)
        {
            try
            {
                foreach (var req in requests) { await SaveAgentAsync(req); }
                return true;
            }
            catch (Exception ex) { _logger.LogError(ex, "Error in SaveBatchAgentsAsync"); throw; }
        }

        public async Task<bool> DeleteAgentAsync(int id)
        {
            try
            {
                string sql = "DELETE FROM RubberAgent WHERE AgentId = @Id";
                return await _dbHelper.ExecuteAsync(sql, new { Id = id }) > 0;
            }
            catch (Exception ex) { _logger.LogError(ex, "Error in DeleteAgentAsync"); throw; }
        }

        public async Task<bool> DeleteBatchAgentsAsync(List<long> agentIds)
        {
            try
            {
                string sql = "DELETE FROM RubberAgent WHERE AgentId IN @Ids";
                return await _dbHelper.ExecuteAsync(sql, new { Ids = agentIds }) > 0;
            }
            catch (Exception ex) { _logger.LogError(ex, "Error in DeleteBatchAgentsAsync"); throw; }
        }

        // ========================================
        // 5. EXPORT EXCEL
        // ========================================
        public async Task<byte[]> ExportAgentsToExcelAsync(List<long> agentIds)
        {
            try
            {
                var parameters = new DynamicParameters();
                string sql = "SELECT AgentCode, AgentName, AgentAddress, AgentPhone, Email, Notes, Status FROM RubberAgent ";

                if (agentIds != null && agentIds.Any())
                {
                    sql += "WHERE AgentId IN @Ids ";
                    parameters.Add("@Ids", agentIds);
                }
                sql += "ORDER BY AgentId DESC";

                var items = await _dbHelper.QueryAsync<RubberAgentResponse>(sql, parameters);

                using (var workbook = new XLWorkbook())
                {
                    var ws = workbook.Worksheets.Add("Đại Lý");
                    ws.Cell(1, 1).Value = "Mã Đại lý";
                    ws.Cell(1, 2).Value = "Tên Đại lý";
                    ws.Cell(1, 3).Value = "Địa chỉ";
                    ws.Cell(1, 4).Value = "Điện thoại";
                    ws.Cell(1, 5).Value = "Email";
                    ws.Cell(1, 6).Value = "Ghi chú";
                    ws.Cell(1, 7).Value = "Trạng thái";

                    ws.Range("A1:G1").Style.Font.Bold = true;
                    ws.Range("A1:G1").Style.Fill.BackgroundColor = XLColor.LightGray;

                    int row = 2;
                    foreach (var item in items)
                    {
                        ws.Cell(row, 1).Value = item.AgentCode;
                        ws.Cell(row, 2).Value = item.AgentName;
                        ws.Cell(row, 3).Value = item.AgentAddress;
                        ws.Cell(row, 4).Value = item.AgentPhone;
                        ws.Cell(row, 5).Value = item.Email;
                        ws.Cell(row, 6).Value = item.Notes;
                        ws.Cell(row, 7).Value = item.Status == 1 ? "Hoạt động" : "Ngưng";
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
            catch (Exception ex) { _logger.LogError(ex, "Error in ExportAgentsToExcelAsync"); throw; }
        }
    }
}