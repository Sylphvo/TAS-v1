using Microsoft.AspNetCore.Mvc;
using TAS.Models;
using TAS.ViewModels;

namespace TAS.Controllers
{
	public class FarmController : Controller
	{
		private readonly FarmModels models;
		private readonly ILogger<FarmController> _logger;
		private readonly CommonModels _common;
		public FarmController(FarmModels _models, CommonModels common, ILogger<FarmController> logger)
		{
			models = _models;
			_common = common;
			_logger = logger;
		}

		
		//public IActionResult InformationGarden()
		//{
		//	ViewBag.ComboAgent = _common.ComboAgent();
		//	return View();
		//}
		// ========================================
		// VIEW - Farm Management Page
		// ========================================
		[Breadcrumb("key_thongtinnhavuon")]
		public IActionResult Index()
		{
			ViewData["Title"] = _common.GetValueByKey("key_thongtinnhavuon");
			return View();
		}

		// ========================================
		// API - GET ALL FARMS (with filters)
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetFarms([FromQuery] FarmSearchDto search)
		{
			try
			{
				var result = await models.GetTableDataAsync(search);

				return Json(new FarmResponse<IEnumerable<RubberFarm>>
				{
					Success = true,
					Message = "Lấy danh sách nhà vườn thành công",
					Data = result.Data,
					TotalRecords = result.TotalRecords
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting farms");
				return Json(new FarmResponse<IEnumerable<RubberFarm>>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null,
					TotalRecords = 0
				});
			}
		}

		// ========================================
		// API - GET FARM BY ID
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetFarmById(long id)
		{
			try
			{
				var farm = await models.GetFarmByIdAsync(id);

				if (farm == null)
				{
					return Json(new FarmResponse<RubberFarm>
					{
						Success = false,
						Message = "Không tìm thấy nhà vườn",
						Data = null
					});
				}

				return Json(new FarmResponse<RubberFarm>
				{
					Success = true,
					Message = "Lấy thông tin nhà vườn thành công",
					Data = farm
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting farm by id: {FarmId}", id);
				return Json(new FarmResponse<RubberFarm>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - CREATE FARM
		// ========================================
		[HttpPost]
		public async Task<IActionResult> CreateFarm([FromBody] CreateFarmDto dto)
		{
			if (!ModelState.IsValid)
			{
				var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
				return Json(new FarmResponse<RubberFarm>
				{
					Success = false,
					Message = string.Join(", ", errors),
					Data = null
				});
			}

			try
			{
				// Check if FarmCode already exists
				var exists = await models.FarmCodeExistsAsync(dto.FarmCode);

				if (exists)
				{
					return Json(new FarmResponse<RubberFarm>
					{
						Success = false,
						Message = $"Mã nhà vườn '{dto.FarmCode}' đã tồn tại",
						Data = null
					});
				}

				var userName = User.Identity?.Name ?? "SYSTEM";
				var farmId = await models.CreateFarmAsync(dto, userName);

				return Json(new FarmResponse<long>
				{
					Success = true,
					Message = "Tạo nhà vườn thành công",
					Data = farmId
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error creating farm");
				return Json(new FarmResponse<RubberFarm>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - UPDATE FARM
		// ========================================
		[HttpPut]
		public async Task<IActionResult> UpdateFarm([FromBody] UpdateFarmDto dto)
		{
			if (!ModelState.IsValid)
			{
				var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
				return Json(new FarmResponse<RubberFarm>
				{
					Success = false,
					Message = string.Join(", ", errors),
					Data = null
				});
			}

			try
			{
				// Check if farm exists
				var farm = await models.GetFarmByIdAsync(dto.FarmId);

				if (farm == null)
				{
					return Json(new FarmResponse<RubberFarm>
					{
						Success = false,
						Message = "Không tìm thấy nhà vườn",
						Data = null
					});
				}

				// Check if FarmCode is used by another farm
				var isDuplicate = await models.FarmCodeExistsAsync(dto.FarmCode, dto.FarmId);

				if (isDuplicate)
				{
					return Json(new FarmResponse<RubberFarm>
					{
						Success = false,
						Message = $"Mã nhà vườn '{dto.FarmCode}' đã được sử dụng bởi nhà vườn khác",
						Data = null
					});
				}

				var userName = User.Identity?.Name ?? "SYSTEM";
				var success = await models.UpdateFarmAsync(dto, userName);

				return Json(new FarmResponse<bool>
				{
					Success = success,
					Message = success ? "Cập nhật nhà vườn thành công" : "Cập nhật nhà vườn thất bại",
					Data = success
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error updating farm");
				return Json(new FarmResponse<RubberFarm>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - DELETE FARM
		// ========================================
		[HttpDelete]
		public async Task<IActionResult> DeleteFarm(long id)
		{
			try
			{
				// Check if farm exists
				var farm = await models.GetFarmByIdAsync(id);

				if (farm == null)
				{
					return Json(new FarmResponse<bool>
					{
						Success = false,
						Message = "Không tìm thấy nhà vườn",
						Data = false
					});
				}

				// Check if farm is used
				var isUsed = await models.FarmIsUsedAsync(id);

				if (isUsed)
				{
					return Json(new FarmResponse<bool>
					{
						Success = false,
						Message = "Không thể xóa nhà vườn đang có dữ liệu thu mua",
						Data = false
					});
				}

				var success = await models.DeleteFarmAsync(id);

				return Json(new FarmResponse<bool>
				{
					Success = success,
					Message = success ? "Xóa nhà vườn thành công" : "Xóa nhà vườn thất bại",
					Data = success
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error deleting farm");
				return Json(new FarmResponse<bool>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = false
				});
			}
		}

		// ========================================
		// API - BULK DELETE FARMS
		// ========================================
		[HttpPost]
		public async Task<IActionResult> BulkDeleteFarms([FromBody] BulkDeleteFarmDto dto)
		{
			if (dto.FarmIds == null || !dto.FarmIds.Any())
			{
				return Json(new FarmResponse<int>
				{
					Success = false,
					Message = "Vui lòng chọn ít nhất một nhà vườn để xóa",
					Data = 0
				});
			}

			try
			{
				// Check if any farms are being used
				var usedFarms = new List<long>();
				foreach (var farmId in dto.FarmIds)
				{
					var isUsed = await models.FarmIsUsedAsync(farmId);
					if (isUsed)
					{
						usedFarms.Add(farmId);
					}
				}

				if (usedFarms.Any())
				{
					return Json(new FarmResponse<int>
					{
						Success = false,
						Message = $"Không thể xóa {usedFarms.Count} nhà vườn đang có dữ liệu thu mua",
						Data = 0
					});
				}

				var rowsAffected = await models.BulkDeleteFarmsAsync(dto.FarmIds);

				return Json(new FarmResponse<int>
				{
					Success = true,
					Message = $"Đã xóa {rowsAffected} nhà vườn thành công",
					Data = rowsAffected
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error bulk deleting farms");
				return Json(new FarmResponse<int>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = 0
				});
			}
		}

		// ========================================
		// API - APPROVE/UNAPPROVE FARM
		// ========================================
		[HttpPost]
		public async Task<IActionResult> ApproveFarm([FromBody] ApproveFarmDto dto)
		{
			try
			{
				var farm = await models.GetFarmByIdAsync(dto.FarmId);

				if (farm == null)
				{
					return Json(new FarmResponse<bool>
					{
						Success = false,
						Message = "Không tìm thấy nhà vườn",
						Data = false
					});
				}

				var success = await models.ApproveFarmAsync(dto.FarmId, dto.IsActive);

				var message = dto.IsActive ? "Duyệt nhà vườn thành công" : "Hủy duyệt nhà vườn thành công";

				return Json(new FarmResponse<bool>
				{
					Success = success,
					Message = success ? message : "Thao tác thất bại",
					Data = success
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error approving farm");
				return Json(new FarmResponse<bool>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = false
				});
			}
		}

		// ========================================
		// API - IMPORT POLYGON
		// ========================================
		[HttpPost]
		public async Task<IActionResult> ImportPolygon([FromBody] ImportPolygonDto dto)
		{
			if (string.IsNullOrWhiteSpace(dto.Polygon))
			{
				return Json(new FarmResponse<bool>
				{
					Success = false,
					Message = "Dữ liệu polygon không hợp lệ",
					Data = false
				});
			}

			try
			{
				var success = await models.ImportPolygonAsync(dto.FarmId, dto.Polygon);

				return Json(new FarmResponse<bool>
				{
					Success = success,
					Message = success ? "Import polygon thành công" : "Import polygon thất bại",
					Data = success
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error importing polygon");
				return Json(new FarmResponse<bool>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = false
				});
			}
		}

		// ========================================
		// API - GET FARMS FOR DROPDOWN
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetFarmsForDropdown(bool activeOnly = true)
		{
			try
			{
				var farms = await models.GetFarmsForDropdownAsync(activeOnly);

				return Json(new FarmResponse<IEnumerable<FarmDropdownDto>>
				{
					Success = true,
					Message = "Lấy danh sách nhà vườn thành công",
					Data = farms
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting farms for dropdown");
				return Json(new FarmResponse<IEnumerable<FarmDropdownDto>>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - GET FARMS BY AGENT CODE
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetFarmsByAgentCode(string agentCode)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(agentCode))
				{
					return Json(new FarmResponse<IEnumerable<RubberFarm>>
					{
						Success = false,
						Message = "Mã đại lý không hợp lệ",
						Data = null
					});
				}

				var farms = await models.GetFarmsByAgentCodeAsync(agentCode);

				return Json(new FarmResponse<IEnumerable<RubberFarm>>
				{
					Success = true,
					Message = $"Tìm thấy {farms.Count} nhà vườn",
					Data = farms
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting farms by agent code");
				return Json(new FarmResponse<IEnumerable<RubberFarm>>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - GET FARM STATISTICS
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetFarmStatistics()
		{
			try
			{
				var stats = await models.GetFarmStatisticsAsync();

				return Json(new FarmResponse<FarmStatisticsDto>
				{
					Success = true,
					Message = "Lấy thống kê nhà vườn thành công",
					Data = stats
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting farm statistics");
				return Json(new FarmResponse<FarmStatisticsDto>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

		// ========================================
		// API - SEARCH FARMS
		// ========================================
		[HttpGet]
		public async Task<IActionResult> SearchFarms(string keyword)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(keyword))
				{
					return Json(new FarmResponse<IEnumerable<RubberFarm>>
					{
						Success = false,
						Message = "Vui lòng nhập từ khóa tìm kiếm",
						Data = null
					});
				}

				var farms = await models.SearchFarmsAsync(keyword);

				return Json(new FarmResponse<IEnumerable<RubberFarm>>
				{
					Success = true,
					Message = $"Tìm thấy {farms.Count} nhà vườn",
					Data = farms
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error searching farms");
				return Json(new FarmResponse<IEnumerable<RubberFarm>>
				{
					Success = false,
					Message = $"Lỗi: {ex.Message}",
					Data = null
				});
			}
		}

	}
}
