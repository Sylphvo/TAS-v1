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
                _logger.LogError(ex, "Lỗi khi lấy danh sách Hồ/Lô");
                return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // GET: /Lot/GetLotById/{id}
        // ========================================
        [HttpGet]
        [Route("Lot/GetLotById/{id}")]
        public async Task<IActionResult> GetLotById(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { success = false, message = "ID không hợp lệ" });

                var lot = await _lotModels.GetLotByIdAsync(id);
                if (lot != null)
                {
                    return Ok(new { success = true, data = lot });
                }

                return NotFound(new { success = false, message = "Không tìm thấy thông tin Hồ/Lô" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thông tin Hồ/Lô ID: {id}");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Lot/AddOrUpdateLot
        // ========================================
        [HttpPost]
        public async Task<IActionResult> AddOrUpdateLot([FromBody] RubberLotRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });
                }

                long resultId = await _lotModels.AddOrUpdateLotAsync(request);
                bool isUpdate = request.LotId > 0;

                return Ok(new
                {
                    success = true,
                    message = isUpdate ? "Cập nhật thành công!" : "Thêm mới thành công!",
                    data = resultId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu thông tin Hồ/Lô");
                return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Lot/SaveBatchLots (MỚI)
        // ========================================
        [HttpPost]
        public async Task<IActionResult> SaveBatchLots([FromBody] List<RubberLotRequest> requests)
        {
            try
            {
                if (requests == null || !requests.Any())
                {
                    return BadRequest(new { success = false, message = "Không có dữ liệu để lưu." });
                }

                // Bạn cần bổ sung hàm SaveBatchLotsAsync trong LotModels
                var result = await _lotModels.SaveBatchLotsAsync(requests);

                if (result)
                {
                    return Ok(new { success = true, message = $"Đã lưu thành công {requests.Count} hồ/lô!" });
                }

                return BadRequest(new { success = false, message = "Lưu thất bại, vui lòng thử lại." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu hàng loạt hồ/lô");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Lot/DeleteBatchLots (MỚI)
        // ========================================
        [HttpPost]
        public async Task<IActionResult> DeleteBatchLots([FromBody] List<long> lotIds)
        {
            try
            {
                if (lotIds == null || !lotIds.Any())
                {
                    return BadRequest(new { success = false, message = "Không có hồ/lô nào được chọn để xóa." });
                }

                // Bạn cần bổ sung hàm DeleteBatchLotsAsync trong LotModels
                var result = await _lotModels.DeleteBatchLotsAsync(lotIds);

                if (result)
                {
                    return Ok(new { success = true, message = $"Đã xóa thành công {lotIds.Count} hồ/lô!" });
                }

                return BadRequest(new { success = false, message = "Xóa thất bại hoặc các hồ/lô này đã bị xóa trước đó." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa nhiều hồ/lô");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // DELETE: /Lot/DeleteLot
        // ========================================
        [HttpDelete]
        [Route("Lot/DeleteLot/{lotId}")]
        public async Task<IActionResult> DeleteLot(int lotId) // Sửa route để nhận tham số trực tiếp hoặc qua query
        {
            try
            {
                if (lotId <= 0)
                {
                    return BadRequest(new { success = false, message = "ID không hợp lệ." });
                }

                var result = await _lotModels.DeleteLotAsync(lotId);
                if (result)
                {
                    return Ok(new { success = true, message = "Đã xóa hồ/lô thành công." });
                }

                return BadRequest(new { success = false, message = "Xóa thất bại, hồ/lô có thể không tồn tại." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa hồ/lô ID: {lotId}");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Lot/UpdateStatus (MỚI)
        // ========================================
        [HttpPost]
        public async Task<IActionResult> UpdateStatus([FromBody] RubberLotRequest request)
        {
            try
            {
                if (request == null || request.LotId <= 0)
                {
                    return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });
                }

                // Bạn cần bổ sung hàm UpdateStatusAsync trong LotModels và class UpdateLotStatusRequest trong DTOs
                var result = await _lotModels.UpdateStatusAsync(request.LotId, request.Status);

                if (result)
                {
                    return Ok(new { success = true, message = "Cập nhật trạng thái thành công!" });
                }

                return BadRequest(new { success = false, message = "Cập nhật trạng thái thất bại." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi cập nhật trạng thái hồ/lô ID {request?.LotId}");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Lot/ExportToExcel (MỚI)
        // ========================================
        [HttpPost]
        public async Task<IActionResult> ExportToExcel([FromBody] List<long> lotIds)
        {
            try
            {
                // Bạn cần bổ sung hàm ExportLotsToExcelAsync trong LotModels
                var fileContent = await _lotModels.ExportLotsToExcelAsync(lotIds);

                if (fileContent == null || fileContent.Length == 0)
                {
                    return BadRequest(new { success = false, message = "Không có dữ liệu để xuất hoặc lỗi tạo file." });
                }

                string fileName = lotIds != null && lotIds.Any()
                    ? $"DanhSachHoLo_Selected_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
                    : $"DanhSachHoLo_All_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

                return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xuất file Excel hồ/lô");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}