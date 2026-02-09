using Dapper;
using TAS.DTOs;
using TAS.DTOs.TAS.DTOs;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	// ========================================
	// AGENT TABLE MODELS - SQL QUERIES
	// ========================================
	public class AgentModels
	{
		private readonly ConnectDbHelper _dbHelper;
		private readonly ILogger<AgentModels> _logger;

		public AgentModels(ConnectDbHelper dbHelper, ILogger<AgentModels> logger)
		{
			_dbHelper = dbHelper;
			_logger = logger;
		}

		// ========================================
		// GET TABLE DATA - With Filters & Pagination
		// ========================================
		public async Task<PagedResult<RubberAgentResponse>> GetAgentsWithFilterAsync(RubberAgentRequest filter)
		{
			try
			{
				var whereConditions = new List<string> { "1=1" };
				var parameters = new DynamicParameters();

				// --- 1. TÌM KIẾM THEO TỪ KHÓA (Keyword) ---
				if (!string.IsNullOrWhiteSpace(filter.Keyword))
				{
					whereConditions.Add(@"(
						AgentCode LIKE @Keyword OR 
						AgentName LIKE @Keyword OR 
						AgentPhone LIKE @Keyword OR 
						AgentAddress LIKE @Keyword
					)");
					parameters.Add("@Keyword", $"%{filter.Keyword}%");
				}

				// --- 2. LỌC THEO TRẠNG THÁI (IsActive) ---
				//if (filter.IsActive)
				//{
				//	whereConditions.Add("IsActive = @IsActive");
				//	parameters.Add("@IsActive", filter.IsActive);
				//}

				string whereSql = string.Join(" AND ", whereConditions);

				// --- BƯỚC 2: ĐẾM TỔNG SỐ DÒNG ---
				var countSql = $"SELECT COUNT(1) FROM RubberAgent WHERE {whereSql}";
				var totalRecords = await _dbHelper.ExecuteScalarAsync<int>(countSql, parameters);

				// --- BƯỚC 3: LẤY DỮ LIỆU PHÂN TRANG ---
				var offset = (filter.PageIndex - 1) * filter.PageSize;

				var dataSql = $@"
				SELECT 
					-- Tính toán rowNo dựa trên số trang và thứ tự
					rowNo = ROW_NUMBER() OVER (ORDER BY AgentId DESC),
					AgentId,
					AgentCode,
					AgentName,
					OwnerName,
					AgentPhone,
					AgentAddress,
					IsActive,
					RegisterDate,
					RegisterPerson,
					UpdateDate,
					UpdatePerson

				FROM RubberAgent
				WHERE {whereSql}
				ORDER BY AgentId -- Mặc định đại lý mới nhất lên đầu
				OFFSET @Offset ROWS
				FETCH NEXT @PageSize ROWS ONLY";

				parameters.Add("@Offset", offset);
				parameters.Add("@PageSize", filter.PageSize);

				// Map kết quả vào RubberAgentResponse để trả về các field UI Helpers
				var items = await _dbHelper.QueryAsync<RubberAgentResponse>(dataSql, parameters);

				return new PagedResult<RubberAgentResponse>
				{
					Items = items.ToList(),
					TotalRecords = totalRecords
				};
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetTableDataAsync (RubberAgent)");
				throw;
			}
		}

		//// ========================================
		//// GET AGENT BY ID
		//// ========================================
		//public async Task<RubberAgentDto?> GetAgentByIdAsync(int agentId)
		//{
		//	var query = @"
		//              SELECT 
		//			A.AgentId,
		//			A.AgentCode,
		//			A.AgentName,
		//			A.AgentPhone,
		//			A.AgentAddress,
		//			A.IsActive,
		//			A.RegisterDate,
		//			A.RegisterPerson,
		//			A.UpdateDate,
		//			A.UpdatePerson,
		//			F.Polygon
		//              FROM RubberAgent A
		//		LEFT JOIN RubberFarm F ON A.AgentCode = F.AgentCode
		//              WHERE AgentId = @AgentId";
		//	return await _dbHelper.QueryFirstOrDefaultAsync<RubberAgentDto>(query, new { AgentId = agentId });
		//}

		//// ========================================
		//// GET AGENT BY CODE
		//// ========================================
		//public async Task<RubberAgentDto?> GetAgentByCodeAsync(string agentCode)
		//{
		//	var query = @"
		//              SELECT 
		//			A.AgentId,
		//			A.AgentCode,
		//			A.AgentName,
		//			A.AgentPhone,
		//			A.AgentAddress,
		//			A.IsActive,
		//			A.RegisterDate,
		//			A.RegisterPerson,
		//			A.UpdateDate,
		//			A.UpdatePerson,
		//			F.Polygon
		//              FROM RubberAgent A
		//		LEFT JOIN RubberFarm F ON A.AgentCode = F.AgentCode
		//              WHERE AgentCode = @AgentCode";

		//	return await _dbHelper.QueryFirstOrDefaultAsync<RubberAgentDto>(query, new { AgentCode = agentCode });
		//}

		//// ========================================
		//// GET ALL ACTIVE AGENTS
		//// ========================================
		//public async Task<List<RubberAgentDto>> GetActiveAgentsAsync()
		//{


		//	var query = @"
		//              SELECT 
		//                  AgentId,
		//                  AgentCode,
		//                  AgentName,
		//                  AgentPhone,
		//                  AgentAddress,
		//                  IsActive,
		//                  RegisterDate,
		//                  RegisterPerson,
		//                  UpdateDate,
		//                  UpdatePerson
		//              FROM RubberAgent
		//              WHERE IsActive = 1
		//              ORDER BY AgentName";

		//	var result = await _dbHelper.QueryAsync<RubberAgentDto>(query);
		//	return result.ToList();
		//}

		//// ========================================
		//// GET AGENTS FOR DROPDOWN
		//// ========================================
		//public async Task<List<AgentDropdownDto>> GetAgentsForDropdownAsync(bool activeOnly = true)
		//{


		//	var whereClause = activeOnly ? "WHERE IsActive = 1" : "";

		//	var query = $@"
		//              SELECT 
		//                  AgentId,
		//                  AgentCode,
		//                  AgentName
		//              FROM RubberAgent
		//              {whereClause}
		//              ORDER BY AgentName";

		//	var result = await _dbHelper.QueryAsync<AgentDropdownDto>(query);
		//	return result.ToList();
		//}

		//// ========================================
		//// GET AGENT STATISTICS
		//// ========================================
		//public async Task<AgentStatisticsDto> GetAgentStatisticsAsync()
		//{


		//	var query = @"
		//              SELECT 
		//                  COUNT(*) AS TotalAgents,
		//                  SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveAgents,
		//                  SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) AS InactiveAgents,
		//                  COUNT(DISTINCT CASE WHEN RegisterDate >= DATEADD(MONTH, -1, GETDATE()) THEN AgentId END) AS NewAgentsThisMonth,
		//                  (SELECT COUNT(DISTINCT AgentCode) 
		//                   FROM RubberPond 
		//                   WHERE AgentCode IN (SELECT AgentCode FROM RubberAgent WHERE IsActive = 1)) AS AgentsWithPonds
		//              FROM RubberAgent";

		//	return await _dbHelper.QueryFirstOrDefaultAsync<AgentStatisticsDto>(query);
		//}

		//// ========================================
		//// GET AGENTS WITH POND COUNT
		//// ========================================
		//public async Task<List<AgentWithPondCountDto>> GetAgentsWithPondCountAsync()
		//{


		//	var query = @"
		//              SELECT 
		//                  a.AgentId,
		//                  a.AgentCode,
		//                  a.AgentName,
		//                  a.AgentPhone,
		//                  a.AgentAddress,
		//                  a.IsActive,
		//                  COUNT(p.PondId) AS PondCount,
		//                  SUM(ISNULL(p.CurrentNetKg, 0)) AS TotalNetKg
		//              FROM RubberAgent a
		//              LEFT JOIN RubberPond p ON p.AgentCode = a.AgentCode
		//              GROUP BY 
		//                  a.AgentId, 
		//                  a.AgentCode, 
		//                  a.AgentName, 
		//                  a.AgentPhone, 
		//                  a.AgentAddress, 
		//                  a.IsActive
		//              ORDER BY a.AgentName";

		//	var result = await _dbHelper.QueryAsync<AgentWithPondCountDto>(query);
		//	return result.ToList();
		//}

		//// ========================================
		//// CHECK AGENT CODE EXISTS
		//// ========================================
		//public async Task<bool> AgentCodeExistsAsync(string agentCode, int? excludeAgentId = null)
		//{


		//	var query = excludeAgentId.HasValue
		//		? "SELECT COUNT(*) FROM RubberAgent WHERE AgentCode = @AgentCode AND AgentId != @ExcludeAgentId"
		//		: "SELECT COUNT(*) FROM RubberAgent WHERE AgentCode = @AgentCode";

		//	var count = await _dbHelper.ExecuteScalarAsync<int>(query, new
		//	{
		//		AgentCode = agentCode,
		//		ExcludeAgentId = excludeAgentId
		//	});

		//	return count > 0;
		//}

		//// ========================================
		//// CHECK AGENT IS USED
		//// ========================================
		//public async Task<bool> AgentIsUsedAsync(int agentId)
		//{


		//	var query = @"
		//              SELECT COUNT(*) 
		//              FROM RubberPond 
		//              WHERE AgentCode = (SELECT AgentCode FROM RubberAgent WHERE AgentId = @AgentId)";

		//	var count = await _dbHelper.ExecuteScalarAsync<int>(query, new { AgentId = agentId });

		//	return count > 0;
		//}

		//// ========================================
		//// CREATE AGENT
		//// ========================================
		//public async Task<int> CreateAgentAsync(CreateAgentDto dto, string userName)
		//{


		//	var insertQuery = @"
		//              INSERT INTO RubberAgent (
		//                  AgentCode, 
		//                  AgentName, 
		//                  AgentPhone, 
		//                  AgentAddress, 
		//                  IsActive, 
		//                  RegisterDate, 
		//                  RegisterPerson
		//              )
		//              VALUES (
		//                  @AgentCode, 
		//                  @AgentName, 
		//                  @AgentPhone, 
		//                  @AgentAddress, 
		//                  @IsActive, 
		//                  GETDATE(), 
		//                  @RegisterPerson                    
		//              );
		//              SELECT CAST(SCOPE_IDENTITY() as int);";

		//	var agentId = await _dbHelper.ExecuteScalarAsync<int>(insertQuery, new
		//	{
		//		dto.AgentCode,
		//		dto.AgentName,
		//		dto.AgentPhone,
		//		dto.AgentAddress,
		//		dto.IsActive,
		//		RegisterPerson = userName
		//	});

		//	return agentId;
		//}

		//// ========================================
		//// UPDATE AGENT
		//// ========================================
		//public async Task<bool> UpdateAgentAsync(UpdateAgentDto dto, string userName)
		//{


		//	var updateQuery = @"
		//              UPDATE RubberAgent
		//              SET 
		//                  AgentCode = @AgentCode,
		//                  AgentName = @AgentName,
		//                  AgentPhone = @AgentPhone,
		//                  AgentAddress = @AgentAddress,
		//                  IsActive = @IsActive,
		//                  UpdateDate = GETDATE(),
		//                  UpdatePerson = @UpdatePerson
		//              WHERE AgentId = @AgentId";

		//	var rowsAffected = await _dbHelper.ExecuteAsync(updateQuery, new
		//	{
		//		dto.AgentId,
		//		dto.AgentCode,
		//		dto.AgentName,
		//		dto.AgentPhone,
		//		dto.AgentAddress,
		//		dto.IsActive,
		//		UpdatePerson = userName
		//	});

		//	return rowsAffected > 0;
		//}

		//// ========================================
		//// DELETE AGENT
		//// ========================================
		//public async Task<bool> DeleteAgentAsync(int agentId)
		//{


		//	var deleteQuery = "DELETE FROM RubberAgent WHERE AgentId = @AgentId";
		//	var rowsAffected = await _dbHelper.ExecuteAsync(deleteQuery, new { AgentId = agentId });

		//	return rowsAffected > 0;
		//}

		//// ========================================
		//// BULK DELETE AGENTS
		//// ========================================
		//public async Task<int> BulkDeleteAgentsAsync(List<int> agentIds)
		//{


		//	var ids = string.Join(",", agentIds);
		//	var deleteQuery = $"DELETE FROM RubberAgent WHERE AgentId IN ({ids})";
		//	var rowsAffected = await _dbHelper.ExecuteAsync(deleteQuery);

		//	return rowsAffected;
		//}

		//// ========================================
		//// SEARCH AGENTS (Simple)
		//// ========================================
		//public async Task<List<RubberAgentDto>> SearchAgentsAsync(string keyword)
		//{


		//	var query = @"
		//              SELECT 
		//                  AgentId,
		//                  AgentCode,
		//                  AgentName,
		//                  AgentPhone,
		//                  AgentAddress,
		//                  IsActive,
		//                  RegisterDate,
		//                  RegisterPerson,
		//                  UpdateDate,
		//                  UpdatePerson
		//              FROM RubberAgent
		//              WHERE AgentCode LIKE @Keyword 
		//                 OR AgentName LIKE @Keyword 
		//                 OR AgentPhone LIKE @Keyword
		//              ORDER BY AgentName";

		//	var result = await _dbHelper.QueryAsync<RubberAgentDto>(query, new { Keyword = $"%{keyword}%" });
		//	return result.ToList();
		//}

		//// ========================================
		//// GET AGENTS BY IDS
		//// ========================================
		//public async Task<List<RubberAgentDto>> GetAgentsByIdsAsync(List<int> agentIds)
		//{


		//	var ids = string.Join(",", agentIds);
		//	var query = $@"
		//              SELECT 
		//                  AgentId,
		//                  AgentCode,
		//                  AgentName,
		//                  AgentPhone,
		//                  AgentAddress,
		//                  IsActive,
		//                  RegisterDate,
		//                  RegisterPerson,
		//                  UpdateDate,
		//                  UpdatePerson
		//              FROM RubberAgent
		//              WHERE AgentId IN ({ids})
		//              ORDER BY AgentName";

		//	var result = await _dbHelper.QueryAsync<RubberAgentDto>(query);
		//	return result.ToList();
		//}
	}
}
