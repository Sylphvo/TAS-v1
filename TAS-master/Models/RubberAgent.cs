using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TAS.Models;

namespace TAS.Helpers
{

	// ========================================
	// RUBBER AGENT (Đại lý)
	// ========================================
	public class RubberAgent
	{
		[Key]
		public long AgentId { get; set; }

		[Required]
		[MaxLength(50)]
		public string AgentCode { get; set; } = string.Empty;

		[Required]
		[MaxLength(255)]
		public string AgentName { get; set; } = string.Empty;

		[MaxLength(255)]
		public string? OwnerName { get; set; }

		[MaxLength(20)]
		public string? AgentPhone { get; set; }

		[MaxLength(500)]
		public string? AgentAddress { get; set; }

		public bool IsActive { get; set; } = true;

		public DateTime RegisterDate { get; set; } = DateTime.UtcNow;

		[MaxLength(50)]
		public string? RegisterPerson { get; set; }

		public DateTime? UpdateDate { get; set; }

		[MaxLength(50)]
		public string? UpdatePerson { get; set; }

		// Navigation Properties
		public virtual ICollection<RubberFarm> Farms { get; set; } = new List<RubberFarm>();
		public virtual ICollection<RubberPond> Ponds { get; set; } = new List<RubberPond>();
		public virtual ICollection<RubberOrder> Orders { get; set; } = new List<RubberOrder>();
	}
}
