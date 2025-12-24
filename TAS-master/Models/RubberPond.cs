using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TAS.Models
{
	[Table("RubberPond")]
	public class RubberPondDb
	{
		[Key]
		public long PondId { get; set; }

		[StringLength(50)]
		public string? PondCode { get; set; }   // mã hồ/bồn

		[StringLength(50)]
		public string? AgentCode { get; set; }  // mã đại lý sở hữu hồ

		[StringLength(120)]
		public string? PondName { get; set; }   // tên hồ/bồn

		[StringLength(200)]
		public string? Location { get; set; }   // vị trí

		[Column(TypeName = "decimal(12,3)")]
		public decimal? CapacityKg { get; set; } // sức chứa

		[Column(TypeName = "decimal(12,3)")]
		public decimal? CurrentNetKg { get; set; } // tồn hiện tại

		// 1=active, 2=locked, 3=cleaning, 0=archived (tự quy ước)
		public int? Status { get; set; }

		public DateTime? LastCleanedAt { get; set; }

		[StringLength(500)]
		public string? Note { get; set; }

		public DateTime? RegisterDate { get; set; }
		[StringLength(50)]
		public string? RegisterPerson { get; set; }

		public DateTime? UpdateDate { get; set; }
		[StringLength(50)]
		public string? UpdatePerson { get; set; }
	}
	[Table("RubberPondIntake")]
	public class RubberPondIntakeDb
	{
		public long PondId { get; set; }
		public long IntakeId { get; set; } // FK -> RubberIntakeDb.IntakeId

		[Column(TypeName = "decimal(12,3)")]
		public decimal? PouredKg { get; set; } // đổ vào hồ bao nhiêu kg

		public DateTime? PouredAt { get; set; }
	}
}
