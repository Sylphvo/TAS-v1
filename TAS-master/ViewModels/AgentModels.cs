using Dapper;
using TAS.DTOs;
using TAS.Helpers;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	// ========================================
	// AGENT TABLE MODELS - SQL QUERIES
	// ========================================
	public class AgentModels
	{
		private readonly ConnectDbHelper _dbHelper;
		private readonly ILogger<TraceabilityModels> _logger;

		public AgentModels(ConnectDbHelper dbHelper, ILogger<TraceabilityModels> logger)
		{
			_dbHelper = dbHelper;
			_logger = logger;
		}

		// ========================================
		// GET TABLE DATA - With Filters & Pagination
		// ========================================
		public async Task<AgentTableResult> GetTableDataAsync(AgentSearchDto searchDto)
		{
			try {						
				var whereClauses = new List<string> { "1=1" };
				var parameters = new DynamicParameters();

				// Build WHERE clauses
				if (!string.IsNullOrWhiteSpace(searchDto.SearchKeyword))
				{
					whereClauses.Add("(AgentCode LIKE @SearchKeyword OR AgentName LIKE @SearchKeyword OR AgentPhone LIKE @SearchKeyword)");
					parameters.Add("@SearchKeyword", $"%{searchDto.SearchKeyword}%");
				}

				if (!string.IsNullOrWhiteSpace(searchDto.AgentCode))
				{
					whereClauses.Add("AgentCode LIKE @AgentCode");
					parameters.Add("@AgentCode", $"%{searchDto.AgentCode}%");
				}

				if (!string.IsNullOrWhiteSpace(searchDto.AgentName))
				{
					whereClauses.Add("AgentName LIKE @AgentName");
					parameters.Add("@AgentName", $"%{searchDto.AgentName}%");
				}

				//if (searchDto.IsActive.HasValue)
				//{
				//	whereClauses.Add("IsActive = @IsActive");
				//	parameters.Add("@IsActive", searchDto.IsActive.Value ? 1 : 0);
				//}

				//if (searchDto.FromDate.HasValue)
				//{
				//	whereClauses.Add("RegisterDate >= @FromDate");
				//	parameters.Add("@FromDate", searchDto.FromDate.Value);
				//}

				//if (searchDto.ToDate.HasValue)
				//{
				//	whereClauses.Add("RegisterDate <= @ToDate");
				//	parameters.Add("@ToDate", searchDto.ToDate.Value.AddDays(1).AddSeconds(-1));
				//}

				var whereClause = string.Join(" AND ", whereClauses);

				// Count total
				var countQuery = $"SELECT COUNT(*) FROM RubberAgent WHERE {whereClause}";
				var totalRecords = await _dbHelper.ExecuteScalarAsync<int>(countQuery, parameters);

				// Get data with pagination
				var validSortColumns = new[] { "AgentId", "AgentCode", "AgentName", "RegisterDate", "IsActive" };
				var sortColumn = validSortColumns.Contains(searchDto.SortColumn) ? searchDto.SortColumn : "RegisterDate";
				var sortOrder = searchDto.SortOrder.ToLower() == "asc" ? "ASC" : "DESC";

				var offset = (searchDto.PageNumber - 1) * searchDto.PageSize;

				var query = $@"
					SELECT 
						AgentId,
						AgentCode,
						AgentName,
						AgentPhone,
						AgentAddress,
						IsActive,
						RegisterDate,
						RegisterPerson,
						UpdateDate,
						UpdatePerson
					FROM RubberAgent
					WHERE {whereClause}
					ORDER BY {sortColumn} {sortOrder}
					OFFSET @Offset ROWS
					FETCH NEXT @PageSize ROWS ONLY";

				parameters.Add("@Offset", offset);
				parameters.Add("@PageSize", searchDto.PageSize);

				var agents = await _dbHelper.QueryAsync<AgentSearchDto>(query, parameters);

				return new AgentTableResult
				{
					Data = agents.ToList(),
					TotalRecords = totalRecords,
					PageNumber = searchDto.PageNumber,
					PageSize = searchDto.PageSize,
					TotalPages = (int)Math.Ceiling(totalRecords / (double)searchDto.PageSize)
				};
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetTableDataAsync");
				throw;
			}
		}

		// ========================================
		// GET AGENT BY ID
		// ========================================
		public async Task<RubberAgentDto?> GetAgentByIdAsync(int agentId)
		{
			var query = @"
                SELECT 
					A.AgentId,
					A.AgentCode,
					A.AgentName,
					A.AgentPhone,
					A.AgentAddress,
					A.IsActive,
					A.RegisterDate,
					A.RegisterPerson,
					A.UpdateDate,
					A.UpdatePerson,
					F.Polygon
                FROM RubberAgent A
				LEFT JOIN RubberFarm F ON A.AgentCode = F.AgentCode
                WHERE AgentId = @AgentId";
			return await _dbHelper.QueryFirstOrDefaultAsync<RubberAgentDto>(query, new { AgentId = agentId });
		}

		// ========================================
		// GET AGENT BY CODE
		// ========================================
		public async Task<RubberAgentDto?> GetAgentByCodeAsync(string agentCode)
		{
			var query = @"
                SELECT 
					A.AgentId,
					A.AgentCode,
					A.AgentName,
					A.AgentPhone,
					A.AgentAddress,
					A.IsActive,
					A.RegisterDate,
					A.RegisterPerson,
					A.UpdateDate,
					A.UpdatePerson,
					F.Polygon
                FROM RubberAgent A
				LEFT JOIN RubberFarm F ON A.AgentCode = F.AgentCode
                WHERE AgentCode = @AgentCode";

			return await _dbHelper.QueryFirstOrDefaultAsync<RubberAgentDto>(query, new { AgentCode = agentCode });
		}

		// ========================================
		// GET ALL ACTIVE AGENTS
		// ========================================
		public async Task<List<RubberAgentDto>> GetActiveAgentsAsync()
		{
			

			var query = @"
                SELECT 
                    AgentId,
                    AgentCode,
                    AgentName,
                    AgentPhone,
                    AgentAddress,
                    IsActive,
                    RegisterDate,
                    RegisterPerson,
                    UpdateDate,
                    UpdatePerson
                FROM RubberAgent
                WHERE IsActive = 1
                ORDER BY AgentName";

			var result = await _dbHelper.QueryAsync<RubberAgentDto>(query);
			return result.ToList();
		}

		// ========================================
		// GET AGENTS FOR DROPDOWN
		// ========================================
		public async Task<List<AgentDropdownDto>> GetAgentsForDropdownAsync(bool activeOnly = true)
		{
			

			var whereClause = activeOnly ? "WHERE IsActive = 1" : "";

			var query = $@"
                SELECT 
                    AgentId,
                    AgentCode,
                    AgentName
                FROM RubberAgent
                {whereClause}
                ORDER BY AgentName";

			var result = await _dbHelper.QueryAsync<AgentDropdownDto>(query);
			return result.ToList();
		}

		// ========================================
		// GET AGENT STATISTICS
		// ========================================
		public async Task<AgentStatisticsDto> GetAgentStatisticsAsync()
		{
			

			var query = @"
                SELECT 
                    COUNT(*) AS TotalAgents,
                    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveAgents,
                    SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) AS InactiveAgents,
                    COUNT(DISTINCT CASE WHEN RegisterDate >= DATEADD(MONTH, -1, GETDATE()) THEN AgentId END) AS NewAgentsThisMonth,
                    (SELECT COUNT(DISTINCT AgentCode) 
                     FROM RubberPond 
                     WHERE AgentCode IN (SELECT AgentCode FROM RubberAgent WHERE IsActive = 1)) AS AgentsWithPonds
                FROM RubberAgent";

			return await _dbHelper.QueryFirstOrDefaultAsync<AgentStatisticsDto>(query);
		}

		// ========================================
		// GET AGENTS WITH POND COUNT
		// ========================================
		public async Task<List<AgentWithPondCountDto>> GetAgentsWithPondCountAsync()
		{
			

			var query = @"
                SELECT 
                    a.AgentId,
                    a.AgentCode,
                    a.AgentName,
                    a.AgentPhone,
                    a.AgentAddress,
                    a.IsActive,
                    COUNT(p.PondId) AS PondCount,
                    SUM(ISNULL(p.CurrentNetKg, 0)) AS TotalNetKg
                FROM RubberAgent a
                LEFT JOIN RubberPond p ON p.AgentCode = a.AgentCode
                GROUP BY 
                    a.AgentId, 
                    a.AgentCode, 
                    a.AgentName, 
                    a.AgentPhone, 
                    a.AgentAddress, 
                    a.IsActive
                ORDER BY a.AgentName";

			var result = await _dbHelper.QueryAsync<AgentWithPondCountDto>(query);
			return result.ToList();
		}

		// ========================================
		// CHECK AGENT CODE EXISTS
		// ========================================
		public async Task<bool> AgentCodeExistsAsync(string agentCode, int? excludeAgentId = null)
		{
			

			var query = excludeAgentId.HasValue
				? "SELECT COUNT(*) FROM RubberAgent WHERE AgentCode = @AgentCode AND AgentId != @ExcludeAgentId"
				: "SELECT COUNT(*) FROM RubberAgent WHERE AgentCode = @AgentCode";

			var count = await _dbHelper.ExecuteScalarAsync<int>(query, new
			{
				AgentCode = agentCode,
				ExcludeAgentId = excludeAgentId
			});

			return count > 0;
		}

		// ========================================
		// CHECK AGENT IS USED
		// ========================================
		public async Task<bool> AgentIsUsedAsync(int agentId)
		{
			

			var query = @"
                SELECT COUNT(*) 
                FROM RubberPond 
                WHERE AgentCode = (SELECT AgentCode FROM RubberAgent WHERE AgentId = @AgentId)";

			var count = await _dbHelper.ExecuteScalarAsync<int>(query, new { AgentId = agentId });

			return count > 0;
		}

		// ========================================
		// CREATE AGENT
		// ========================================
		public async Task<int> CreateAgentAsync(CreateAgentDto dto, string userName)
		{
			

			var insertQuery = @"
                INSERT INTO RubberAgent (
                    AgentCode, 
                    AgentName, 
                    AgentPhone, 
                    AgentAddress, 
                    IsActive, 
                    RegisterDate, 
                    RegisterPerson
                )
                VALUES (
                    @AgentCode, 
                    @AgentName, 
                    @AgentPhone, 
                    @AgentAddress, 
                    @IsActive, 
                    GETDATE(), 
                    @RegisterPerson                    
                );
                SELECT CAST(SCOPE_IDENTITY() as int);";

			var agentId = await _dbHelper.ExecuteScalarAsync<int>(insertQuery, new
			{
				dto.AgentCode,
				dto.AgentName,
				dto.AgentPhone,
				dto.AgentAddress,
				dto.IsActive,
				RegisterPerson = userName
			});

			return agentId;
		}

		// ========================================
		// UPDATE AGENT
		// ========================================
		public async Task<bool> UpdateAgentAsync(UpdateAgentDto dto, string userName)
		{
			

			var updateQuery = @"
                UPDATE RubberAgent
                SET 
                    AgentCode = @AgentCode,
                    AgentName = @AgentName,
                    AgentPhone = @AgentPhone,
                    AgentAddress = @AgentAddress,
                    IsActive = @IsActive,
                    UpdateDate = GETDATE(),
                    UpdatePerson = @UpdatePerson
                WHERE AgentId = @AgentId";

			var rowsAffected = await _dbHelper.ExecuteAsync(updateQuery, new
			{
				dto.AgentId,
				dto.AgentCode,
				dto.AgentName,
				dto.AgentPhone,
				dto.AgentAddress,
				dto.IsActive,
				UpdatePerson = userName
			});

			return rowsAffected > 0;
		}

		// ========================================
		// DELETE AGENT
		// ========================================
		public async Task<bool> DeleteAgentAsync(int agentId)
		{
			

			var deleteQuery = "DELETE FROM RubberAgent WHERE AgentId = @AgentId";
			var rowsAffected = await _dbHelper.ExecuteAsync(deleteQuery, new { AgentId = agentId });

			return rowsAffected > 0;
		}

		// ========================================
		// BULK DELETE AGENTS
		// ========================================
		public async Task<int> BulkDeleteAgentsAsync(List<int> agentIds)
		{
			

			var ids = string.Join(",", agentIds);
			var deleteQuery = $"DELETE FROM RubberAgent WHERE AgentId IN ({ids})";
			var rowsAffected = await _dbHelper.ExecuteAsync(deleteQuery);

			return rowsAffected;
		}

		// ========================================
		// SEARCH AGENTS (Simple)
		// ========================================
		public async Task<List<RubberAgentDto>> SearchAgentsAsync(string keyword)
		{
			

			var query = @"
                SELECT 
                    AgentId,
                    AgentCode,
                    AgentName,
                    AgentPhone,
                    AgentAddress,
                    IsActive,
                    RegisterDate,
                    RegisterPerson,
                    UpdateDate,
                    UpdatePerson
                FROM RubberAgent
                WHERE AgentCode LIKE @Keyword 
                   OR AgentName LIKE @Keyword 
                   OR AgentPhone LIKE @Keyword
                ORDER BY AgentName";

			var result = await _dbHelper.QueryAsync<RubberAgentDto>(query, new { Keyword = $"%{keyword}%" });
			return result.ToList();
		}

		// ========================================
		// GET AGENTS BY IDS
		// ========================================
		public async Task<List<RubberAgentDto>> GetAgentsByIdsAsync(List<int> agentIds)
		{
			

			var ids = string.Join(",", agentIds);
			var query = $@"
                SELECT 
                    AgentId,
                    AgentCode,
                    AgentName,
                    AgentPhone,
                    AgentAddress,
                    IsActive,
                    RegisterDate,
                    RegisterPerson,
                    UpdateDate,
                    UpdatePerson
                FROM RubberAgent
                WHERE AgentId IN ({ids})
                ORDER BY AgentName";

			var result = await _dbHelper.QueryAsync<RubberAgentDto>(query);
			return result.ToList();
		}
	}
}
