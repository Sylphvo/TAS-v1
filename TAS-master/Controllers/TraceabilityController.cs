using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAS.ViewModels;

namespace TAS.Controllers
{
	[Authorize]
	public class TraceabilityController : Controller
	{
		private readonly TraceabilityModels _traceabilityModels;
		private readonly ILogger<TraceabilityController> _logger;
		private readonly CommonModels _common;

		public TraceabilityController(TraceabilityModels traceabilityTableModels, ILogger<TraceabilityController> logger, CommonModels common)
		{
			_traceabilityModels = traceabilityTableModels;
			_logger = logger;
			_common = common;
		}

		// ========================================
		// GET: /Traceability/Index
		// ========================================
		[Breadcrumb("key_truyxuatnguongoc")]
		public IActionResult Index()
		{
			ViewData["Title"] = _common.GetValueByKey("key_truyxuatnguongoc");
			return View();
		}
		//// ========================================
		//// GET: /Traceability/Index
		//// ========================================
		//public IActionResult Traceability()
		//{
		//	ViewData["Title"] = "Traceability";
		//	return View();
		//}

		// ========================================
		// GET: /Traceability/GetTableData
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetTableData(bool showAll = false)
		{
			try
			{
				var data = await _traceabilityModels.GetTableDataAsync(showAll);
				return Json(new { success = true, data = data });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetTableData");
				return Json(new { success = false, message = "Lỗi khi tải dữ liệu: " + ex.Message });
			}
		}

		// ========================================
		// GET: /Traceability/GetByOrder
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetByOrder(string orderCode)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(orderCode))
				{
					return Json(new { success = false, message = "Mã đơn hàng không hợp lệ" });
				}

				var data = await _traceabilityModels.GetTraceabilityByOrderAsync(orderCode);
				return Json(new { success = true, data = data });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetByOrder");
				return Json(new { success = false, message = "Lỗi khi tải dữ liệu: " + ex.Message });
			}
		}
	}
}
