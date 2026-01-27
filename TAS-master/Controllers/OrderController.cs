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
	public class OrderController : Controller
	{
		private readonly OrderModels _orderModels;
		private readonly ILogger<OrderController> _logger;
		private readonly CommonModels _common;

		public OrderController(OrderModels orderModels, ILogger<OrderController> logger, CommonModels common)
		{
			_orderModels = orderModels;
			_logger = logger;
			_common = common;
		}

		// ========================================
		// GET: /Order/Index
		// ========================================
		[Breadcrumb(nameof(Language.key_Order), "#", nameof(Language.key_management_info), true)]
		public IActionResult Index()
		{
			ViewData["Title"] = _common.GetValueByKey("key_Order");
			return View();
		}

		// ========================================
		// GET: /Order/GetAllOrders
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetAllOrders()
		{
			try
			{
				var orders = await _orderModels.GetAllOrdersAsync();
				return Json(new { success = true, data = orders });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAllOrders");
				return Json(new { success = false, message = "Lỗi khi tải dữ liệu" });
			}
		}

		// ========================================
		// GET: /Order/GetOrderById/{id}
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetOrderById(long id)
		{
			try
			{
				var order = await _orderModels.GetOrderByIdAsync(id);
				if (order == null)
				{
					return Json(new { success = false, message = "Không tìm thấy đơn hàng" });
				}
				return Json(new { success = true, data = order });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetOrderById");
				return Json(new { success = false, message = "Lỗi khi tải dữ liệu" });
			}
		}

		// ========================================
		// POST: /Order/CreateOrder
		// ========================================
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> CreateOrder([FromBody] RubberOrderRequest request)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return Json(new { success = false, message = "Dữ liệu không hợp lệ" });
				}

				var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "SYSTEM";
				var result = await _orderModels.CreateOrderAsync(request, userName);

				if (result.Success)
				{
					_logger.LogInformation($"Order created: {result.OrderId} by {userName}");
					return Json(new { success = true, message = "Tạo đơn hàng thành công", orderId = result.OrderId });
				}

				return Json(new { success = false, message = result.Message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in CreateOrder");
				return Json(new { success = false, message = "Lỗi khi tạo đơn hàng" });
			}
		}

		// ========================================
		// PUT: /Order/UpdateOrder
		// ========================================
		[HttpPut]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> UpdateOrder([FromBody] RubberOrderRequest request)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return Json(new { success = false, message = "Dữ liệu không hợp lệ" });
				}

				var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "SYSTEM";
				var result = await _orderModels.UpdateOrderAsync(request, userName);

				if (result.Success)
				{
					_logger.LogInformation($"Order updated: {request.OrderId} by {userName}");
					return Json(new { success = true, message = "Cập nhật đơn hàng thành công" });
				}

				return Json(new { success = false, message = result.Message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in UpdateOrder");
				return Json(new { success = false, message = "Lỗi khi cập nhật đơn hàng" });
			}
		}

		// ========================================
		// DELETE: /Order/DeleteOrder/{id}
		// ========================================
		[HttpDelete]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeleteOrder(long id)
		{
			try
			{
				var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "SYSTEM";
				var result = await _orderModels.DeleteOrderAsync(id, userName);

				if (result.Success)
				{
					_logger.LogInformation($"Order deleted: {id} by {userName}");
					return Json(new { success = true, message = "Xóa đơn hàng thành công" });
				}

				return Json(new { success = false, message = result.Message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in DeleteOrder");
				return Json(new { success = false, message = "Lỗi khi xóa đơn hàng" });
			}
		}

		// ========================================
		// POST: /Order/UpdateStatus
		// ========================================
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> UpdateStatus([FromBody] UpdateOrderRequest request)
		{
			try
			{
				var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "SYSTEM";
				var result = await _orderModels.UpdateOrderStatusAsync(request.OrderId, request.Status, userName);

				if (result.Success)
				{
					_logger.LogInformation($"Order status updated: {request.OrderId} to {request.Status} by {userName}");
					return Json(new { success = true, message = "Cập nhật trạng thái thành công" });
				}

				return Json(new { success = false, message = result.Message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in UpdateStatus");
				return Json(new { success = false, message = "Lỗi khi cập nhật trạng thái" });
			}
		}

		// ========================================
		// POST: /Order/MarkShipped
		// ========================================
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> MarkShipped([FromBody] MarkShippedOrderRequest request)
		{
			try
			{
				var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "SYSTEM";
				var result = await _orderModels.MarkShippedAsync(request.OrderId, userName);

				if (result.Success)
				{
					_logger.LogInformation($"Order marked as shipped: {request.OrderId} by {userName}");
					return Json(new { success = true, message = "Đánh dấu đã xuất hàng thành công" });
				}

				return Json(new { success = false, message = result.Message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in MarkShipped");
				return Json(new { success = false, message = "Lỗi khi đánh dấu xuất hàng" });
			}
		}

		// ========================================
		// GET: /Order/GetAgents
		// ========================================
		[HttpGet]
		public async Task<IActionResult> GetAgents()
		{
			try
			{
				var agents = await _orderModels.GetAgentsAsync();
				return Json(new { success = true, data = agents });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAgents");
				return Json(new { success = false, message = "Lỗi khi tải danh sách đại lý" });
			}
		}

		// ========================================
		// POST: /Order/ExportToExcel
		// ========================================
		[HttpPost]
		public async Task<IActionResult> ExportToExcel([FromBody] List<long> orderIds)
		{
			try
			{
				var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "SYSTEM";
				var fileBytes = await _orderModels.ExportToExcelAsync(orderIds, userName);

				var fileName = $"Orders_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
				return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ExportToExcel");
				return Json(new { success = false, message = "Lỗi khi xuất Excel" });
			}
		}
	}
}
