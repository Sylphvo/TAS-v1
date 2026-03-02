using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TAS.DTOs
{
	// ========================================
	// DTOs
	// ========================================
	public class RubberOrderRequest
	{
		// Nếu là Thêm mới thì OrderId có thể null. Nếu Sửa thì bắt buộc có.
		public long? OrderId { get; set; }

		[MaxLength(50, ErrorMessage = "Mã đơn hàng tối đa 50 ký tự")]
		public string? OrderCode { get; set; }
		// Lưu ý: Nếu bạn dùng hàm sinh mã tự động ở Server, thì Frontend có thể không cần gửi field này

		[MaxLength(50, ErrorMessage = "Tên đơn hàng tối đa 50 ký tự")]
		public string? OrderName { get; set; }

		public string? OrderDate { get; set; }

		// 0: Draft, 1: Stuffing, 2: On Board, 3: Completed
		public int? Status { get; set; } // Mặc định là Mới tạo

		public string? Note { get; set; }
		public int PageIndex { get; set; }      // Trang hiện tại (Mặc định trang 1)
		public int PageSize { get; set; }    // Số dòng mỗi trang
		public string? Keyword { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)
		public string? SortColumn { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)
		public string? SortOrder { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)		
		public DateTime? FromDate { get; set; }      // Từ ngày
		public DateTime? ToDate { get; set; }        // Đến ngày
	}
	public class RubberOrderResponse
	{
		// ==========================================
		// 1. DATA RAW (Map từ Database)
		// ==========================================
		public long rowNo { get; set; }
		public long OrderId { get; set; }
		public string? OrderCode { get; set; }
		public string? OrderName { get; set; }
		public string? OrderDate { get; set; }
		public int Status { get; set; }
		public string? Note { get; set; }

		// Thông tin Audit (Chỉ xem, không cho sửa từ Client)
		public string? CreatedBy { get; set; }
		public string? CreatedDate { get; set; }
		public string? UpdateBy { get; set; }
		public string? UpdateDate { get; set; }
	}
}