using Microsoft.AspNetCore.Mvc;
using TAS.Helpers;
using TAS.ViewModels;

namespace TAS.Controllers
{
	public class AgentController : Controller
	{
		private readonly AgentModels models;
		private readonly CommonModels _common;
		public AgentController(AgentModels _models, CommonModels common)
		{
			models = _models;
			_common = common;
		}
		[Breadcrumb("key_agentinfo")]
		public IActionResult Agent()
		{
			return View();
		}
		#region handle Data
		[HttpPost]
		public async Task<IActionResult> Agents()
		{
			var lstData = await models.GetRubberAgentAsync();
			return new JsonResult(lstData);
		}
		[HttpPost]
		public JsonResult AddOrUpdate([FromBody] RubberAgent rubberAgent)
		{
			int result = models.AddOrUpdateRubberAgent(rubberAgent);
			return Json(result);
		}

		[HttpPost]
		public JsonResult DeleteRubberAgent(int agentId)
		{
			return Json(models.DeleteRubberAgent(agentId));
		}

		[HttpPost]
		public JsonResult ApproveDataRubberAgent(int agentId, int status)
		{
			return Json(models.ApproveDataRubberAgent(agentId, status));
		}
		#endregion
	}
}
