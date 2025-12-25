using Microsoft.AspNetCore.Mvc;
using TAS.Models;
using TAS.Models.DTOs;
using TAS.ViewModels;

namespace TAS.Controllers
{
	public class PondController : Controller
	{
		private readonly PondModels models;
		private readonly CommonModels _common;

		public PondController(PondModels _models, CommonModels common)
		{
			models = _models;
			_common = common;
		}

		[Breadcrumb("key_pondinfo")]
		public IActionResult Pond()
		{
			return View();
		}

		#region Handle Data

		[HttpPost]
		public async Task<IActionResult> GetRubberPonds()
		{
			var lstData = await models.GetRubberPondAsync();
			return new JsonResult(lstData);
		}

		[HttpPost]
		public async Task<IActionResult> GetRubberPondById(long pondId)
		{
			var data = await models.GetRubberPondByIdAsync(pondId);
			return new JsonResult(data);
		}

		[HttpPost]
		public JsonResult AddOrUpdate([FromBody] RubberPondDto rubberPond)
		{
			int result = models.AddOrUpdateRubberPond(rubberPond);
			return Json(result);
		}

		[HttpPost]
		public JsonResult AddOrUpdateFull([FromBody] List<RubberPondDto> rubberPonds)
		{
			int result = models.AddOrUpdateRubberPondFull(rubberPonds);
			return Json(result);
		}

		[HttpPost]
		public JsonResult DeletePond(long pondId)
		{
			return Json(models.DeleteRubberPond(pondId));
		}

		[HttpPost]
		public JsonResult ApprovePond(long pondId, int status)
		{
			return Json(models.ApproveRubberPond(pondId, status));
		}

		[HttpPost]
		public JsonResult ApproveAllPonds(int status)
		{
			return Json(models.ApproveAllRubberPonds(status));
		}

		[HttpPost]
		public JsonResult UpdatePondStatus(long pondId, int status)
		{
			return Json(models.UpdatePondStatus(pondId, status));
		}

		[HttpPost]
		public JsonResult ImportDataLstData([FromBody] List<RubberPondDto> rubberPonds)
		{
			int result = models.ImportRubberPonds(rubberPonds);
			return Json(result);
		}

		[HttpPost]
		public async Task<IActionResult> GetPondsByAgent(string agentCode)
		{
			var lstData = await models.GetRubberPondsByAgentAsync(agentCode);
			return new JsonResult(lstData);
		}

		[HttpPost]
		public async Task<IActionResult> GetPondsByStatus(int status)
		{
			var lstData = await models.GetRubberPondsByStatusAsync(status);
			return new JsonResult(lstData);
		}

		[HttpPost]
		public async Task<IActionResult> GetActivePonds()
		{
			var lstData = await models.GetActivePondsAsync();
			return new JsonResult(lstData);
		}

		[HttpPost]
		public JsonResult UpdatePondInventory(long pondId, decimal currentNetKg)
		{
			return Json(models.UpdatePondInventory(pondId, currentNetKg));
		}

		[HttpPost]
		public JsonResult CleanPond(long pondId)
		{
			return Json(models.CleanPond(pondId));
		}

		#endregion
	}
}