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
		public async Task<IActionResult> GetAllLots([FromQuery] RubberLotRequest filter)
		{
			try
			{
				var result = await _lotModels.GetLotsWithFilterAsync(filter);
				return Json(new { success = true, data = result });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAllLots");
				return Json(new { success = false, message = "Lỗi khi tải dữ liệu: " + ex.Message });
			}
		}

		// ========================================
		// POST: /Lot/AddOrUpdateLot
		// ========================================
		[HttpPost]
		public async Task<IActionResult> AddOrUpdateLot([FromBody] RubberLotRequest request)
		{
			// 1. Validate dữ liệu đầu vào cơ bản
			if (!ModelState.IsValid)
			{
				return BadRequest(new
				{
					success = false,
					message = "Dữ liệu không hợp lệ",
					errors = ModelState.Values.SelectMany(v => v.Errors)
				});
			}

			try
			{
				// 2. Gọi Service để xử lý DB (Bạn cần chắc chắn _lotModels đã có hàm này)
				long resultId = await _lotModels.AddOrUpdateLotAsync(request);

				// 3. Trả về kết quả
				// Chú ý: Cần thêm LotId vào RubberLotRequest để check điều kiện dưới đây
				bool isUpdate = request.LotId > 0;

				return Ok(new
				{
					success = true,
					message = isUpdate ? "Cập nhật thành công!" : "Thêm mới thành công!",
					data = resultId // Trả về ID để FE cập nhật lại Grid
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Lỗi khi lưu thông tin Hồ/Lô");
				return StatusCode(500, new
				{
					success = false,
					message = "Đã xảy ra lỗi hệ thống: " + ex.Message
				});
			}
		}

		// ========================================
		// DELETE: /Lot/DeleteLot
		// ========================================
		[HttpDelete]
		public async Task<IActionResult> DeleteLot(int lotId)
		{
			try
			{
				if (lotId <= 0)
				{
					return BadRequest(new { success = false, message = "ID không hợp lệ." });
				}

				// Bạn cần chắc chắn _lotModels đã có hàm DeleteLotAsync
				var result = await _lotModels.DeleteLotAsync(lotId);

				if (result)
				{
					return Ok(new { success = true, message = "Xóa thành công." });
				}
				else
				{
					return NotFound(new { success = false, message = "Không tìm thấy dữ liệu hoặc đã bị xóa trước đó." });
				}
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { success = false, message = ex.Message });
			}
		}

	}
}