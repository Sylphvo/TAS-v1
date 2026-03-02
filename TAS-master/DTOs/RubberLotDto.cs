using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TAS.DTOs
{
	// ========================================
	// 1. INPUT REQUEST (Dùng cho Create/Update)
	// ========================================
	public class RubberLotResponse
	{
		public int RowNo { get; set; }
		public int LotId { get; set; }
		public string? LotCode { get; set; }
		public string? LotName { get; set; }
		public decimal? CapacityKg { get; set; }
		public decimal? DailyCapacityKg { get; set; }
		public decimal? CurrentNetKg { get; set; }
		public int? Status { get; set; }
		public DateTime? CreateByDate { get; set; }
		public string? CreateBy { get; set; }
		public DateTime? UpdateDate { get; set; }
		public string? UpdateBy { get; set; }
	}

	// Class dùng cho Request khi thêm mới hoặc cập nhật
	public class RubberLotRequest
	{
		public int RowNo { get; set; }
		public int LotId { get; set; }
		public string? LotCode { get; set; }
		public string? LotName { get; set; }
		public decimal CapacityKg { get; set; }
		public decimal DailyCapacityKg { get; set; }
		public decimal? CurrentNetKg { get; set; }
		public int Status { get; set; }
		public string? CreateByDate { get; set; }
		public string? CreateBy { get; set; }
		public string? UpdateDate { get; set; }
		public string? UpdateBy { get; set; }
		public string? Note { get; set; }
		public int PageIndex { get; set; } = 1;      // Trang hiện tại (Mặc định trang 1)
		public int PageSize { get; set; } = 10;      // Số dòng mỗi trang
		public string? Keyword { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)
		public string? SortColumn { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)
		public string? SortOrder { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)		
		public DateTime? FromDate { get; set; }      // Từ ngày
		public DateTime? ToDate { get; set; }        // Đến ngày

	}
}