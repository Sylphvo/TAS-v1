using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TAS.DTOs
{
	// ========================================
	// 1. INPUT REQUEST (Dùng cho Create/Update)
	// ========================================
	public class RubberPondRequest
	{
		// Nếu PondId = 0 là thêm mới, > 0 là cập nhật
		public long PondId { get; set; }

		[Required(ErrorMessage = "Mã hồ là bắt buộc")]
		[MaxLength(50, ErrorMessage = "Mã hồ tối đa 50 ký tự")]
		public string PondCode { get; set; } = string.Empty;

		[Required(ErrorMessage = "Đại lý là bắt buộc")]
		public string AgentCode { get; set; } = string.Empty;

		[MaxLength(100, ErrorMessage = "Tên hồ tối đa 100 ký tự")]
		public string PondName { get; set; } = string.Empty;

		public decimal CapacityKg { get; set; }
		public decimal DailyCapacityKg { get; set; }
		public decimal CurrentNetKg { get; set; }

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
	// 2. OUTPUT RESPONSE (Dùng cho API trả về)
	// ========================================
	public class RubberPondResponse
	{
		// --- Data Raw (Map từ Database) ---
		public long rowNo { get; set; }
		public long PondId { get; set; }
		public string PondCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string AgentName { get; set; } = string.Empty;
		public string PondName { get; set; } = string.Empty;
		public decimal CapacityKg { get; set; }
		public decimal DailyCapacityKg { get; set; }
		public decimal CurrentNetKg { get; set; }
		public int Status { get; set; }
		public DateTime RegisterDate { get; set; }
		public string RegisterPerson { get; set; } = string.Empty;
		public DateTime? UpdateDate { get; set; }
		public string? UpdatePerson { get; set; }
		public decimal UtilizationPercent { get; set; }
	}
}