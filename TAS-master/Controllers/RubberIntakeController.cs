using Microsoft.AspNetCore.Mvc;
using TAS.ConstantVaribles;
using TAS.DTOs;
using TAS.Resources;
using TAS.ViewModels;

namespace TAS.Controllers
{
	public class RubberIntakeController : Controller
	{
		private readonly RubberIntakeModels _models;
		private readonly CommonModels _common;

		public RubberIntakeController(RubberIntakeModels models, CommonModels common)
		{
			_models = models;
			_common = common;
		}

		// ========================================
		// VIEW: Trang chính
		// ========================================
		[Breadcrumb(nameof(Language.key_capnhatsolieu), "#", "", false)]
		public IActionResult Index()
		{
			ViewData["Title"] = Language.key_capnhatsolieu;
			return View();
		}

		// ========================================
		// API: Lấy danh sách FULL
		// ========================================
		[HttpPost]
		public async Task<IActionResult> GetAllIntakes(
			string? agentCode = null,
			string? farmCode = null,
			string? orderCode = null,
			int? status = null)
		{
			try
			{
				var lstData = await _models.GetAllIntakesAsync(agentCode, farmCode, orderCode, status);
				return Json(new { success = true, data = lstData });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}

		// ========================================
		// API: Lấy 1 record
		// ========================================
		[HttpPost]
		public async Task<IActionResult> GetIntakeById(long intakeId)
		{
			try
			{
				var data = await _models.GetIntakeByIdAsync(intakeId);
				if (data == null)
					return Json(new { success = false, message = "Không tìm thấy dữ liệu" });

				return Json(new { success = true, data });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}

		// ========================================
		// API: Thêm/Sửa 1 record
		// ========================================
		[HttpPost]
		public IActionResult AddOrUpdate([FromBody] RubberIntakeRequest request)
		{
			try
			{
				if (request == null)
					return Json(new { success = false, message = "Dữ liệu không hợp lệ" });

				var result = _models.AddOrUpdateIntake(request);
				if (result > 0)
					return Json(new { success = true, message = "Lưu thành công", intakeId = result });

				return Json(new { success = false, message = "Lưu thất bại" });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}

		// ========================================
		// API: Lưu nhiều records (Bulk Update)
		// ========================================
		[HttpPost]
		public IActionResult saveBatchRecords([FromBody] List<RubberIntakeRequest> lstIntakes)
		{
			try
			{
				if (lstIntakes == null || !lstIntakes.Any())
					return Json(new { success = false, message = "Không có dữ liệu để lưu" });

				var result = _models.SaveBatchRecords(lstIntakes);
				if (result > 0)
					return Json(new { success = true, message = $"Đã lưu {result} bản ghi" });

				return Json(new { success = false, message = "Lưu thất bại" });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}

		// ========================================
		// API: Xóa 1 record
		// ========================================
		[HttpPost]
		public IActionResult Delete(long intakeId)
		{
			try
			{
				var result = _models.DeleteIntake(intakeId);
				if (result > 0)
					return Json(new { success = true, message = "Xóa thành công" });

				return Json(new { success = false, message = "Xóa thất bại" });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}

		// ========================================
		// API: Xóa nhiều records
		// ========================================
		[HttpPost]
		public IActionResult DeleteMultiple([FromBody] List<long> intakeIds)
		{
			try
			{
				if (intakeIds == null || !intakeIds.Any())
					return Json(new { success = false, message = "Không có dữ liệu để xóa" });

				var result = _models.DeleteMultipleIntakes(intakeIds);
				if (result > 0)
					return Json(new { success = true, message = $"Đã xóa {result} bản ghi" });

				return Json(new { success = false, message = MsgReponses.DeleteFail });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}

		// ========================================
		// API: Import Excel
		// ========================================
		[HttpPost]
		public IActionResult ImportExcel([FromBody] List<RubberIntakeRequest> lstImport)
		{
			try
			{
				if (lstImport == null || !lstImport.Any())
					return Json(new { success = false, message = "File Excel không có dữ liệu" });

				var result = _models.ImportFromExcel(lstImport);
				if (result > 0)
					return Json(new { success = true, message = $"Import thành công {result} bản ghi" });

				return Json(new { success = false, message = "Import thất bại" });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}

		// ========================================
		// API: Export Excel
		// ========================================
		[HttpPost]
		public async Task<IActionResult> ExportExcel(
			string? agentCode = null,
			string? farmCode = null,
			string? orderCode = null,
			int? status = null)
		{
			try
			{
				var data = await _models.GetAllIntakesAsync(agentCode, farmCode, orderCode, status);

				// Trả về data để JS xử lý export
				return Json(new { success = true, data });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}

		// ========================================
		// API: Duyệt 1 record
		// ========================================
		[HttpPost]
		public IActionResult Approve(long intakeId, int status)
		{
			try
			{
				var result = _models.ApproveIntake(intakeId, status);
				if (result > 0)
					return Json(new { success = true, message = "Duyệt thành công" });

				return Json(new { success = false, message = "Duyệt thất bại" });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}

		// ========================================
		// API: Duyệt tất cả
		// ========================================
		[HttpPost]
		public IActionResult ApproveAll(int status)
		{
			try
			{
				var result = _models.ApproveAllIntakes(status);
				if (result > 0)
					return Json(new { success = true, message = "Duyệt tất cả thành công" });

				return Json(new { success = false, message = "Duyệt tất cả thất bại" });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}

		// ========================================
		// API: Tạo đơn hàng mới
		// ========================================
		[HttpPost]
		public IActionResult CreateOrder(string orderName)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(orderName))
					return Json(new { success = false, message = "Tên đơn hàng không được để trống" });

				var result = _models.CreateOrder(orderName);
				if (result > 0)
					return Json(new { success = true, message = "Tạo đơn hàng thành công" });

				return Json(new { success = false, message = "Tạo đơn hàng thất bại" });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}

		// ========================================
		// API: Lấy Farm theo Agent
		// ========================================
		[HttpPost]
		public IActionResult GetFarmsByAgent(string agentCode)
		{
			try
			{
				var farms = _common.ComboFarmCodeByAgent(agentCode);
				return Json(new { success = true, data = farms });
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}
	}
}