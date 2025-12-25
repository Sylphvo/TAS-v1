namespace TAS.DTOs
{
	public class UserAccountDto
	{
		public int Id { get; set; }
		public int rowNo { get; set; }
		public string? FirstName { get; set; }
		public string? LastName { get; set; }
		public bool IsActive { get; set; }
		public DateTime? CreatedAtUtc { get; set; }
		public string? CreatedBy { get; set; }
		public DateTime? UpdatedAtUtc { get; set; }
		public string? UpdatedBy { get; set; }
		public DateTime? LoginUtc { get; set; }
		public DateTime? LogOutUtc { get; set; }
		public string? UserName { get; set; }
		public string? Password { get; set; }
		public string? NormalizedUserName { get; set; }
		public string? Email { get; set; }
		public string? NormalizedEmail { get; set; }
		public bool EmailConfirmed { get; set; }
		public bool RememberMe { get; set; }
		public string? PasswordHash { get; set; }
		public string? SecurityStamp { get; set; }
		public string? ConcurrencyStamp { get; set; }
		public string? PhoneNumber { get; set; }
		public bool PhoneNumberConfirmed { get; set; }
		public bool TwoFactorEnabled { get; set; }
		public DateTimeOffset? LockoutEnd { get; set; }
		public bool LockoutEnabled { get; set; }
		public int AccessFailedCount { get; set; }
	}
}
