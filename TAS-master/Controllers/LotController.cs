using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TAS.DTOs;
using TAS.Resources;
using TAS.ViewModels;
using static Azure.Core.HttpHeader;

namespace TAS.Controllers
{
	[Authorize]
	public class LotController : Controller
	{
		private readonly LotModels _lotModels;
		private readonly ILogger<LotController> _logger;
		private readonly CommonModels _common;

		public LotController(LotModels lotModels, ILogger<LotController> logger, CommonModels common)
		{
			_lotModels = lotModels;
			_logger = logger;
			_common = common;
		}

		// ========================================
		// GET: /Lot/Index
		// ========================================
		[Breadcrumb(nameof(Language.key_Lake), "#", nameof(Language.key_management_info), true)]
		public IActionResult Index()
		{
			ViewData["Title"] = _common.GetValueByKey("key_Lake");
			return View();
		}

		// ========================================
		// GET: /Lot/GetAllLots
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetAllLots(RubberLotRequest filter)
		{
			try
			{
				var result = await _lotModels.GetLotsWithFilterAsync(filter);
				return Json(new { success = true, data = result });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAllPonds");
				return Json(new { success = false, message = "Lỗi khi tải dữ liệu" });
			}
		}

		
	}
}