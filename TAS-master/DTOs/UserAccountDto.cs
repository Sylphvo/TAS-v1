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
	// ========================================
	// REQUEST/RESPONSE MODELS
	// ========================================
	public class LoginRequest
	{
		public bool Success { get; set; }
		public string Message { get; set; } = string.Empty;
		public Guid UserId { get; set; }
		public string? Email { get; set; }
		public string? FirstName { get; set; }
		public string? LastName { get; set; }
		public string? FullName { get; set; }
		public List<string>? Roles { get; set; }
		public string Username { get; set; } = string.Empty;
		public string Password { get; set; } = string.Empty;
		public bool RememberMe { get; set; }
	}

	public class ForgotPasswordRequest
	{
		public string EmailOrUsername { get; set; } = string.Empty;
	}

	public class ResetPasswordRequest
	{
		public string Email { get; set; } = string.Empty;
		public string Token { get; set; } = string.Empty;
		public string NewPassword { get; set; } = string.Empty;
		public string ConfirmPassword { get; set; } = string.Empty;
	}

	public class ChangePasswordRequest
	{
		public string CurrentPassword { get; set; } = string.Empty;
		public string NewPassword { get; set; } = string.Empty;
		public string ConfirmPassword { get; set; } = string.Empty;
	}

	public class LoginResult
	{
		public bool Success { get; set; }
		public string Message { get; set; } = string.Empty;
		public Guid UserId { get; set; }
		public string? Username { get; set; }
		public string? Email { get; set; }
		public string? FirstName { get; set; }
		public string? LastName { get; set; }
		public string? FullName { get; set; }
		public List<string>? Roles { get; set; }
	}

	public class ResetTokenResult
	{
		public bool Success { get; set; }
		public string? Email { get; set; }
		public string? ResetToken { get; set; }
	}

	public class OperationResult
	{
		public bool Success { get; set; }
		public string Message { get; set; } = string.Empty;
	}

	public class UserDto
	{
		public Guid Id { get; set; }
		public string? UserName { get; set; }
		public string? Email { get; set; }
		public string? PasswordHash { get; set; }
		public string? FirstName { get; set; }
		public string? LastName { get; set; }
		public bool IsActive { get; set; }
	}
}
