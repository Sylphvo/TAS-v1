using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TAS.Models
{
	[Table("RubberPallets")]
	public class RubberPalletDb
	{
		[Key]
		public long PalletId { get; set; } // identity

		[Required]
		public long OrderId { get; set; }   // FK -> RubberOrderSummary.OrderId

		// ✅ NEW: pallet được đóng ra từ hồ nào
		public long? PondId { get; set; }  // để nullable cho an toàn migration, sau này muốn siết NOT NULL thì update tiếp
		[Required, StringLength(50)]
		public string PalletCode { get; set; } = default!; // VD: ORD__12112025__001__PL_001
		public string PalletName { get; set; } = default!; // VD: ORD001-P001

		public int PalletNo { get; set; } // 1..n

		[Column(TypeName = "decimal(12,3)")]
		public decimal WeightKg { get; set; }// Trọng lượng kg
		public int IsActive { get; set; }// trạng thái pallet
		public DateTime RegisterDate { get; set; }//thời gian tạo
		public string? RegisterPerson { get; set; }//người tạo 
		public DateTime? UpdateDate { get; set; }//thời gian cập nhật
		public string? UpdatePerson { get; set; }//người cập nhật
	}
	public class RubberPalletRequest
	{
		public int? rowNo { get; set; } // identity
		public long palletId { get; set; } // identity
		public long orderId { get; set; }   // FK -> RubberOrderSummary.OrderId
		public string palletCode { get; set; } = default!; // VD: ORD__12112025__001__PL_001
		public string palletName { get; set; } = default!; // VD: tên Pallet
		public int palletNo { get; set; } // 1..n
		public decimal weightKg { get; set; }// Trọng lượng kg
		public int isActive { get; set; }// trạng thái pallet
		public DateTime registerDate { get; set; }//thời gian tạo
		public string? registerPerson { get; set; }//người tạo 
		public DateTime? updateDate { get; set; }//thời gian cập nhật
		public string? updatePerson { get; set; }//người cập nhật
	}
}
