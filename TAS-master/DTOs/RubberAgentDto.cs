using System.ComponentModel.DataAnnotations;

namespace TAS.DTOs
{
	using System;
	using System.ComponentModel.DataAnnotations;

	namespace TAS.DTOs
	{
		// ========================================
		// 1. INPUT: RubberAgentRequest
		// Dùng để hứng dữ liệu từ Form (Thêm/Sửa)
		// ========================================
		public class RubberAgentRequest
		{
			public int AgentId { get; set; } // 0: Thêm mới, >0: Cập nhật

			[Required(ErrorMessage = "Mã đại lý không được để trống")]
			[MaxLength(50)]
			public string AgentCode { get; set; } = string.Empty;

			[Required(ErrorMessage = "Tên đại lý không được để trống")]
			[MaxLength(200)]
			public string AgentName { get; set; } = string.Empty;

			[Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
			public string? AgentPhone { get; set; }

			public string? AgentAddress { get; set; }

			public bool IsActive { get; set; } = true;
			// 1: Sẵn sàng, 2: Đang sản xuất, 3: Bảo trì
			public int PageIndex { get; set; } = 1;      // Trang hiện tại (Mặc định trang 1)
			public int PageSize { get; set; } = 10;      // Số dòng mỗi trang
			public string? Keyword { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)
			public string? SortColumn { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)
			public string? SortOrder { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)		
			public int? Status { get; set; }            // Lọc trạng thái
			public DateTime? FromDate { get; set; }      // Từ ngày
			public DateTime? ToDate { get; set; }        // Đến ngày
		}

		// ========================================
		// 2. OUTPUT: RubberAgentResponse
		// Dùng để trả dữ liệu hiển thị lên AG Grid
		// ========================================
		public class RubberAgentResponse
		{
			// --- Dữ liệu thô từ Database ---
			public long rowNo { get; set; } // Số thứ tự phân trang
			public int AgentId { get; set; }
			public string AgentCode { get; set; } = string.Empty;
			public string AgentName { get; set; } = string.Empty;
			public string? AgentPhone { get; set; }
			public string? AgentAddress { get; set; }
			public bool IsActive { get; set; }
			public DateTime RegisterDate { get; set; }
			public string? RegisterPerson { get; set; }
		}
	}
}