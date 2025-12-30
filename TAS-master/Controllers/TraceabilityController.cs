using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAS.ViewModels;

namespace TAS.Controllers
{
	[Authorize]
	public class TraceabilityTableController : Controller
	{
		private readonly TraceabilityTableModels _traceabilityTableModels;
		private readonly ILogger<TraceabilityTableController> _logger;

		public TraceabilityTableController(TraceabilityTableModels traceabilityTableModels, ILogger<TraceabilityTableController> logger)
		{
			_traceabilityTableModels = traceabilityTableModels;
			_logger = logger;
		}

		// ========================================
		// GET: /TraceabilityTable/Index
		// ========================================
		public IActionResult Index()
		{
			ViewData["Title"] = "Traceability";
			return View();
		}

		// ========================================
		// GET: /TraceabilityTable/GetTableData
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetTableData(bool showAll = false)
		{
			try
			{
				var data = await _traceabilityTableModels.GetTraceabilityTableAsync(showAll);
				return Json(new { success = true, data = data });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetTableData");
				return Json(new { success = false, message = "Lỗi khi tải dữ liệu" });
			}
		}

		// ========================================
		// GET: /TraceabilityTable/GetByOrder
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

				var data = await _traceabilityTableModels.GetTraceabilityByOrderAsync(orderCode);
				return Json(new { success = true, data = data });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetByOrder");
				return Json(new { success = false, message = "Lỗi khi tải dữ liệu" });
			}
		}
	}
}
