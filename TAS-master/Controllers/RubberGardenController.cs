using Microsoft.AspNetCore.Mvc;
using TAS.DTOs;
using TAS.Models;
using TAS.Models.DTOs;
using TAS.ViewModels;

namespace TAS.Controllers
{
	public class RubberGardenController : Controller
	{
		private readonly RubberGardenModels _models;
		private readonly CommonModels _common;
		public RubberGardenController(RubberGardenModels models, CommonModels common)
		{
			_models = models;
			_common = common;
		}
		[Breadcrumb("key_capnhatsolieu")]
		public IActionResult RubberGarden()
		{
			ViewData["Title"] = _common.GetValueByKey("key_capnhatsolieu");
			ViewBag.ComboFarmCode = _common.ComboFarmCode();
			ViewBag.ComboOrder = _common.ComboOrderCode();
			return View();
		}

		#region handle Data
		[HttpPost]
		public async Task<IActionResult> RubberGardens()
		{
			var lstData = await _models.GetRubberFarmAsync();

			return new JsonResult(lstData);
		}

		[HttpPost]
		public JsonResult AddOrUpdate([FromBody] RubberIntakeDto rubberIntakeRequest)
		{
			int result = _models.AddOrUpdateRubber(rubberIntakeRequest);
			return Json(result);
		}

		[HttpPost]
		public JsonResult AddOrUpdateFull([FromBody] List<RubberIntakeDto> lstRubberIntake)
		{
			int result = _models.AddOrUpdateRubberFull(lstRubberIntake);
			return Json(1);
		}

		[HttpPost]
		public JsonResult ImportDataLstData([FromBody] List<RubberIntakeDto> rowsData)
		{
			int result = _models.ImportListData(rowsData);
			return Json(result);
		}

		[HttpPost]
		public JsonResult ApproveDataRubber(int intakeId, int status)
		{
			int result = _models.ApproveDataRubber(intakeId, status);
			return Json(result);
		}

		[HttpPost("RubberGarden/ApproveAllDataRubber")]
		public JsonResult ApproveAllDataRubber(int status)
		{
			int result = _models.ApproveAllDataRubber(status);
			return Json(result);
		}

		[HttpPost]
		public JsonResult DeleteRubber(int intakeId)
		{
			return Json(_models.DeleteRubber(intakeId));
		}

		[HttpPost("RubberGarden/GetAllComboAsync")]
		public JsonResult GetAllComboAsync()
		{
			return Json(new
			{
				ComboOrderCode = _common.ComboOrderCode(),
				ComboFarmCode = _common.ComboFarmCode(),
				ComboAgent = _common.ComboAgent(),
			});
		}
		[HttpPost]
		public JsonResult CreateOrder(string OrderName)
		{
			return Json(_models.CreateOrder(OrderName));
		}
		#endregion
	}
}
