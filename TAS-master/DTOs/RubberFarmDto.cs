using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TAS.DTOs
{

	// ========================================
	// 1. INPUT: RubberFarmRequest
	// Dùng cho việc Thêm mới hoặc Cập nhật Farm
	// ========================================
	public class RubberFarmRequest
	{
		public long FarmId { get; set; } // 0 nếu thêm mới

		[Required(ErrorMessage = "Mã nông trường không được để trống")]
		[MaxLength(50)]
		public string FarmCode { get; set; } = string.Empty;

		[Required(ErrorMessage = "Mã đại lý là bắt buộc")]
		public string AgentCode { get; set; } = string.Empty;

		[Required(ErrorMessage = "Tên chủ nông trường không được để trống")]
		[MaxLength(200)]
		public string OwnerName { get; set; } = string.Empty;

		[Phone(ErrorMessage = "Số điện thoại không đúng định dạng")]
		public string? FarmPhone { get; set; }
        public string? FarmName { get; set; }
        public string? Area { get; set; }
        public string? Coordinates { get; set; }
        public string? FarmAddress { get; set; }
        public int Status { get; set; }

        public bool IsActive { get; set; } = true;
		public int PageIndex { get; set; } = 1;      // Trang hiện tại (Mặc định trang 1)
		public int PageSize { get; set; } = 10;      // Số dòng mỗi trang
		public string? Keyword { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)
		public string? SortColumn { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)
		public string? SortOrder { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)		
		public DateTime? FromDate { get; set; }      // Từ ngày
		public DateTime? ToDate { get; set; }        // Đến ngày
	}

	// ========================================
	// 2. OUTPUT: RubberFarmResponse
	// Dùng để trả dữ liệu hiển thị lên AG Grid
	// ========================================
	public class RubberFarmResponse
	{
		// --- Dữ liệu gốc từ Database ---
		public long rowNo { get; set; }
		public long FarmId { get; set; }
		public string? FarmCode { get; set; } 
		public string? AgentCode { get; set; }
		public string? AgentName { get; set; } // Join từ bảng Agent
		public string? OwnerName { get; set; }
		public string? FarmName { get; set; }
		public string? FarmPhone { get; set; }
		public string? Area { get; set; }
        public string? Coordinates { get; set; }
        public string? FarmAddress { get; set; }
		public bool IsActive { get; set; }
		public int Status { get; set; }

		public DateTime RegisterDate { get; set; }
		public string? RegisterPerson { get; set; }
	}
}