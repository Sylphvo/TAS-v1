using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAS.DTOs;
using TAS.Models;
using TAS.Resources;
using TAS.ViewModels;

namespace TAS.Controllers
{
    [Authorize]
    public class FarmController : Controller
    {
        private readonly FarmModels _farmModels;
        private readonly ILogger<FarmController> _logger;
        private readonly CommonModels _common;

        public FarmController(FarmModels farmModels, CommonModels common, ILogger<FarmController> logger)
        {
            _farmModels = farmModels;
            _common = common;
            _logger = logger;
        }

        // ========================================
        // GET: /Farm/Index
        // ========================================
        [Breadcrumb(nameof(Language.key_nhavuon), "#", nameof(Language.key_management_info), true)]
        public IActionResult Index()
        {
            ViewData["Title"] = _common.GetValueByKey("key_nhavuon");
            return View();
        }

        // ========================================
        // GET: /Farm/GetAll
        // ========================================
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] RubberFarmRequest filter)
        {
            try
            {
                var farms = await _farmModels.GetFarmsWithFilterAsync(filter);
                return Json(new { success = true, data = farms });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách nông trường");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // GET: /Farm/GetFarmById/{id}
        // ========================================
        [HttpGet]
        [Route("Farm/GetFarmById/{id}")]
        public async Task<IActionResult> GetFarmById(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { success = false, message = "ID không hợp lệ" });

                var farm = await _farmModels.GetFarmByIdAsync(id);
                if (farm != null) return Ok(new { success = true, data = farm });

                return NotFound(new { success = false, message = "Không tìm thấy thông tin nông trường" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thông tin nông trường ID: {id}");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Farm/SaveInline (hoặc AddOrUpdateFarm)
        // ========================================
        [HttpPost]
        public async Task<IActionResult> SaveInline([FromBody] RubberFarmRequest request)
        {
            try
            {
                if (request == null) return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });

                long resultId = await _farmModels.AddOrUpdateFarmAsync(request);
                bool isUpdate = request.FarmId > 0;

                return Ok(new
                {
                    success = true,
                    message = isUpdate ? "Cập nhật thành công!" : "Thêm mới thành công!",
                    data = resultId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu thông tin nông trường");
                return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Farm/SaveBatchFarms
        // ========================================
        [HttpPost]
        public async Task<IActionResult> SaveBatchFarms([FromBody] List<RubberFarmRequest> requests)
        {
            try
            {
                if (requests == null || !requests.Any())
                    return BadRequest(new { success = false, message = "Không có dữ liệu để lưu." });

                var result = await _farmModels.SaveBatchFarmsAsync(requests);

                if (result) return Ok(new { success = true, message = $"Đã lưu thành công {requests.Count} nông trường!" });
                return BadRequest(new { success = false, message = "Lưu thất bại, vui lòng thử lại." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu hàng loạt nông trường");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Farm/DeleteMultiple
        // ========================================
        [HttpPost]
        public async Task<IActionResult> DeleteMultiple([FromBody] List<long> farmIds)
        {
            try
            {
                if (farmIds == null || !farmIds.Any())
                    return BadRequest(new { success = false, message = "Không có nông trường nào được chọn để xóa." });

                var result = await _farmModels.DeleteBatchFarmsAsync(farmIds);

                if (result) return Ok(new { success = true, message = $"Đã xóa thành công {farmIds.Count} nông trường!" });
                return BadRequest(new { success = false, message = "Xóa thất bại." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa nhiều nông trường");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // DELETE: /Farm/Delete/{farmId}
        // ========================================
        [HttpDelete]
        [Route("Farm/Delete/{farmId}")]
        public async Task<IActionResult> Delete(int farmId)
        {
            try
            {
                if (farmId <= 0) return BadRequest(new { success = false, message = "ID không hợp lệ." });

                var result = await _farmModels.DeleteFarmAsync(farmId);
                if (result) return Ok(new { success = true, message = "Đã xóa nông trường thành công." });

                return BadRequest(new { success = false, message = "Xóa thất bại." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa nông trường ID: {farmId}");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Farm/ExportSelected
        // ========================================
        [HttpPost]
        public async Task<IActionResult> ExportSelected([FromBody] List<long> farmIds)
        {
            try
            {
                var fileContent = await _farmModels.ExportFarmsToExcelAsync(farmIds);
                if (fileContent == null || fileContent.Length == 0)
                    return BadRequest(new { success = false, message = "Không có dữ liệu để xuất." });

                string fileName = farmIds != null && farmIds.Any()
                    ? $"NongTruong_Selected_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
                    : $"NongTruong_All_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

                return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xuất file Excel nông trường");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}