using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TAS.Models
{
	[Table("UserAccount")]
	public class UserAccount
	{
		[Key]
		public Guid UserId { get; set; }

		[MaxLength(100)]
		public string FirstName { get; set; } = "";

		[MaxLength(100)]
		public string LastName { get; set; } = "";

		[Required, MaxLength(100)]
		public string UserName { get; set; } = "";

		[Required, MaxLength(256), EmailAddress]
		public string Email { get; set; } = default!;

		[NotMapped] // không lưu plaintext
		public string Password { get; set; } = default!;

		[Required] // lưu hash
		public byte[] PasswordHash { get; set; } = default!;

		// lưu hash dưới dạng chuỗi để dễ hiển thị
		public string PasswordStrHash { get; set; } = "";

		[NotMapped] // không lưu confirm
		public string ConfirmPassword { get; set; } = "";

		public bool AcceptTerms { get; set; } = true;
		public bool IsActive { get; set; } = true;
		public bool TwoFactorEnabled { get; set; }
		public bool RememberMe { get; set; }

		public DateTime? LogIn { get; set; }
		public DateTime? LogOut { get; set; }
	}

	public class UserAccountIdentity : IdentityUser<Guid>
	{
		// Extra fields
		[StringLength(128)]
		public string? FirstName { get; set; }

		[StringLength(128)]
		public string? LastName { get; set; }

		public bool IsActive { get; set; } = true;

		public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
		public string? CreatedBy { get; set; }
		public DateTime? UpdatedAtUtc { get; set; }
		public string? UpdatedBy { get; set; }

		public DateTime? LogInUtc { get; set; }
		public DateTime? LogOutUtc { get; set; }

		// Tiện cho UI, không lưu DB
		[NotMapped]
		public string FullName => $"{FirstName} {LastName}".Trim();
	}
	public class UserAccountRequest
	{
		public Guid UserId { get; set; } // identity
		public string FirstName { get; set; } = "";//Tên
		public string LastName { get; set; } = "";//Họ
		public string UserName { get; set; } = "";//Tên đăng nhập
		public string Email { get; set; } = default!;//Email
		public string Password { get; set; } = default!;//Mật khẩu
		public byte[] PasswordHash { get; set; } = default!;//Mật khẩu đã băm
		public string ConfirmPassword { get; set; } = "";//Xác nhận mật khẩu
		public bool AcceptTerms { get; set; } = true;//Chấp nhận điều khoản
		public bool IsActive { get; set; } = true;//Trạng thái kích hoạt
		public bool TwoFactorEnabled { get; set; }//Xác thực hai yếu tố
		public bool RememberMe { get; set; }//Ghi nhớ đăng nhập
		public DateTime? LogIn { get; set; }//Thời gian đăng nhập
		public DateTime? LogOut { get; set; }//Thời gian đăng xuất
											 // Avatar
	}
	public class UserAccountRep
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
		public string? NormalizedUserName { get; set; }
		public string? Email { get; set; }
		public string? NormalizedEmail { get; set; }
		public bool EmailConfirmed { get; set; }
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
