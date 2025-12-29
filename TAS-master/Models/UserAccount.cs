using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TAS.Models
{
	public class UserAccountIdentity : IdentityUser<Guid>
	{
		[MaxLength(100)]
		public string? FirstName { get; set; }

		[MaxLength(100)]
		public string? LastName { get; set; }

		public bool IsActive { get; set; } = true;

		public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

		[MaxLength(50)]
		public string? CreatedBy { get; set; }

		public DateTime? UpdatedAtUtc { get; set; }

		[MaxLength(50)]
		public string? UpdatedBy { get; set; }

		public DateTime? LogInUtc { get; set; }

		public DateTime? LogOutUtc { get; set; }

		// Computed Property
		public string FullName => $"{FirstName} {LastName}".Trim();
	}

}
