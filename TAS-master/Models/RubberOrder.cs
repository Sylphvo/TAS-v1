using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TAS.Models
{
	[Table("RubberOrder")]
	public class RubberOrderDb
	{
		[Key]
		public long OrderId { get; set; }

		[StringLength(50)]
		public string? OrderCode { get; set; }  // mã đơn

		[StringLength(50)]
		public string? AgentCode { get; set; }  // mã đại lý tạo/đẩy đơn

		public DateTime? OrderDate { get; set; }
		public DateTime? ExpectedShipDate { get; set; }
		public DateTime? ShippedAt { get; set; }

		[StringLength(120)]
		public string? BuyerName { get; set; }

		[StringLength(200)]
		public string? BuyerCompany { get; set; }

		[StringLength(80)]
		public string? ContractNo { get; set; }

		[StringLength(200)]
		public string? Destination { get; set; }

		[StringLength(300)]
		public string? DeliveryAddress { get; set; }

		[StringLength(50)]
		public string? ProductType { get; set; }

		[Column(TypeName = "decimal(5,2)")]
		public decimal? TargetTSC { get; set; }

		[Column(TypeName = "decimal(5,2)")]
		public decimal? TargetDRC { get; set; }

		[Column(TypeName = "decimal(12,3)")]
		public decimal? TotalNetKg { get; set; }

		[Column(TypeName = "decimal(18,2)")]
		public decimal? UnitPrice { get; set; }

		// 0=draft, 1=confirmed, 2=loading, 3=shipped, 9=cancelled (tự quy ước)
		public int? Status { get; set; }

		[StringLength(500)]
		public string? Note { get; set; }

		public DateTime? RegisterDate { get; set; }
		[StringLength(50)]
		public string? RegisterPerson { get; set; }

		public DateTime? UpdateDate { get; set; }
		[StringLength(50)]
		public string? UpdatePerson { get; set; }
	}
	[Table("RubberOrderPond")]
	public class RubberOrderPondDb
	{
		public long OrderId { get; set; }
		public long PondId { get; set; }

		[Column(TypeName = "decimal(12,3)")]
		public decimal? AllocatedKg { get; set; } // đơn lấy từ hồ bao nhiêu kg

		public DateTime? LoadedAt { get; set; }

		public string? BatchNo { get; set; } // mã mẻ xuất (nếu cần)
	}
}
