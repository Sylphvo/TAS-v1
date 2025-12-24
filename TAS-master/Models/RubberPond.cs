using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TAS.Helpers;

namespace TAS.Models
{
	// ========================================
	// RUBBER POND (Hồ sản xuất)
	// ========================================
	public class RubberPond
	{
		[Key]
		public long PondId { get; set; }

		[Required]
		[MaxLength(50)]
		public string PondCode { get; set; } = string.Empty;

		[Required]
		[MaxLength(50)]
		public string AgentCode { get; set; } = string.Empty;

		[Required]
		[MaxLength(255)]
		public string PondName { get; set; } = string.Empty;

		[Column(TypeName = "decimal(10,2)")]
		public decimal CapacityKg { get; set; } = 50000.00m;

		[Column(TypeName = "decimal(10,2)")]
		public decimal DailyCapacityKg { get; set; } = 5000.00m;

		[Column(TypeName = "decimal(10,2)")]
		public decimal CurrentNetKg { get; set; } = 0.00m;

		/// <summary>
		/// 1: Sẵn sàng, 2: Đang sản xuất, 3: Bảo trì
		/// </summary>
		public byte Status { get; set; } = 1;

		public DateTime RegisterDate { get; set; } = DateTime.UtcNow;

		[MaxLength(50)]
		public string? RegisterPerson { get; set; }

		public DateTime? UpdateDate { get; set; }

		[MaxLength(50)]
		public string? UpdatePerson { get; set; }

		// Navigation Properties
		[ForeignKey(nameof(AgentCode))]
		public virtual RubberAgent? Agent { get; set; }

		public virtual ICollection<RubberPondIntake> PondIntakes { get; set; } = new List<RubberPondIntake>();
		public virtual ICollection<RubberOrderPond> OrderPonds { get; set; } = new List<RubberOrderPond>();
		public virtual ICollection<RubberPallet> Pallets { get; set; } = new List<RubberPallet>();
	}
	// ========================================
	// RUBBER POND INTAKE (Bridge: Hồ ← Intake)
	// ========================================
	public class RubberPondIntake
	{
		[Key]
		public long PondIntakeId { get; set; }

		[Required]
		public long PondId { get; set; }

		[Required]
		public long IntakeId { get; set; }

		[Required]
		[Column(TypeName = "decimal(10,2)")]
		public decimal PouredKg { get; set; }

		[Required]
		public DateTime PouredAt { get; set; } = DateTime.UtcNow;

		// Navigation Properties
		[ForeignKey(nameof(PondId))]
		public virtual RubberPond? Pond { get; set; }

		[ForeignKey(nameof(IntakeId))]
		public virtual RubberIntake? Intake { get; set; }
	}
}
