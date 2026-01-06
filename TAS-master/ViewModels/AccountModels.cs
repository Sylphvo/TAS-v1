using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Identity;
using System.Security.Cryptography;
using System.Text;
using TAS.DTOs;
using TAS.Models;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class AccountModels
	{
		private readonly ConnectDbHelper _dbHelper;
		private readonly ILogger<AccountModels> _logger;
		private readonly IConfiguration _configuration;
		private readonly IPasswordHasher<UserDto> _passwordHasher;

		public AccountModels(
			ConnectDbHelper dbHelper,
			ILogger<AccountModels> logger,
			IConfiguration configuration)
		{
			_dbHelper = dbHelper;
			_logger = logger;
			_configuration = configuration;
			_passwordHasher = new PasswordHasher<UserDto>();
		}

		// ========================================
		// Validate User (Login)
		// ========================================
		public async Task<LoginResult> ValidateUserAsync(string username, string password)
		{
			try
			{
				var sql = @"
                    SELECT 
                        UserId = Id, UserName, Email, PasswordHash,
                        FirstName, LastName, IsActive
                    FROM USER_ACCOUNT
                    WHERE (UserName = @Username OR Email = @Username)
                        AND IsActive = 1
                ";

				var user = await _dbHelper.QueryFirstOrDefaultAsync<UserDto>(sql, new { Username = username });

				if (user == null)
				{
					return new LoginResult
					{
						Success = false,
						Message = "Tên đăng nhập hoặc mật khẩu không đúng"
					};
				}

				// Verify password
				var verifyResult = _passwordHasher.VerifyHashedPassword(
					user,
					user.PasswordHash ?? "",
					password);

				if (verifyResult == PasswordVerificationResult.Failed)
				{
					return new LoginResult
					{
						Success = false,
						Message = "Tên đăng nhập hoặc mật khẩu không đúng"
					};
				}

				// Get roles
				var rolesSql = @"
                    SELECT r.Name
                    FROM USER_IN_ROLE ur
                    INNER JOIN USER_ROLE r ON r.Id = ur.RoleId
                    WHERE ur.UserId = @UserId
                ";
				var roles = await _dbHelper.QueryAsync<string>(rolesSql, new { UserId = user.UserId });

				return new LoginResult
				{
					Success = true,
					UserId = user.UserId,
					Username = user.UserName,
					Email = user.Email,
					FirstName = user.FirstName,
					LastName = user.LastName,
					FullName = $"{user.FirstName} {user.LastName}".Trim(),
					Roles = roles
				};
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ValidateUserAsync");
				return new LoginResult
				{
					Success = false,
					Message = "Đã xảy ra lỗi. Vui lòng thử lại."
				};
			}
		}

		// ========================================
		// Update Last Login
		// ========================================
		public async Task UpdateLastLoginAsync(Guid userId)
		{
			try
			{
				var sql = "UPDATE USER_ACCOUNT SET LogInUtc = SYSUTCDATETIME() WHERE Id = @UserId";
				await _dbHelper.ExecuteAsync(sql, new { UserId = userId });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in UpdateLastLoginAsync");
			}
		}

		// ========================================
		// Update Last Logout
		// ========================================
		public async Task UpdateLastLogoutAsync(Guid userId)
		{
			try
			{
				var sql = "UPDATE USER_ACCOUNT SET LogOutUtc = SYSUTCDATETIME() WHERE Id = @UserId";
				await _dbHelper.ExecuteAsync(sql, new { UserId = userId });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in UpdateLastLogoutAsync");
			}
		}

		// ========================================
		// Generate Password Reset Token
		// ========================================
		public async Task<ResetTokenResult> GeneratePasswordResetTokenAsync(string emailOrUsername)
		{
			try
			{
				var sql = @"
                    SELECT Id, UserName, Email, IsActive
                    FROM USER_ACCOUNT
                    WHERE (Email = @EmailOrUsername OR UserName = @EmailOrUsername)
                        AND IsActive = 1
                ";

				var user = await _dbHelper.QueryFirstOrDefaultAsync<UserDto>(
					sql,
					new { EmailOrUsername = emailOrUsername });

				if (user == null || string.IsNullOrEmpty(user.Email))
				{
					return new ResetTokenResult { Success = false };
				}

				// Generate token
				var token = GenerateSecureToken();
				var expiry = DateTime.UtcNow.AddHours(1); // Token valid for 1 hour

				// Store token (trong bảng riêng hoặc cache)
				// Ở đây tôi dùng bảng tạm, bạn có thể dùng cache
				var insertSql = @"
                    -- Xóa token cũ
                    DELETE FROM USER_TOKEN 
                    WHERE UserId = @UserId 
                        AND Name = 'PasswordReset';

                    -- Insert token mới
                    INSERT INTO USER_TOKEN (UserId, LoginProvider, Name, Value)
                    VALUES (@UserId, 'PasswordReset', 'PasswordReset', @Token);
                ";

				await _dbHelper.ExecuteAsync(insertSql, new
				{
					UserId = user.Id,
					Token = $"{token}|{expiry:yyyy-MM-dd HH:mm:ss}"
				});

				return new ResetTokenResult
				{
					Success = true,
					Email = user.Email,
					ResetToken = token
				};
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GeneratePasswordResetTokenAsync");
				return new ResetTokenResult { Success = false };
			}
		}

		// ========================================
		// Verify Reset Token
		// ========================================
		public async Task<bool> VerifyResetTokenAsync(string email, string token)
		{
			try
			{
				var sql = @"
                    SELECT ut.Value
                    FROM USER_ACCOUNT u
                    INNER JOIN USER_TOKEN ut ON ut.UserId = u.Id
                    WHERE u.Email = @Email
                        AND ut.Name = 'PasswordReset'
                        AND u.IsActive = 1
                ";

				var tokenData = await _dbHelper.QueryFirstOrDefaultAsync<string>(sql, new { Email = email });

				if (string.IsNullOrEmpty(tokenData))
					return false;

				var parts = tokenData.Split('|');
				if (parts.Length != 2)
					return false;

				var storedToken = parts[0];
				var expiry = DateTime.Parse(parts[1]);

				// Verify token and expiry
				return storedToken == token && expiry > DateTime.UtcNow;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in VerifyResetTokenAsync");
				return false;
			}
		}

		// ========================================
		// Reset Password
		// ========================================
		public async Task<OperationResult> ResetPasswordAsync(string email, string token, string newPassword)
		{
			try
			{
				// Verify token
				var isValid = await VerifyResetTokenAsync(email, token);
				if (!isValid)
				{
					return new OperationResult
					{
						Success = false,
						Message = "Link đã hết hạn hoặc không hợp lệ"
					};
				}

				// Get user
				var getUserSql = "SELECT UserId FROM USER_ACCOUNT WHERE Email = @Email AND IsActive = 1";
				var objectUser = await _dbHelper.QueryFirstOrDefaultAsync<Guid>(getUserSql, new { Email = email });

				if (objectUser == null)
				{
					return new OperationResult
					{
						Success = false,
						Message = "Không tìm thấy tài khoản"
					};
				}
				var userIdentity = new UserDto { UserId = objectUser };
				// Hash new password
				var passwordHash = _passwordHasher.HashPassword(userIdentity, newPassword);

				// Update password
				var updateSql = @"
                    UPDATE USER_ACCOUNT 
                    SET PasswordHash = @PasswordHash,
                        SecurityStamp = @SecurityStamp,
                        UpdatedAtUtc = SYSUTCDATETIME()
                    WHERE Id = @UserId;

                    -- Xóa token
                    DELETE FROM USER_TOKEN 
                    WHERE UserId = @UserId 
                        AND Name = 'PasswordReset';
                ";

				await _dbHelper.ExecuteAsync(updateSql, new
				{
					UserId = objectUser,
					PasswordHash = passwordHash,
					SecurityStamp = Guid.NewGuid().ToString()
				});

				return new OperationResult { Success = true };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ResetPasswordAsync");
				return new OperationResult
				{
					Success = false,
					Message = "Đã xảy ra lỗi. Vui lòng thử lại."
				};
			}
		}

		// ========================================
		// Change Password (cho user đã login)
		// ========================================
		public async Task<OperationResult> ChangePasswordAsync(
			Guid userId,
			string currentPassword,
			string newPassword)
		{
			try
			{
				// Get current password hash
				var sql = "SELECT PasswordHash FROM USER_ACCOUNT WHERE Id = @UserId AND IsActive = 1";
				var currentHash = await _dbHelper.QueryFirstOrDefaultAsync<string>(sql, new { UserId = userId });

				if (string.IsNullOrEmpty(currentHash))
				{
					return new OperationResult
					{
						Success = false,
						Message = "Không tìm thấy tài khoản"
					};
				}

				// Verify current password
				var userIdentity = new UserDto { UserId = userId };

				var verifyResult = _passwordHasher.VerifyHashedPassword(
					userIdentity,
					currentHash,
					currentPassword);

				if (verifyResult == PasswordVerificationResult.Failed)
				{
					return new OperationResult
					{
						Success = false,
						Message = "Mật khẩu hiện tại không đúng"
					};
				}

				// Hash new password
				var newHash = _passwordHasher.HashPassword(userIdentity, newPassword);

				// Update
				var updateSql = @"
                    UPDATE USER_ACCOUNT 
                    SET PasswordHash = @PasswordHash,
                        SecurityStamp = @SecurityStamp,
                        UpdatedAtUtc = SYSUTCDATETIME()
                    WHERE Id = @UserId
                ";

				await _dbHelper.ExecuteAsync(updateSql, new
				{
					UserId = userId,
					PasswordHash = newHash,
					SecurityStamp = Guid.NewGuid().ToString()
				});

				return new OperationResult { Success = true };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ChangePasswordAsync");
				return new OperationResult
				{
					Success = false,
					Message = "Đã xảy ra lỗi. Vui lòng thử lại."
				};
			}
		}

		// ========================================
		// Send Password Reset Email
		// ========================================
		public async Task SendPasswordResetEmailAsync(string email, string resetLink)
		{
			try
			{
				// TODO: Implement actual email sending
				// For now, just log to console
				_logger.LogInformation($@"
					========================================
					PASSWORD RESET EMAIL
					========================================
					To: {email}
					Subject: Đặt lại mật khẩu - TAS Admin

					Xin chào,

					Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TAS Admin.

					Vui lòng click vào link bên dưới để đặt lại mật khẩu:
					{resetLink}

					Link này sẽ hết hạn sau 1 giờ.

					Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

					Trân trọng,
					TAS Admin Team
					========================================
				");

				// Nếu có SMTP configuration, gửi email thật
				// await _emailService.SendEmailAsync(email, subject, body);

				await Task.CompletedTask;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in SendPasswordResetEmailAsync");
			}
		}

		// ========================================
		// Helper: Generate Secure Token
		// ========================================
		private string GenerateSecureToken()
		{
			var randomBytes = new byte[32];
			using (var rng = RandomNumberGenerator.Create())
			{
				rng.GetBytes(randomBytes);
			}
			return Convert.ToBase64String(randomBytes)
				.Replace("+", "-")
				.Replace("/", "_")
				.Replace("=", "");
		}
	}	
}
