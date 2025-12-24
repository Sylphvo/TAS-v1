using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TAS.Helpers;

namespace TAS.Models
{
	// ========================================
	// RUBBER FARM (Nhà vườn)
	// ========================================
	public class RubberFarm
	{
		[Key]
		public long FarmId { get; set; }

		[Required]
		[MaxLength(50)]
		public string FarmCode { get; set; } = string.Empty;

		[Required]
		[MaxLength(50)]
		public string AgentCode { get; set; } = string.Empty;

		[Required]
		[MaxLength(255)]
		public string FarmerName { get; set; } = string.Empty;

		[MaxLength(20)]
		public string? FarmPhone { get; set; }

		[MaxLength(500)]
		public string? FarmAddress { get; set; }

		public bool IsActive { get; set; } = true;

		public DateTime RegisterDate { get; set; } = DateTime.UtcNow;

		[MaxLength(50)]
		public string? RegisterPerson { get; set; }

		public DateTime? UpdateDate { get; set; }

		[MaxLength(50)]
		public string? UpdatePerson { get; set; }

		// Navigation Properties
		[ForeignKey(nameof(AgentCode))]
		public virtual RubberAgent? Agent { get; set; }

        public string? Polygon { get; set; }
        public virtual ICollection<RubberIntake> Intakes { get; set; } = new List<RubberIntake>();
	}
}
