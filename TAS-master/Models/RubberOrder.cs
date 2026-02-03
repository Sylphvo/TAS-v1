using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TAS.Helpers;

namespace TAS.Models
{
	// ========================================
	// RUBBER ORDER (Đơn hàng)
	// ========================================
	public class RubberOrder
	{
		// ==========================================
		// 1. DATA PROPERTIES (Map trực tiếp với SQL)
		// ==========================================

		[Key]
		public long OrderId { get; set; }

		[MaxLength(50)]
		public string? OrderCode { get; set; } // Mã hợp đồng

		[MaxLength(50)]
		public string? OrderName { get; set; } // Tên hợp đồng/Tên gợi nhớ

		public DateTime? OrderDate { get; set; } // Ngày ký kết/Ngày tạo đơn

		// Trạng thái: 0: Draft, 1: Stuffing, 2: On Board, 3: Completed
		public int Status { get; set; }

		public string? Note { get; set; }

		// --- Audit Log ---
		[MaxLength(50)]
		public string? CreatedBy { get; set; }

		public DateTime CreatedDate { get; set; } = DateTime.Now; // Mặc định giờ hiện tại

		[MaxLength(50)]
		public string? UpdateBy { get; set; }

		public DateTime? UpdateDate { get; set; }

		// ==========================================
		// 2. VIEW PROPERTIES (Logic hiển thị cho Frontend)
		// ==========================================

		// Format ngày tháng (dd/MM/yyyy) để hiển thị lên lưới cho đẹp
		public string OrderDateStr => OrderDate.HasValue ? OrderDate.Value.ToString("dd/MM/yyyy") : "";
		public string CreatedDateStr => CreatedDate.ToString("dd/MM/yyyy HH:mm");

		// Hiển thị tên trạng thái tiếng Việt
		public string StatusName
		{
			get
			{
				return Status switch
				{
					0 => "Mới tạo (Draft)",
					1 => "Đang đóng hàng",
					2 => "Đã lên tàu",
					3 => "Hoàn thành",
					_ => "Không xác định"
				};
			}
		}

		// Hiển thị màu sắc trạng thái (Dùng cho Bootstrap Badge)
		// Ví dụ: <span class="badge bg-{StatusClass}">{StatusName}</span>
		public string StatusClass
		{
			get
			{
				return Status switch
				{
					0 => "secondary", // Xám
					1 => "warning",   // Vàng
					2 => "primary",   // Xanh dương
					3 => "success",   // Xanh lá
					_ => "dark"
				};
			}
		}
	}
}
