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
		public async Task<IActionResult> GetAllOrders([FromQuery] RubberOrderRequest filter)
		{
			try
			{
				// filter sẽ tự động map: pageIndex, pageSize, keyword, status...
				var result = await _orderModels.GetOrdersWithFilterAsync(filter);

				// Trả về cấu trúc chuẩn: success + data (bao gồm items và totalRecords)
				return Json(new { success = true, data = result });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAllOrders");
				return Json(new { success = false, message = "Lỗi khi tải dữ liệu: " + ex.Message });
			}
		}

		/// <summary>
		/// API xử lý cả Thêm mới và Cập nhật
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> AddOrUpdateOrder([FromBody] RubberOrderRequest request)
		{
			// 1. Validate dữ liệu đầu vào cơ bản (Dựa trên DataAnnotation trong Model)
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
				// 2. Gọi Service để xử lý DB (Hàm AddOrUpdateOrderAsync bạn đã viết)
				long resultId = await _orderModels.AddOrUpdateOrderAsync(request);

				// 3. Trả về kết quả
				// Quan trọng: Trả về resultId để Frontend cập nhật lại Grid (nếu là thêm mới)
				return Ok(new
				{
					success = true,
					message = request.OrderId > 0 ? "Cập nhật thành công!" : "Thêm mới thành công!",
					data = resultId // Trả về ID (để update vào AG Grid)
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Lỗi khi lưu đơn hàng");
				return StatusCode(500, new
				{
					success = false,
					message = "Đã xảy ra lỗi hệ thống: " + ex.Message
				});
			}
		}

		[HttpDelete]
		public async Task<IActionResult> DeleteOrder(int orderId)
		{
			try
			{
				if (orderId <= 0)
				{
					return BadRequest(new { success = false, message = "ID đơn hàng không hợp lệ." });
				}

				var result = await _orderModels.DeleteOrderAsync(orderId);

				if (result)
				{
					return Ok(new { success = true, message = "Xóa thành công." });
				}
				else
				{
					return NotFound(new { success = false, message = "Không tìm thấy đơn hàng hoặc đơn hàng đã bị xóa trước đó." });
				}
			}
			catch (Exception ex)
			{
				// Trả về lỗi 500 kèm thông báo chi tiết (nếu là lỗi logic nghiệp vụ ta throw ở trên)
				return StatusCode(500, new { success = false, message = ex.Message });
			}
		}
        [HttpPost]
        public async Task<IActionResult> SaveBatchOrders([FromBody] List<RubberOrderRequest> orders)
        {
            // Kiểm tra dữ liệu đầu vào
            if (orders == null || !orders.Any())
            {
                return BadRequest(new { success = false, message = "Không có dữ liệu để lưu." });
            }

            // Validate dữ liệu cơ bản
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });
            }

            try
            {
                // Gọi xuống Models để xử lý lưu hàng loạt
                var result = await _orderModels.SaveBatchOrdersAsync(orders);

                if (result)
                {
                    return Ok(new { success = true, message = "Lưu tất cả thành công!" });
                }
                return BadRequest(new { success = false, message = "Lưu thất bại, vui lòng thử lại." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu hàng loạt đơn hàng");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
        [HttpPost]
        public async Task<IActionResult> DeleteBatchOrders([FromBody] List<long> orderIds)
        {
            try
            {
                // Kiểm tra danh sách rỗng
                if (orderIds == null || !orderIds.Any())
                {
                    return BadRequest(new { success = false, message = "Không có đơn hàng nào được chọn để xóa." });
                }

                // Gọi hàm xóa nhiều từ Models
                var result = await _orderModels.DeleteBatchOrdersAsync(orderIds);

                if (result)
                {
                    return Ok(new { success = true, message = $"Đã xóa thành công {orderIds.Count} đơn hàng!" });
                }

                return BadRequest(new { success = false, message = "Xóa thất bại hoặc các đơn hàng này đã bị xóa trước đó." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa nhiều đơn hàng");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}
