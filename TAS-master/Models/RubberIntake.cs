using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TAS.Models
{
	[Table("RubberIntake")]
	public class RubberIntakeDb
	{
		[Key]
		public long IntakeId { get; set; }

		// Mã nhà vườn
		[Required, StringLength(200)]
		public string? FarmCode { get; set; }

		// Mã đơn hàng
		public string? OrderCode { get; set; }

		// Tên nhà vườn
		[Required, StringLength(200)]
		public string? FarmerName { get; set; }

		// KG
		[Column(TypeName = "decimal(12,3)")]
		public decimal? RubberKg { get; set; }

		// TSC (%)
		[Column(TypeName = "decimal(5,2)")]
		public decimal? TSCPercent { get; set; }

		// DRC (%)
		[Column(TypeName = "decimal(5,2)")]
		public decimal? DRCPercent { get; set; }

		// Thành Phẩm (kg)
		[Column(TypeName = "decimal(12,3)")]
		public decimal? FinishedProductKg { get; set; }

		// Thành Phẩm Ly Tâm (kg)
		[Column(TypeName = "decimal(12,3)")]
		public decimal? CentrifugeProductKg { get; set; }

		// Trạng thái  nhập

		public int? Status { get; set; }

		public DateTime? RegisterDate { get; set; }// thời gian tạo

		[StringLength(50)]
		public string? RegisterPerson { get; set; } // Người tạo

		public DateTime? UpdateDate { get; set; }// thời gian cập nhật

		[StringLength(50)]
		public string? UpdatePerson { get; set; } // Người cập nhật

	}
	public class RubberIntakeRequest
	{

		public int? rowNo { get; set; } // STT
		public int? intakeId { get; set; } // STT
		public string agentCode { get; set; } = string.Empty;  // Mã nhà vườn
		public string farmCode { get; set; } = string.Empty;  // Mã nhà vườn
		public string farmerName { get; set; } = string.Empty;  // Tên nhà vườn
		public decimal? rubberKg { get; set; }    // KG
		public decimal? tscPercent { get; set; }// TSC (%)
		public decimal? drcPercent { get; set; }// DRC (%)
		public decimal? finishedProductKg { get; set; }// Thành Phẩm (kg)
		public decimal? centrifugeProductKg { get; set; }// Thành Phẩm Ly Tâm (kg)
		public int? status { get; set; }
		public string? timeDate { get; set; }
		public string? timeDate_Person { get; set; }


		public DateTime? registerDate { get; set; }
		public string? registerPerson { get; set; }
		public DateTime? updateDate { get; set; }
		public string? updatePerson { get; set; }

	}
}
