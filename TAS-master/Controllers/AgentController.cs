using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAS.DTOs;
using TAS.ViewModels;
using static Azure.Core.HttpHeader;

namespace TAS.Controllers
{
	[Authorize]
	public class AgentController : Controller
	{
		private readonly AgentModels _agentModels;
		private readonly ILogger<AgentController> _logger;
		private readonly CommonModels _common;

		public AgentController(IConfiguration configuration, ILogger<AgentController> logger, AgentModels agentModels, CommonModels common)
		{
			_logger = logger;
			_agentModels = agentModels;
			_common = common;
		}

		// ========================================
		// VIEW - Agent Management Page
		// ========================================
		[HttpGet]
		[Breadcrumb("key_agent")]
		public IActionResult Index()
		{
			ViewData["Title"] = _common.GetValueByKey("key_agent");
			return View();
		}

		// ========================================
		// API - GET ALL AGENTS (with filters)
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetAgents([FromQuery] AgentSearchDto search)
		{
			try
			{
				var result = await _agentModels.GetTableDataAsync(search);

				return Json(new AgentResponse<IEnumerable<AgentSearchDto>>
				{
					Success = true,
					Message = "Lấy danh sách đại lý thành công",
					Data = result.Data,
					TotalRecords = result.TotalRecords
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting agents");
				return Json(new AgentResponse<IEnumerable<RubberAgentDto>>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null,
					TotalRecords = 0
				});
			}
		}

		// ========================================
		// API - GET AGENT BY ID
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetAgentById(int id)
		{
			try
			{
				var agent = await _agentModels.GetAgentByIdAsync(id);

				if (agent == null)
				{
					return Json(new AgentResponse<RubberAgentDto>
					{
						Success = false,
						Message = "Không tìm thấy đại lý",
						Data = null
					});
				}

				return Json(new AgentResponse<RubberAgentDto>
				{
					Success = true,
					Message = "Lấy thông tin đại lý thành công",
					Data = agent
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting agent by id: {AgentId}", id);
				return Json(new AgentResponse<RubberAgentDto>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - CREATE AGENT
		// ========================================
		[HttpPost]
		public async Task<IActionResult> CreateAgent([FromBody] CreateAgentDto dto)
		{
			if (!ModelState.IsValid)
			{
				var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
				return Json(new AgentResponse<RubberAgentDto>
				{
					Success = false,
					Message = string.Join(", ", errors),
					Data = null
				});
			}

			try
			{
				// Check if AgentCode already exists
				var exists = await _agentModels.AgentCodeExistsAsync(dto.AgentCode);

				if (exists)
				{
					return Json(new AgentResponse<RubberAgentDto>
					{
						Success = false,
						Message = $"Mã đại lý '{dto.AgentCode}' đã tồn tại",
						Data = null
					});
				}

				var userName = User.Identity?.Name ?? "SYSTEM";
				var agentId = await _agentModels.CreateAgentAsync(dto, userName);

				return Json(new AgentResponse<int>
				{
					Success = true,
					Message = "Tạo đại lý thành công",
					Data = agentId
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error creating agent");
				return Json(new AgentResponse<RubberAgentDto>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - UPDATE AGENT
		// ========================================
		[HttpPut]
		public async Task<IActionResult> UpdateAgent([FromBody] UpdateAgentDto dto)
		{
			if (!ModelState.IsValid)
			{
				var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
				return Json(new AgentResponse<RubberAgentDto>
				{
					Success = false,
					Message = string.Join(", ", errors),
					Data = null
				});
			}

			try
			{
				// Check if agent exists
				var agent = await _agentModels.GetAgentByIdAsync(dto.AgentId);

				if (agent == null)
				{
					return Json(new AgentResponse<RubberAgentDto>
					{
						Success = false,
						Message = "Không tìm thấy đại lý",
						Data = null
					});
				}

				// Check if AgentCode is used by another agent
				var isDuplicate = await _agentModels.AgentCodeExistsAsync(dto.AgentCode, dto.AgentId);

				if (isDuplicate)
				{
					return Json(new AgentResponse<RubberAgentDto>
					{
						Success = false,
						Message = $"Mã đại lý '{dto.AgentCode}' đã được sử dụng bởi đại lý khác",
						Data = null
					});
				}

				var userName = User.Identity?.Name ?? "SYSTEM";
				var success = await _agentModels.UpdateAgentAsync(dto, userName);

				return Json(new AgentResponse<bool>
				{
					Success = success,
					Message = success ? "Cập nhật đại lý thành công" : "Cập nhật đại lý thất bại",
					Data = success
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error updating agent");
				return Json(new AgentResponse<RubberAgentDto>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - DELETE AGENT
		// ========================================
		[HttpDelete]
		public async Task<IActionResult> DeleteAgent(int id)
		{
			try
			{
				// Check if agent exists
				var agent = await _agentModels.GetAgentByIdAsync(id);

				if (agent == null)
				{
					return Json(new AgentResponse<bool>
					{
						Success = false,
						Message = "Không tìm thấy đại lý",
						Data = false
					});
				}

				// Check if agent is used
				var isUsed = await _agentModels.AgentIsUsedAsync(id);

				if (isUsed)
				{
					return Json(new AgentResponse<bool>
					{
						Success = false,
						Message = "Không thể xóa đại lý đang được sử dụng trong hệ thống",
						Data = false
					});
				}

				var success = await _agentModels.DeleteAgentAsync(id);

				return Json(new AgentResponse<bool>
				{
					Success = success,
					Message = success ? "Xóa đại lý thành công" : "Xóa đại lý thất bại",
					Data = success
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error deleting agent");
				return Json(new AgentResponse<bool>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = false
				});
			}
		}

		// ========================================
		// API - BULK DELETE AGENTS
		// ========================================
		[HttpPost]
		public async Task<IActionResult> BulkDeleteAgents([FromBody] BulkDeleteAgentDto dto)
		{
			if (dto.AgentIds == null || !dto.AgentIds.Any())
			{
				return Json(new AgentResponse<int>
				{
					Success = false,
					Message = "Vui lòng chọn ít nhất một đại lý để xóa",
					Data = 0
				});
			}

			try
			{
				// Check if any agents are being used
				var usedAgents = new List<int>();
				foreach (var agentId in dto.AgentIds)
				{
					var isUsed = await _agentModels.AgentIsUsedAsync(agentId);
					if (isUsed)
					{
						usedAgents.Add(agentId);
					}
				}

				if (usedAgents.Any())
				{
					return Json(new AgentResponse<int>
					{
						Success = false,
						Message = $"Không thể xóa {usedAgents.Count} đại lý đang được sử dụng trong hệ thống",
						Data = 0
					});
				}

				var rowsAffected = await _agentModels.BulkDeleteAgentsAsync(dto.AgentIds);

				return Json(new AgentResponse<int>
				{
					Success = true,
					Message = $"Đã xóa {rowsAffected} đại lý thành công",
					Data = rowsAffected
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error bulk deleting agents");
				return Json(new AgentResponse<int>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = 0
				});
			}
		}

		// ========================================
		// API - GET AGENTS FOR DROPDOWN
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetAgentsForDropdown(bool activeOnly = true)
		{
			try
			{
				var agents = await _agentModels.GetAgentsForDropdownAsync(activeOnly);

				return Json(new AgentResponse<IEnumerable<AgentDropdownDto>>
				{
					Success = true,
					Message = "Lấy danh sách đại lý thành công",
					Data = agents
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting agents for dropdown");
				return Json(new AgentResponse<IEnumerable<AgentDropdownDto>>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - GET AGENT STATISTICS
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetAgentStatistics()
		{
			try
			{
				var stats = await _agentModels.GetAgentStatisticsAsync();

				return Json(new AgentResponse<AgentStatisticsDto>
				{
					Success = true,
					Message = "Lấy thống kê đại lý thành công",
					Data = stats
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting agent statistics");
				return Json(new AgentResponse<AgentStatisticsDto>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - GET AGENTS WITH POND COUNT
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetAgentsWithPondCount()
		{
			try
			{
				var agents = await _agentModels.GetAgentsWithPondCountAsync();

				return Json(new AgentResponse<IEnumerable<AgentWithPondCountDto>>
				{
					Success = true,
					Message = "Lấy danh sách đại lý kèm số lượng hồ thành công",
					Data = agents
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting agents with pond count");
				return Json(new AgentResponse<IEnumerable<AgentWithPondCountDto>>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - SEARCH AGENTS
		// ========================================
		[HttpGet]
		public async Task<IActionResult> SearchAgents(string keyword)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(keyword))
				{
					return Json(new AgentResponse<IEnumerable<RubberAgentDto>>
					{
						Success = false,
						Message = "Vui lòng nhập từ khóa tìm kiếm",
						Data = null
					});
				}

				var agents = await _agentModels.SearchAgentsAsync(keyword);

				return Json(new AgentResponse<IEnumerable<RubberAgentDto>>
				{
					Success = true,
					Message = $"Tìm thấy {agents.Count} đại lý",
					Data = agents
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error searching agents");
				return Json(new AgentResponse<IEnumerable<RubberAgentDto>>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}
	}
}
