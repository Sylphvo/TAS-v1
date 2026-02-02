using System;
using System.Collections.Generic;

namespace TAS.DTOs
{
	// ========================================
	// DTOs
	// ========================================
	public class RubberOrderResult
	{
		public long? OrderId { get; set; }

		// 1. Thông tin chung
		public string OrderName { get; set; } = string.Empty; // Mới: Tên gợi nhớ
		public int AgentId { get; set; }                      // Mới: Chọn từ Dropdown
		public int BuyerId { get; set; }                      // Mới: Chọn từ Dropdown

		// 2. Hàng hóa
		public string ProductType { get; set; } = "SVR 3L";
		public decimal? TotalNetKg { get; set; }
		public string PackagingType { get; set; }             // Mới: Quy cách đóng gói

		// 3. Logistics & Hợp đồng (Quan trọng cho xuất khẩu)
		public string? BookingRef { get; set; }               // Số Booking
		public string? Incoterm { get; set; }                 // FOB/CIF...
		public string? PortOfDischarge { get; set; }          // Cảng đến
		public DateTime? OrderDate { get; set; }
		public DateTime? ETD { get; set; }                    // Ngày tàu chạy dự kiến

		public string? Note { get; set; }
	}
	public class RubberOrderResponse
	{
		// ==========================================
		// 1. DATA PROPERTIES (Map trực tiếp từ SQL)
		// ==========================================
		public int rowNo { get; set; }
		public long OrderId { get; set; }
		public string? OrderCode { get; set; }
		public string? OrderName { get; set; } // Mới thêm

		public string? AgentCode { get; set; }
		public string? AgentName { get; set; }

		public string? BuyerCompany { get; set; } // Tên công ty khách hàng

		public string? ProductType { get; set; }
		public decimal TotalNetKg { get; set; }

		public DateTime OrderDate { get; set; }
		public DateTime? ETD { get; set; } // Ngày tàu chạy
		public string? PortOfDischarge { get; set; } // Cảng đến

		public byte Status { get; set; }
		public string? Note { get; set; }
		public DateTime? UpdateDate { get; set; }

		// ==========================================
		// 2. VIEW PROPERTIES (Logic hiển thị cho Frontend)
		// ==========================================

		// Tự động format ngày tháng (Frontend đỡ phải convert)
		public string OrderDateStr => OrderDate.ToString("dd/MM/yyyy");
		public string ETDStr => ETD?.ToString("dd/MM/yyyy") ?? "-";

		// Hiển thị tóm tắt hàng hóa: "SVR 3L (38.4 Tấn)"
		public string ProductSummary
		{
			get
			{
				var tons = Math.Round(TotalNetKg / 1000m, 2);
				return $"{ProductType} ({tons} Tấn)";
			}
		}

		// Tên trạng thái tiếng Việt
		public string StatusName
		{
			get
			{
				return Status switch
				{
					0 => "Mới tạo",
					1 => "Đang đóng cont",
					2 => "Đã lên tàu",
					3 => "Hoàn thành",
					4 => "Hủy",
					_ => "N/A"
				};
			}
		}

		// Màu sắc trạng thái (Bootstrap Badge)
		public string StatusBadgeClass
		{
			get
			{
				return Status switch
				{
					0 => "badge-secondary", // Xám
					1 => "badge-warning",   // Vàng
					2 => "badge-primary",   // Xanh dương
					3 => "badge-success",   // Xanh lá
					4 => "badge-danger",    // Đỏ
					_ => "badge-dark"
				};
			}
		}
	}
	// 1. Input: Hứng dữ liệu từ API/Màn hình gửi xuống
	public class OrderFilterRequest
	{
		public int PageIndex { get; set; } = 1;      // Trang hiện tại (Mặc định trang 1)
		public int PageSize { get; set; } = 10;      // Số dòng mỗi trang

		public string? Keyword { get; set; }         // Tìm kiếm chung (Mã, Tên, Agent...)
		public byte? Status { get; set; }            // Lọc trạng thái
		public DateTime? FromDate { get; set; }      // Từ ngày
		public DateTime? ToDate { get; set; }        // Đến ngày
	}

	// 2. Output: Trả về bao gồm dữ liệu và tổng số dòng (để FE chia trang)
	public class PagedResult<T>
	{
		public List<T> Items { get; set; } = new List<T>();
		public int TotalRecords { get; set; }
		public bool Success { get; set; }
		public string Message { get; set; }
	}
	
}