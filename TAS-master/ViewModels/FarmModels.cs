using Dapper;
using TAS.Models;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class FarmModels
	{
		private readonly ICurrentUser _userManage;
		private readonly ILogger<FarmModels> _logger;
		ConnectDbHelper dbHelper = new ConnectDbHelper();
		public FarmModels(ICurrentUser userManage, ILogger<FarmModels> logger)
		{
			_userManage = userManage;
			_logger = logger;
		}
		// ========================================
		// GET TABLE DATA - With Filters & Pagination
		// ========================================
		public async Task<FarmTableResult> GetTableDataAsync(FarmSearchDto searchDto)
		{
			try {
				var whereClauses = new List<string> { "1=1" };
				var parameters = new DynamicParameters();

				// Build WHERE clauses
				if (!string.IsNullOrWhiteSpace(searchDto.SearchKeyword))
				{
					whereClauses.Add("(f.FarmCode LIKE @SearchKeyword OR f.FarmerName LIKE @SearchKeyword OR f.FarmPhone LIKE @SearchKeyword)");
					parameters.Add("@SearchKeyword", $"%{searchDto.SearchKeyword}%");
				}

				if (!string.IsNullOrWhiteSpace(searchDto.FarmCode))
				{
					whereClauses.Add("f.FarmCode LIKE @FarmCode");
					parameters.Add("@FarmCode", $"%{searchDto.FarmCode}%");
				}

				if (!string.IsNullOrWhiteSpace(searchDto.FarmerName))
				{
					whereClauses.Add("f.FarmerName LIKE @FarmerName");
					parameters.Add("@FarmerName", $"%{searchDto.FarmerName}%");
				}

				if (!string.IsNullOrWhiteSpace(searchDto.AgentCode))
				{
					whereClauses.Add("f.AgentCode = @AgentCode");
					parameters.Add("@AgentCode", searchDto.AgentCode);
				}

				//if (searchDto.IsActive.HasValue)
				//{
				//	whereClauses.Add("f.IsActive = @IsActive");
				//	parameters.Add("@IsActive", searchDto.IsActive.Value ? 1 : 0);
				//}

				//if (searchDto.FromDate.HasValue)
				//{
				//	whereClauses.Add("f.RegisterDate >= @FromDate");
				//	parameters.Add("@FromDate", searchDto.FromDate.Value);
				//}

				//if (searchDto.ToDate.HasValue)
				//{
				//	whereClauses.Add("f.RegisterDate <= @ToDate");
				//	parameters.Add("@ToDate", searchDto.ToDate.Value.AddDays(1).AddSeconds(-1));
				//}

				var whereClause = string.Join(" AND ", whereClauses);

				// Count total
				var countQuery = $"SELECT COUNT(*) FROM RubberFarm f WHERE {whereClause}";
				var totalRecords = await dbHelper.ExecuteScalarAsync<int>(countQuery, parameters);

				// Get data with pagination
				var validSortColumns = new[] { "FarmId", "FarmCode", "FarmerName", "AgentCode", "RegisterDate", "IsActive" };
				var sortColumn = validSortColumns.Contains(searchDto.SortColumn) ? "f." + searchDto.SortColumn : "f.RegisterDate";
				var sortOrder = searchDto.SortOrder.ToLower() == "asc" ? "ASC" : "DESC";

				var offset = (searchDto.PageNumber - 1) * searchDto.PageSize;

				var query = $@"
                SELECT 
                    f.FarmId,
                    f.FarmCode,
                    f.AgentCode,
                    f.FarmerName,
                    f.FarmPhone,
                    f.FarmAddress,
                    f.IsActive,
                    f.Certificates,
                    f.TotalAreaHa,
                    f.RubberAreaHa,
                    f.TotalExploit,
                    f.RegisterDate,
                    f.RegisterPerson,
                    f.UpdateDate,
                    f.UpdatePerson,
                    a.AgentName,
                    a.AgentAddress,
                    Polygon = ISNULL(f.Polygon, '')
                FROM RubberFarm f
                LEFT JOIN RubberAgent a ON f.AgentCode = a.AgentCode
                WHERE {whereClause}
                ORDER BY {sortColumn} {sortOrder}
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY";

				parameters.Add("@Offset", offset);
				parameters.Add("@PageSize", searchDto.PageSize);

				var farms = await dbHelper.QueryAsync<RubberFarm>(query, parameters);

				return new FarmTableResult
				{
					Data = farms.ToList(),
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
		// GET FARM BY ID
		// ========================================
		public async Task<RubberFarm?> GetFarmByIdAsync(long farmId)
		{
			

			var query = @"
                SELECT 
                    f.FarmId,
                    f.FarmCode,
                    f.AgentCode,
                    f.FarmerName,
                    f.FarmPhone,
                    f.FarmAddress,
                    f.IsActive,
                    f.Certificates,
                    f.TotalAreaHa,
                    f.RubberAreaHa,
                    f.TotalExploit,
                    f.RegisterDate,
                    f.RegisterPerson,
                    f.UpdateDate,
                    f.UpdatePerson,
                    a.AgentName,
                    a.AgentAddress,
                    f.Polygon
                FROM RubberFarm f
                LEFT JOIN RubberAgent a ON f.AgentCode = a.AgentCode
                WHERE f.FarmId = @FarmId";

			return await dbHelper.QueryFirstOrDefaultAsync<RubberFarm>(query, new { FarmId = farmId });
		}

		// ========================================
		// GET FARM BY CODE
		// ========================================
		public async Task<RubberFarm?> GetFarmByCodeAsync(string farmCode)
		{
			

			var query = @"
                SELECT 
                    f.FarmId,
                    f.FarmCode,
                    f.AgentCode,
                    f.FarmerName,
                    f.FarmPhone,
                    f.FarmAddress,
                    f.IsActive,
                    f.Certificates,
                    f.TotalAreaHa,
                    f.RubberAreaHa,
                    f.TotalExploit,
                    f.RegisterDate,
                    f.RegisterPerson,
                    f.UpdateDate,
                    f.UpdatePerson,
                    a.AgentName,
                    f.Polygon
                FROM RubberFarm f
                LEFT JOIN RubberAgent a ON f.AgentCode = a.AgentCode
                WHERE f.FarmCode = @FarmCode";

			return await dbHelper.QueryFirstOrDefaultAsync<RubberFarm>(query, new { FarmCode = farmCode });
		}

		// ========================================
		// GET ALL ACTIVE FARMS
		// ========================================
		public async Task<List<RubberFarm>> GetActiveFarmsAsync()
		{
			

			var query = @"
                SELECT 
                    f.FarmId,
                    f.FarmCode,
                    f.FarmerName,
                    f.AgentCode,
                    a.AgentName,
                    f.IsActive
                FROM RubberFarm f
                LEFT JOIN RubberAgent a ON f.AgentCode = a.AgentCode
                WHERE f.IsActive = 1
                ORDER BY f.FarmerName";

			var result = await dbHelper.QueryAsync<RubberFarm>(query);
			return result.ToList();
		}

		// ========================================
		// GET FARMS BY AGENT CODE
		// ========================================
		public async Task<List<RubberFarm>> GetFarmsByAgentCodeAsync(string agentCode)
		{
			

			var query = @"
                SELECT 
                    f.FarmId,
                    f.FarmCode,
                    f.FarmerName,
                    f.FarmPhone,
                    f.FarmAddress,
                    f.IsActive,
                    f.TotalAreaHa,
                    f.RubberAreaHa,
                    f.TotalExploit
                FROM RubberFarm f
                WHERE f.AgentCode = @AgentCode
                ORDER BY f.FarmerName";

			var result = await dbHelper.QueryAsync<RubberFarm>(query, new { AgentCode = agentCode });
			return result.ToList();
		}

		// ========================================
		// GET FARMS FOR DROPDOWN
		// ========================================
		public async Task<List<FarmDropdownDto>> GetFarmsForDropdownAsync(bool activeOnly = true)
		{
			

			var whereClause = activeOnly ? "WHERE IsActive = 1" : "";

			var query = $@"
                SELECT 
                    FarmId,
                    FarmCode,
                    FarmerName,
                    AgentCode
                FROM RubberFarm
                {whereClause}
                ORDER BY FarmerName";

			var result = await dbHelper.QueryAsync<FarmDropdownDto>(query);
			return result.ToList();
		}

		// ========================================
		// GET FARM STATISTICS
		// ========================================
		public async Task<FarmStatisticsDto> GetFarmStatisticsAsync()
		{


			//var query = @"
			//             SELECT 
			//                 COUNT(*) AS TotalFarms,
			//                 SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveFarms,
			//                 SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) AS InactiveFarms,
			//                 COUNT(DISTINCT CASE WHEN RegisterDate >= DATEADD(MONTH, -1, GETDATE()) THEN FarmId END) AS NewFarmsThisMonth,
			//                 SUM(ISNULL(TotalAreaHa, 0)) AS TotalAreaHa,
			//                 SUM(ISNULL(RubberAreaHa, 0)) AS TotalRubberAreaHa,
			//                 SUM(ISNULL(TotalExploit, 0)) AS TotalExploitKg,
			//                 COUNT(DISTINCT AgentCode) AS TotalAgents
			//             FROM RubberFarm";

			//return await dbHelper.QueryFirstOrDefaultAsync<FarmStatisticsDto>(query);
			return new FarmStatisticsDto();
		}

		// ========================================
		// CHECK FARM CODE EXISTS
		// ========================================
		public async Task<bool> FarmCodeExistsAsync(string farmCode, long? excludeFarmId = null)
		{
			

			var query = excludeFarmId.HasValue
				? "SELECT COUNT(*) FROM RubberFarm WHERE FarmCode = @FarmCode AND FarmId != @ExcludeFarmId"
				: "SELECT COUNT(*) FROM RubberFarm WHERE FarmCode = @FarmCode";

			var count = await dbHelper.ExecuteScalarAsync<int>(query, new
			{
				FarmCode = farmCode,
				ExcludeFarmId = excludeFarmId
			});

			return count > 0;
		}

		// ========================================
		// CHECK FARM IS USED (has intakes)
		// ========================================
		public async Task<bool> FarmIsUsedAsync(long farmId)
		{
			

			var query = @"
                SELECT COUNT(*) 
                FROM RubberIntake 
                WHERE FarmCode = (SELECT FarmCode FROM RubberFarm WHERE FarmId = @FarmId)";

			var count = await dbHelper.ExecuteScalarAsync<int>(query, new { FarmId = farmId });

			return count > 0;
		}

		// ========================================
		// CREATE FARM
		// ========================================
		public async Task<long> CreateFarmAsync(CreateFarmDto dto, string userName)
		{
			

			var insertQuery = @"
                INSERT INTO RubberFarm (
                    FarmCode, 
                    AgentCode,
                    FarmerName, 
                    FarmPhone, 
                    FarmAddress, 
                    IsActive,
                    Certificates,
                    TotalAreaHa,
                    RubberAreaHa,
                    TotalExploit,
                    RegisterDate, 
                    RegisterPerson,
                    Polygon
                )
                VALUES (
                    @FarmCode, 
                    @AgentCode,
                    @FarmerName, 
                    @FarmPhone, 
                    @FarmAddress, 
                    @IsActive,
                    @Certificates,
                    @TotalAreaHa,
                    @RubberAreaHa,
                    @TotalExploit,
                    GETDATE(), 
                    @RegisterPerson,
                    " + (string.IsNullOrWhiteSpace(dto.Polygon)
						? "NULL"
						: $"geography::STGeomFromText('{dto.Polygon}', 4326)") + @"
                );
                SELECT CAST(SCOPE_IDENTITY() as bigint);";

			var farmId = await dbHelper.ExecuteScalarAsync<long>(insertQuery, new
			{
				dto.FarmCode,
				dto.AgentCode,
				dto.FarmerName,
				dto.FarmPhone,
				dto.FarmAddress,
				dto.IsActive,
				dto.Certificates,
				dto.TotalAreaHa,
				dto.RubberAreaHa,
				dto.TotalExploit,
				RegisterPerson = userName
			});

			return farmId;
		}

		// ========================================
		// UPDATE FARM
		// ========================================
		public async Task<bool> UpdateFarmAsync(UpdateFarmDto dto, string userName)
		{
			

			var updateQuery = @"
                UPDATE RubberFarm
                SET 
                    FarmCode = @FarmCode,
                    AgentCode = @AgentCode,
                    FarmerName = @FarmerName,
                    FarmPhone = @FarmPhone,
                    FarmAddress = @FarmAddress,
                    IsActive = @IsActive,
                    Certificates = @Certificates,
                    TotalAreaHa = @TotalAreaHa,
                    RubberAreaHa = @RubberAreaHa,
                    TotalExploit = @TotalExploit,
                    UpdateDate = GETDATE(),
                    UpdatePerson = @UpdatePerson,
                    Polygon = " + (string.IsNullOrWhiteSpace(dto.Polygon)
						? "NULL"
						: $"geography::STGeomFromText('{dto.Polygon}', 4326)") + @"
                WHERE FarmId = @FarmId";

			var rowsAffected = await dbHelper.ExecuteAsync(updateQuery, new
			{
				dto.FarmId,
				dto.FarmCode,
				dto.AgentCode,
				dto.FarmerName,
				dto.FarmPhone,
				dto.FarmAddress,
				dto.IsActive,
				dto.Certificates,
				dto.TotalAreaHa,
				dto.RubberAreaHa,
				dto.TotalExploit,
				UpdatePerson = userName
			});

			return rowsAffected > 0;
		}

		// ========================================
		// DELETE FARM
		// ========================================
		public async Task<bool> DeleteFarmAsync(long farmId)
		{
			

			var deleteQuery = "DELETE FROM RubberFarm WHERE FarmId = @FarmId";
			var rowsAffected = await dbHelper.ExecuteAsync(deleteQuery, new { FarmId = farmId });

			return rowsAffected > 0;
		}

		// ========================================
		// BULK DELETE FARMS
		// ========================================
		public async Task<int> BulkDeleteFarmsAsync(List<long> farmIds)
		{
			

			var ids = string.Join(",", farmIds);
			var deleteQuery = $"DELETE FROM RubberFarm WHERE FarmId IN ({ids})";
			var rowsAffected = await dbHelper.ExecuteAsync(deleteQuery);

			return rowsAffected;
		}

		// ========================================
		// APPROVE/UNAPPROVE FARM
		// ========================================
		public async Task<bool> ApproveFarmAsync(long farmId, bool isActive)
		{
			

			var updateQuery = @"
                UPDATE RubberFarm 
                SET IsActive = @IsActive 
                WHERE FarmId = @FarmId";

			var rowsAffected = await dbHelper.ExecuteAsync(updateQuery, new { FarmId = farmId, IsActive = isActive });

			return rowsAffected > 0;
		}

		// ========================================
		// IMPORT POLYGON
		// ========================================
		public async Task<bool> ImportPolygonAsync(long farmId, string polygon)
		{
			

			var updateQuery = $@"
                UPDATE RubberFarm 
                SET Polygon = geography::STGeomFromText('{polygon}', 4326)
                WHERE FarmId = @FarmId";

			var rowsAffected = await dbHelper.ExecuteAsync(updateQuery, new { FarmId = farmId });

			return rowsAffected > 0;
		}

		// ========================================
		// SEARCH FARMS (Simple)
		// ========================================
		public async Task<List<RubberFarm>> SearchFarmsAsync(string keyword)
		{
			

			var query = @"
                SELECT 
                    f.FarmId,
                    f.FarmCode,
                    f.AgentCode,
                    f.FarmerName,
                    f.FarmPhone,
                    f.FarmAddress,
                    f.IsActive,
                    a.AgentName
                FROM RubberFarm f
                LEFT JOIN RubberAgent a ON f.AgentCode = a.AgentCode
                WHERE f.FarmCode LIKE @Keyword 
                   OR f.FarmerName LIKE @Keyword 
                   OR f.FarmPhone LIKE @Keyword
                ORDER BY f.FarmerName";

			var result = await dbHelper.QueryAsync<RubberFarm>(query, new { Keyword = $"%{keyword}%" });
			return result.ToList();
		}

		// ========================================
		// GET FARMS BY IDS
		// ========================================
		public async Task<List<RubberFarm>> GetFarmsByIdsAsync(List<long> farmIds)
		{
			

			var ids = string.Join(",", farmIds);
			var query = $@"
                SELECT 
                    f.FarmId,
                    f.FarmCode,
                    f.FarmerName,
                    f.AgentCode,
                    a.AgentName,
                    f.FarmPhone,
                    f.FarmAddress,
                    f.IsActive
                FROM RubberFarm f
                LEFT JOIN RubberAgent a ON f.AgentCode = a.AgentCode
                WHERE f.FarmId IN ({ids})
                ORDER BY f.FarmerName";

			var result = await dbHelper.QueryAsync<RubberFarm>(query);
			return result.ToList();
		}
	}
}
