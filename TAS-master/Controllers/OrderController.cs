using Microsoft.AspNetCore.Mvc;
using TAS.Helpers;
using TAS.ViewModels;
using TAS.Models;

namespace TAS.Controllers
{
	public class OrderController : Controller
	{
		private readonly OrderModels models;
		private readonly CommonModels _common;
		public OrderController(OrderModels _models, CommonModels common)
		{
			models = _models;
			_common = common;
		}

		[Breadcrumb("key_orderinfo")]
		public IActionResult Order()
		{
			return View();
		}

		#region Handle Data

		[HttpPost]
		public async Task<IActionResult> GetRubberOrders()
		{
			var lstData = await models.GetRubberOrderAsync();
			return new JsonResult(lstData);
		}

		[HttpPost]
		public async Task<IActionResult> GetRubberOrderById(long orderId)
		{
			var data = await models.GetRubberOrderByIdAsync(orderId);
			return new JsonResult(data);
		}

		[HttpPost]
		public JsonResult AddOrUpdate([FromBody] RubberOrderDb rubberOrder)
		{
			int result = models.AddOrUpdateRubberOrder(rubberOrder);
			return Json(result);
		}

		[HttpPost]
		public JsonResult AddOrUpdateFull([FromBody] List<RubberOrderDb> rubberOrders)
		{
			int result = models.AddOrUpdateRubberOrderFull(rubberOrders);
			return Json(result);
		}

		[HttpPost]
		public JsonResult DeleteOrder(long orderId)
		{
			return Json(models.DeleteRubberOrder(orderId));
		}

		[HttpPost]
		public JsonResult ApproveOrder(long orderId, int status)
		{
			return Json(models.ApproveRubberOrder(orderId, status));
		}

		[HttpPost]
		public JsonResult ApproveAllOrders(int status)
		{
			return Json(models.ApproveAllRubberOrders(status));
		}

		[HttpPost]
		public JsonResult UpdateOrderStatus(long orderId, int status)
		{
			return Json(models.UpdateOrderStatus(orderId, status));
		}

		[HttpPost]
		public JsonResult ImportDataLstData([FromBody] List<RubberOrderDb> rubberOrders)
		{
			int result = models.ImportRubberOrders(rubberOrders);
			return Json(result);
		}

		[HttpPost]
		public async Task<IActionResult> GetOrdersByAgent(string agentCode)
		{
			var lstData = await models.GetRubberOrdersByAgentAsync(agentCode);
			return new JsonResult(lstData);
		}

		[HttpPost]
		public async Task<IActionResult> GetOrdersByStatus(int status)
		{
			var lstData = await models.GetRubberOrdersByStatusAsync(status);
			return new JsonResult(lstData);
		}

		[HttpPost]
		public async Task<IActionResult> GetOrdersByDateRange(DateTime fromDate, DateTime toDate)
		{
			var lstData = await models.GetRubberOrdersByDateRangeAsync(fromDate, toDate);
			return new JsonResult(lstData);
		}

		#endregion
	}
}