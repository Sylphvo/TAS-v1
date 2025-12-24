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
		[Key]
		public long OrderId { get; set; }

		[Required]
		[MaxLength(50)]
		public string OrderCode { get; set; } = string.Empty;

		[Required]
		[MaxLength(50)]
		public string AgentCode { get; set; } = string.Empty;

		[MaxLength(255)]
		public string? BuyerName { get; set; }

		[MaxLength(255)]
		public string? BuyerCompany { get; set; }

		[Required]
		public DateTime OrderDate { get; set; } = DateTime.UtcNow.Date;

		public DateTime? ExpectedShipDate { get; set; }

		public DateTime? ShippedAt { get; set; }

		[MaxLength(50)]
		public string? ProductType { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal TotalNetKg { get; set; } = 0.00m;

		/// <summary>
		/// 1: Mới, 2: Đang xử lý, 3: Hoàn thành, 4: Hủy
		/// </summary>
		public byte Status { get; set; } = 1;

		public string? Note { get; set; }

		public DateTime RegisterDate { get; set; } = DateTime.UtcNow;

		[MaxLength(50)]
		public string? RegisterPerson { get; set; }

		public DateTime? UpdateDate { get; set; }

		[MaxLength(50)]
		public string? UpdatePerson { get; set; }

		// Navigation Properties
		[ForeignKey(nameof(AgentCode))]
		public virtual RubberAgent? Agent { get; set; }

		public virtual ICollection<RubberOrderPond> OrderPonds { get; set; } = new List<RubberOrderPond>();
		public virtual ICollection<RubberPallet> Pallets { get; set; } = new List<RubberPallet>();
	}
	// ========================================
	// RUBBER ORDER POND (Bridge: Đơn hàng ← Hồ)
	// ========================================
	public class RubberOrderPond
	{
		[Key]
		public long OrderPondId { get; set; }

		[Required]
		public long OrderId { get; set; }

		[Required]
		public long PondId { get; set; }

		[Required]
		[Column(TypeName = "decimal(10,2)")]
		public decimal AllocatedKg { get; set; }

		public DateTime? LoadedAt { get; set; }

		[MaxLength(50)]
		public string? BatchNo { get; set; }

		// Navigation Properties
		[ForeignKey(nameof(OrderId))]
		public virtual RubberOrder? Order { get; set; }

		[ForeignKey(nameof(PondId))]
		public virtual RubberPond? Pond { get; set; }
	}
}
