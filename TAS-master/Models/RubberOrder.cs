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
		// ID & Contract
		public long OrderId { get; set; }
		public string? OrderCode { get; set; } // Mã Hợp đồng
		public string? OrderName { get; set; }
		public string? BookingRef { get; set; } // Số Booking hãng tàu

		// Quan hệ (Foreign Keys)
		//public string? AgentCode { get; set; } // Link tới bảng Agents
		public int BuyerId { get; set; } // Link tới bảng Buyers

		// Hàng hóa & Đóng gói
		public string ProductType { get; set; } = "SVR 3L";
		public string PackagingType { get; set; } = "Wooden Pallet"; // Pallet gỗ, Hàng rời...
		public decimal TotalNetKg { get; set; }
		public int ContainerCount { get; set; }

		// Logistics (Xuất khẩu)
		public string Incoterm { get; set; } = "FOB"; // FOB Cat Lai, CIF Hamburg...
		public string PortOfLoading { get; set; } = string.Empty;
		public string PortOfDischarge { get; set; } = string.Empty;
		public string? VesselName { get; set; }
		public string? BillOfLadingNo { get; set; }

		// Dates
		public DateTime OrderDate { get; set; }
		public DateTime? ETD { get; set; } // Ngày đi
		public DateTime? ETA { get; set; } // Ngày đến (Khách Âu rất quan tâm)

		// Status
		public ExportStatus Status { get; set; }
		public string? Note { get; set; }
	}
	// Enum trạng thái gợi ý
	public enum ExportStatus : byte
	{
		New = 0,            // Mới tạo
		QualityCheck = 1,   // Đang kiểm định (DRC, tạp chất)
		Stuffing = 2,       // Đang đóng container
		CustomsClearance = 3, // Đang làm thủ tục hải quan
		OnBoard = 4,        // Đã lên tàu (Shipped)
		Completed = 5       // Khách đã nhận & thanh toán
	}
}
