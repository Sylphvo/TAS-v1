using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TAS.DTOs;
using TAS.ViewModels;
using static Azure.Core.HttpHeader;

namespace TAS.Controllers
{
	[Authorize]
	public class PondController : Controller
	{
		private readonly PondModels _pondModels;
		private readonly ILogger<PondController> _logger;
		private readonly CommonModels _common;

		public PondController(PondModels pondModels, ILogger<PondController> logger, CommonModels common)
		{
			_pondModels = pondModels;
			_logger = logger;
			_common = common;
		}

		// ========================================
		// GET: /Pond/Index
		// ========================================
		[Breadcrumb("key_Lake")]
		public IActionResult Index()
		{
			ViewData["Title"] = _common.GetValueByKey("key_Lake");
			return View();
		}

		// ========================================
		// GET: /Pond/GetAllPonds
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetAllPonds()
		{
			try
			{
				var ponds = await _pondModels.GetAllPondsAsync();
				return Json(new { success = true, data = ponds });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAllPonds");
				return Json(new { success = false, message = "Lỗi khi tải dữ liệu" });
			}
		}

		// ========================================
		// GET: /Pond/GetPondById/{id}
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetPondById(long id)
		{
			try
			{
				var pond = await _pondModels.GetPondByIdAsync(id);
				if (pond == null)
				{
					return Json(new { success = false, message = "Không tìm thấy hồ" });
				}
				return Json(new { success = true, data = pond });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetPondById");
				return Json(new { success = false, message = "Lỗi khi tải dữ liệu" });
			}
		}

		// ========================================
		// POST: /Pond/CreatePond
		// ========================================
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> CreatePond([FromBody] RubberPondRequest request)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return Json(new { success = false, message = "Dữ liệu không hợp lệ" });
				}

				var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "SYSTEM";
				var result = await _pondModels.CreatePondAsync(request, userName);

				if (result.Success)
				{
					_logger.LogInformation($"Pond created: {result.PondId} by {userName}");
					return Json(new { success = true, message = "Tạo hồ thành công", pondId = result.PondId });
				}

				return Json(new { success = false, message = result.Message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in CreatePond");
				return Json(new { success = false, message = "Lỗi khi tạo hồ" });
			}
		}

		// ========================================
		// PUT: /Pond/UpdatePond
		// ========================================
		[HttpPut]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> UpdatePond([FromBody] RubberPondRequest request)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return Json(new { success = false, message = "Dữ liệu không hợp lệ" });
				}

				var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "SYSTEM";
				var result = await _pondModels.UpdatePondAsync(request, userName);

				if (result.Success)
				{
					_logger.LogInformation($"Pond updated: {request.PondId} by {userName}");
					return Json(new { success = true, message = "Cập nhật hồ thành công" });
				}

				return Json(new { success = false, message = result.Message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in UpdatePond");
				return Json(new { success = false, message = "Lỗi khi cập nhật hồ" });
			}
		}

		// ========================================
		// DELETE: /Pond/DeletePond/{id}
		// ========================================
		[HttpDelete]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeletePond(long id)
		{
			try
			{
				var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "SYSTEM";
				var result = await _pondModels.DeletePondAsync(id, userName);

				if (result.Success)
				{
					_logger.LogInformation($"Pond deleted: {id} by {userName}");
					return Json(new { success = true, message = "Xóa hồ thành công" });
				}

				return Json(new { success = false, message = result.Message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in DeletePond");
				return Json(new { success = false, message = "Lỗi khi xóa hồ" });
			}
		}

		// ========================================
		// POST: /Pond/UpdateStatus
		// ========================================
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> UpdateStatus([FromBody] UpdateRubberPondResult request)
		{
			try
			{
				var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "SYSTEM";
				var result = await _pondModels.UpdatePondStatusAsync(request.PondId, request.Status, userName);

				if (result.Success)
				{
					_logger.LogInformation($"Pond status updated: {request.PondId} to {request.Status} by {userName}");
					return Json(new { success = true, message = "Cập nhật trạng thái thành công" });
				}

				return Json(new { success = false, message = result.Message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in UpdateStatus");
				return Json(new { success = false, message = "Lỗi khi cập nhật trạng thái" });
			}
		}

		// ========================================
		// GET: /Pond/GetAgents
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetAgents()
		{
			try
			{
				var agents = await _pondModels.GetAgentsAsync();
				return Json(new { success = true, data = agents });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAgents");
				return Json(new { success = false, message = "Lỗi khi tải danh sách đại lý" });
			}
		}

		// ========================================
		// POST: /Pond/ExportToExcel
		// ========================================
		[HttpPost]
		public async Task<IActionResult> ExportToExcel([FromBody] List<long> pondIds)
		{
			try
			{
				var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "SYSTEM";
				var fileBytes = await _pondModels.ExportToExcelAsync(pondIds, userName);

				var fileName = $"Ponds_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
				return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ExportToExcel");
				return Json(new { success = false, message = "Lỗi khi xuất Excel" });
			}
		}
	}
}