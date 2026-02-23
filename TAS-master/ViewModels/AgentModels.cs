using Dapper;
using Microsoft.AspNetCore.Identity;
using TAS.DTOs;
using TAS.DTOs.TAS.DTOs;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	// ========================================
	// AGENT TABLE MODELS - SQL QUERIES
	// ========================================
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

		// ========================================
		// Thêm/Sửa 1 Đại lý (Agent)
		// ========================================
		public int AddOrUpdateAgent(RubberAgentRequest request)
		{
			try
			{
				if (request == null)
					throw new ArgumentNullException(nameof(request));

				// Validate
				if (string.IsNullOrWhiteSpace(request.AgentName))
					throw new ArgumentException("Tên đại lý không được để trống");

				var sql = @"
					IF EXISTS (SELECT 1 FROM Agent WHERE AgentId = @AgentId)
					BEGIN
						-- Update
						UPDATE Agent SET
							AgentCode = @AgentCode,
							AgentName = @AgentName,
							OwnerName = @OwnerName,
							AgentPhone = @AgentPhone,
							AgentAddress = @AgentAddress,
							IsActive = @IsActive,
							UpdateDate = GETDATE(),
							UpdatePerson = @UpdatePerson
						WHERE AgentId = @AgentId;
                
						SELECT @AgentId;
					END
					ELSE
					BEGIN
						-- Insert
						INSERT INTO Agent (
							AgentCode, AgentName, OwnerName, AgentPhone, AgentAddress, 
							IsActive, RegisterDate, RegisterPerson
						)
						VALUES (
							@AgentCode, @AgentName, @OwnerName, @AgentPhone, @AgentAddress, 
							@IsActive, GETDATE(), @RegisterPerson
						);
                
						SELECT CAST(SCOPE_IDENTITY() AS INT);
					END
				";

				// Generate AgentCode nếu là Insert và chưa có mã truyền vào
				// (Bạn có thể điều chỉnh lại logic sinh mã theo rule của dự án)
				var agentCode = request.AgentId > 0
					? request.AgentCode
					: (string.IsNullOrWhiteSpace(request.AgentCode)
						? $"AG{DateTime.Now:yyMMdd}{Guid.NewGuid().ToString()[..4].ToUpper()}"
						: request.AgentCode);

				var result = _dbHelper.QueryFirstOrDefault<int>(sql, new
				{
					AgentId = request.AgentId,
					AgentCode = agentCode,
					AgentName = request.AgentName,
					OwnerName = request.OwnerName,
					AgentPhone = request.AgentPhone,
					AgentAddress = request.AgentAddress,
					IsActive = request.IsActive ? 1 : 0, // Mặc định là 1 (Active) nếu null
					UpdatePerson = _userManage.Name,
					RegisterPerson = _userManage.Name
				});

				return result;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in AddOrUpdateAgent");
				throw;
			}
		}
	}
}
