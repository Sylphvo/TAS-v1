using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TAS.Models
{
	// ========================================
	// RUBBER PALLET
	// ========================================
	public class RubberPallet
	{
		[Key]
		public long PalletId { get; set; }

		[Required]
		public long OrderId { get; set; }

		public long? PondId { get; set; }

		[Required]
		[MaxLength(50)]
		public string PalletCode { get; set; } = string.Empty;

		[MaxLength(255)]
		public string? PalletName { get; set; }

		[Required]
		public int PalletNo { get; set; }

		[Required]
		[Column(TypeName = "decimal(10,2)")]
		public decimal WeightKg { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal StandardWeightKg { get; set; } = 2325.00m;

		public bool IsActive { get; set; } = true;

		/// <summary>
		/// 1: Trong kho, 2: Đã xuất, 3: Đã giao
		/// </summary>
		public byte Status { get; set; } = 1;

		public DateTime RegisterDate { get; set; } = DateTime.UtcNow;

		[MaxLength(50)]
		public string? RegisterPerson { get; set; }

		public DateTime? UpdateDate { get; set; }

		[MaxLength(50)]
		public string? UpdatePerson { get; set; }

		// Navigation Properties
		[ForeignKey(nameof(OrderId))]
		public virtual RubberOrder? Order { get; set; }

		[ForeignKey(nameof(PondId))]
		public virtual RubberPond? Pond { get; set; }
	}
}
