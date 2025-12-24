using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TAS.Models
{
	[Table("RubberOrder")]
	public class RubberOrder
	{
		[Key]
		public long OrderId { get; set; } // Mã tự tăng
		public string OrderCode { get; set; } = default!; // Mã đơn hàng
		public string OrderName { get; set; } = default!; // Tên đơn hàng
														  // thời gian
		public DateTime RegisterDate { get; set; }//thời gian tạo
		public string? RegisterPerson { get; set; }//người tạo 
		public DateTime? UpdateDate { get; set; }//thời gian cập nhật
		public string? UpdatePerson { get; set; }//người cập nhật
	}
	public class RubberOrderReuqest
	{
		public long OrderId { get; set; } // Mã tự tăng
		public string OrderCode { get; set; } = default!; // Mã đơn hàng
		public string OrderName { get; set; } = default!; // Tên đơn hàng

		// Level 1 - Đại lý
		public long AgentId { get; set; }
		public string? AgentCode { get; set; }
		public string? AgentName { get; set; }

		// Level 2 - Nhà vườn
		public long FarmId { get; set; }
		public string? FarmCode { get; set; }
		public string? FarmerName { get; set; }

		// Level 3 - Thông tin nhập cao su (RubberIntake)
		public long IntakeId { get; set; }


		public decimal TotalFinishedProductKg { get; set; } // Tổng số kg thu mua
		public decimal? TotalCentrifugeProductKg { get; set; } // Giá theo kg

		// Level xác định thứ bậc (1 = đơn hàng, 2 = đại lý, 3 = nhà vườn)
		public int SortOrder { get; set; }

		// Trạng thái và thời gian
		public bool IsActive { get; set; } = true;
		public string? DatePurchase { get; set; }
		public string? SortIdList { get; set; }
		public bool? IsOpenChild { get; set; }

	}
}
