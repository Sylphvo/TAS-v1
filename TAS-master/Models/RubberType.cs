using System.ComponentModel.DataAnnotations;

namespace TAS.Models
{
	// ========================================
	// RUBBER TYPE (Loại cao su)
	// ========================================
	public class RubberType
	{
		[Key]
		public long TypeId { get; set; }

		[Required]
		[MaxLength(50)]
		public string TypeCode { get; set; } = string.Empty;

		[Required]
		[MaxLength(255)]
		public string TypeName { get; set; } = string.Empty;

		public DateTime? UpdateDate { get; set; }

		[MaxLength(50)]
		public string? UpdatePerson { get; set; }
	}
}
