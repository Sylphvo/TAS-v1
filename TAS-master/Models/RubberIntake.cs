using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TAS.Models
{
	// ========================================
	// RUBBER INTAKE (Phiếu thu mua)
	// ========================================
	public class RubberIntake
	{
		[Key]
		public long IntakeId { get; set; }

		[MaxLength(50)]
		public string? IntakeCode { get; set; }

		[Required]
		[MaxLength(50)]
		public string FarmCode { get; set; } = string.Empty;

		[Required]
		[MaxLength(255)]
		public string FarmerName { get; set; } = string.Empty;

		[Required]
		[Column(TypeName = "decimal(10,2)")]
		public decimal RubberKg { get; set; }

		[Column(TypeName = "decimal(5,2)")]
		public decimal? TSCPercent { get; set; }

		[Required]
		[Column(TypeName = "decimal(10,2)")]
		public decimal FinishedProductKg { get; set; }

		/// <summary>
		/// 1: Chưa xử lý, 2: Đã vào hồ, 3: Hoàn thành
		/// </summary>
		public byte Status { get; set; } = 1;

		public DateTime RegisterDate { get; set; } = DateTime.UtcNow;

		[MaxLength(50)]
		public string? RegisterPerson { get; set; }

		public DateTime? UpdateDate { get; set; }

		[MaxLength(50)]
		public string? UpdatePerson { get; set; }

		// Navigation Properties
		[ForeignKey(nameof(FarmCode))]
		public virtual RubberFarm? Farm { get; set; }

		public virtual ICollection<RubberPondIntake> PondIntakes { get; set; } = new List<RubberPondIntake>();
	}

}
