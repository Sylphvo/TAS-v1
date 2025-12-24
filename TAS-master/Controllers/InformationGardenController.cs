using Microsoft.AspNetCore.Mvc;
using TAS.Models;
using TAS.ViewModels;

namespace TAS.Controllers
{
	public class InformationGardenController : Controller
	{
		private readonly InformationGardenModels models;
		private readonly CommonModels _common;
		public InformationGardenController(InformationGardenModels _models, CommonModels common)
		{
			models = _models;
			_common = common;
		}

		[Breadcrumb("key_thongtinnhavuon")]
		public IActionResult InformationGarden()
		{
			ViewBag.ComboAgent = _common.ComboAgent();
			return View();
		}

		#region handle Data
		[HttpPost]
		public async Task<JsonResult> InformationGardens()
		{
			var lstData = await models.GetRubberFarmAsync();
			return new JsonResult(lstData);
		}

		[HttpPost]
		public JsonResult AddOrUpdate([FromBody] RubberFarmRequest rubberFarmRequest)
		{
			int result = models.AddOrUpdateRubberFarm(rubberFarmRequest);
			return Json(result);
		}

		[HttpPost("Delete/{id}")]
		public IActionResult Delete(int id)
		{
			return View();
		}

		[HttpPost]
		public JsonResult ImportPolygon([FromBody] RubberFarmRequest rubberFarmRequest)
		{
			int result = models.ImportPolygon(rubberFarmRequest);
			return Json(result);
		}
		#endregion

		[HttpPost]
		public JsonResult ApproveDataFarm(int FarmId, int status)
		{
			int result = models.ApproveDataFarm(FarmId, status);
			return Json(result);
		}
	}
}
