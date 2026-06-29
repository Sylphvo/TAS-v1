using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAS.DTOs;
using TAS.DTOs.TAS.DTOs;
using TAS.Resources;
using TAS.ViewModels;
using static Azure.Core.HttpHeader;

namespace TAS.Controllers
{
    [Authorize]
    public class AgentController : Controller
    {
        private readonly AgentModels _agentModels;
        private readonly ILogger<AgentController> _logger;
        private readonly CommonModels _common;

        public AgentController(ILogger<AgentController> logger, AgentModels agentModels, CommonModels common)
        {
            _logger = logger;
            _agentModels = agentModels;
            _common = common;
        }

        // ========================================
        // GET: /Agent/Index
        // ========================================
        [HttpGet]
        [Breadcrumb(nameof(Language.key_agent), "#", nameof(Language.key_management_info), true)]
        public IActionResult Index()
        {
            ViewData["Title"] = _common.GetValueByKey("key_agent");
            return View();
        }

        // ========================================
        // GET: /Agent/GetAllAgents
        // ========================================
        [HttpGet]
        public async Task<IActionResult> GetAllAgents([FromQuery] RubberAgentRequest filter)
        {
            try
            {
                var agents = await _agentModels.GetAgentsWithFilterAsync(filter);
                return Json(new { success = true, data = agents });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách đại lý");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // GET: /Agent/GetAgentById/{id}
        // ========================================
        [HttpGet]
        [Route("Agent/GetAgentById/{id}")]
        public async Task<IActionResult> GetAgentById(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { success = false, message = "ID không hợp lệ" });

                var agent = await _agentModels.GetAgentByIdAsync(id);
                if (agent != null) return Ok(new { success = true, data = agent });

                return NotFound(new { success = false, message = "Không tìm thấy thông tin đại lý" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thông tin đại lý ID: {id}");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Agent/SaveAgent (Add/Update)
        // ========================================
        [HttpPost]
        public async Task<IActionResult> SaveAgent([FromBody] RubberAgentRequest request)
        {
            try
            {
                if (request == null) return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });

                long resultId = await _agentModels.SaveAgentAsync(request);
                bool isUpdate = request.AgentId > 0;

                return Ok(new
                {
                    success = true,
                    message = isUpdate ? "Cập nhật thành công!" : "Thêm mới thành công!",
                    data = resultId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu thông tin đại lý");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Agent/SaveBatchAgents
        // ========================================
        [HttpPost]
        public async Task<IActionResult> SaveBatchAgents([FromBody] List<RubberAgentRequest> requests)
        {
            try
            {
                if (requests == null || !requests.Any())
                    return BadRequest(new { success = false, message = "Không có dữ liệu để lưu." });

                var result = await _agentModels.SaveBatchAgentsAsync(requests);

                if (result) return Ok(new { success = true, message = $"Đã lưu thành công {requests.Count} đại lý!" });
                return BadRequest(new { success = false, message = "Lưu thất bại, vui lòng thử lại." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu hàng loạt đại lý");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Agent/DeleteBatchAgents
        // ========================================
        [HttpPost]
        public async Task<IActionResult> DeleteBatchAgents([FromBody] List<long> agentIds)
        {
            try
            {
                if (agentIds == null || !agentIds.Any())
                    return BadRequest(new { success = false, message = "Không có đại lý nào được chọn để xóa." });

                var result = await _agentModels.DeleteBatchAgentsAsync(agentIds);

                if (result) return Ok(new { success = true, message = $"Đã xóa thành công {agentIds.Count} đại lý!" });
                return BadRequest(new { success = false, message = "Xóa thất bại." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa nhiều đại lý");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // DELETE: /Agent/DeleteAgent/{id}
        // ========================================
        [HttpDelete]
        [Route("Agent/DeleteAgent/{id}")]
        public async Task<IActionResult> DeleteAgent(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { success = false, message = "ID không hợp lệ." });

                var result = await _agentModels.DeleteAgentAsync(id);
                if (result) return Ok(new { success = true, message = "Đã xóa đại lý thành công." });

                return BadRequest(new { success = false, message = "Xóa thất bại." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa đại lý ID: {id}");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // ========================================
        // POST: /Agent/ExportToExcel
        // ========================================
        [HttpPost]
        public async Task<IActionResult> ExportToExcel([FromBody] List<long> agentIds)
        {
            try
            {
                var fileContent = await _agentModels.ExportAgentsToExcelAsync(agentIds);
                if (fileContent == null || fileContent.Length == 0)
                    return BadRequest(new { success = false, message = "Không có dữ liệu để xuất." });

                string fileName = agentIds != null && agentIds.Any()
                    ? $"DaiLy_Selected_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
                    : $"DaiLy_All_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

                return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xuất file Excel đại lý");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}