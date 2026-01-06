using System.ComponentModel.DataAnnotations;

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

	public class UserVerifyDto
	{
		public int Id { get; set; }
		public Guid UserId { get; set; }
		public string? UserName { get; set; }
		public string? Email { get; set; }
		public string? PasswordHash { get; set; }
		public string? FirstName { get; set; }
		public string? LastName { get; set; }
		public bool IsActive { get; set; }

	}
	// ========================================
	// USER DTO - Display/Response
	// ========================================
	public class UserDto
	{
		public int Id { get; set; }		
		public Guid UserId { get; set; }		
		public string UserName { get; set; } = "";
		public string Email { get; set; } = "";
		public string? FirstName { get; set; }
		public string? LastName { get; set; }
		public string? FullName => $"{FirstName} {LastName}".Trim();
		public string? PhoneNumber { get; set; }
		public string? PasswordHash { get; set; }
		public bool IsActive { get; set; } = true;
		public bool EmailConfirmed { get; set; }
		public bool PhoneNumberConfirmed { get; set; }
		public bool TwoFactorEnabled { get; set; }
		public bool LockoutEnabled { get; set; }
		public DateTimeOffset? LockoutEnd { get; set; }
		public int AccessFailedCount { get; set; }

		// Audit fields
		public DateTime? CreatedAtUtc { get; set; }
		public string? CreatedBy { get; set; }
		public DateTime? UpdatedAtUtc { get; set; }
		public string? UpdatedBy { get; set; }
		public DateTime? LoginUtc { get; set; }
		public DateTime? LogOutUtc { get; set; }

		// Computed
		public bool IsLocked => LockoutEnd.HasValue && LockoutEnd.Value > DateTimeOffset.UtcNow;
		public string Status => IsActive ? (IsLocked ? "Locked" : "Active") : "Inactive";
	}

	// ========================================
	// USER SEARCH DTO - Filter Parameters
	// ========================================
	public class UserSearchDto
	{
		public string? SearchKeyword { get; set; }
		public string? UserName { get; set; }
		public string? Email { get; set; }
		public bool? IsActive { get; set; }
		public bool? IsLocked { get; set; }
		public bool? EmailConfirmed { get; set; }
		public DateTime? FromDate { get; set; }
		public DateTime? ToDate { get; set; }

		// Pagination
		public int PageNumber { get; set; } = 1;
		public int PageSize { get; set; } = 100;

		// Sorting
		public string SortColumn { get; set; } = "CreatedAtUtc";
		public string SortOrder { get; set; } = "desc";
	}

	// ========================================
	// CREATE USER DTO - For POST
	// ========================================
	public class CreateUserDto
	{
		[Required(ErrorMessage = "Tên đăng nhập không được để trống")]
		[StringLength(100, ErrorMessage = "Tên đăng nhập không được vượt quá 100 ký tự")]
		public string UserName { get; set; } = "";

		[Required(ErrorMessage = "Email không được để trống")]
		[EmailAddress(ErrorMessage = "Email không hợp lệ")]
		[StringLength(256, ErrorMessage = "Email không được vượt quá 256 ký tự")]
		public string Email { get; set; } = "";

		[Required(ErrorMessage = "Mật khẩu không được để trống")]
		[StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6-100 ký tự")]
		public string Password { get; set; } = "";

		[Required(ErrorMessage = "Xác nhận mật khẩu không được để trống")]
		[Compare("Password", ErrorMessage = "Mật khẩu xác nhận không khớp")]
		public string ConfirmPassword { get; set; } = "";

		[StringLength(100, ErrorMessage = "Họ không được vượt quá 100 ký tự")]
		public string? FirstName { get; set; }

		[StringLength(100, ErrorMessage = "Tên không được vượt quá 100 ký tự")]
		public string? LastName { get; set; }

		[Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
		[StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
		public string? PhoneNumber { get; set; }

		public bool IsActive { get; set; } = true;
		public bool EmailConfirmed { get; set; } = false;
	}

	// ========================================
	// UPDATE USER DTO - For PUT
	// ========================================
	public class UpdateUserDto
	{
		[Required]
		public int Id { get; set; }

		[Required(ErrorMessage = "Tên đăng nhập không được để trống")]
		[StringLength(100, ErrorMessage = "Tên đăng nhập không được vượt quá 100 ký tự")]
		public string UserName { get; set; } = "";

		[Required(ErrorMessage = "Email không được để trống")]
		[EmailAddress(ErrorMessage = "Email không hợp lệ")]
		[StringLength(256, ErrorMessage = "Email không được vượt quá 256 ký tự")]
		public string Email { get; set; } = "";

		[StringLength(100, ErrorMessage = "Họ không được vượt quá 100 ký tự")]
		public string? FirstName { get; set; }

		[StringLength(100, ErrorMessage = "Tên không được vượt quá 100 ký tự")]
		public string? LastName { get; set; }

		[Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
		[StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
		public string? PhoneNumber { get; set; }

		public bool IsActive { get; set; } = true;
		public bool EmailConfirmed { get; set; }
		public bool PhoneNumberConfirmed { get; set; }
		public bool TwoFactorEnabled { get; set; }
	}

	// ========================================
	// CHANGE PASSWORD DTO
	// ========================================
	public class ChangeUserPasswordDto
	{
		[Required]
		public int UserId { get; set; }

		[Required(ErrorMessage = "Mật khẩu mới không được để trống")]
		[StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6-100 ký tự")]
		public string NewPassword { get; set; } = "";

		[Required(ErrorMessage = "Xác nhận mật khẩu không được để trống")]
		[Compare("NewPassword", ErrorMessage = "Mật khẩu xác nhận không khớp")]
		public string ConfirmPassword { get; set; } = "";
	}

	// ========================================
	// LOCK/UNLOCK USER DTO
	// ========================================
	public class LockUserDto
	{
		[Required]
		public int UserId { get; set; }

		[Required]
		public bool IsLocked { get; set; }

		public int? LockoutMinutes { get; set; } // null = permanent lock
	}

	// ========================================
	// USER RESPONSE - Generic API Response
	// ========================================
	public class UserResponse<T>
	{
		public bool Success { get; set; }
		public string Message { get; set; } = "";
		public T? Data { get; set; }
		public int TotalRecords { get; set; }
	}

	// ========================================
	// BULK DELETE DTO
	// ========================================
	public class BulkDeleteUserDto
	{
		[Required]
		public List<int> UserIds { get; set; } = new();
	}

	// ========================================
	// USER STATISTICS DTO
	// ========================================
	public class UserStatisticsDto
	{
		public int TotalUsers { get; set; }
		public int ActiveUsers { get; set; }
		public int InactiveUsers { get; set; }
		public int LockedUsers { get; set; }
		public int EmailConfirmedUsers { get; set; }
		public int TwoFactorEnabledUsers { get; set; }
		public int NewUsersThisMonth { get; set; }
		public int OnlineUsers { get; set; } // Logged in last 15 minutes
	}

	// ========================================
	// USER LOGIN HISTORY DTO
	// ========================================
	public class UserLoginHistoryDto
	{
		public int UserId { get; set; }
		public string UserName { get; set; } = "";
		public DateTime? LoginUtc { get; set; }
		public DateTime? LogOutUtc { get; set; }
		public string? IpAddress { get; set; }
		public string? UserAgent { get; set; }
	}
	/// <summary>
	/// Table result with pagination
	/// </summary>
	public class UserTableResult
	{
		public List<UserDto> Data { get; set; } = new();
		public int TotalRecords { get; set; }
		public int PageNumber { get; set; }
		public int PageSize { get; set; }
		public int TotalPages { get; set; }
	}
}
