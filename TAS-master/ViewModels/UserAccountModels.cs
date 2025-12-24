using TAS.Helpers;
using TAS.Models;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class UserAccountModels
	{
		private readonly ICurrentUser _userManage;
		private readonly ILogger<UserAccountModels> _logger;
		ConnectDbHelper dbHelper = new ConnectDbHelper();

		public UserAccountModels(ICurrentUser userManage, ILogger<UserAccountModels> logger)
		{
			_userManage = userManage;
			_logger = logger;
		}

		// Model
		public async Task<List<UserAccount>> GetUserAccountAsync()
		{
			var sql = @"
				SELECT 
					rowNo = ROW_NUMBER() OVER(ORDER BY Id ASC),
					Id,
					FirstName,
					LastName,
					UserName,
					NormalizedUserName,
					Email,
					NormalizedEmail,
					EmailConfirmed,
					PhoneNumber,
					PhoneNumberConfirmed,
					TwoFactorEnabled,
					LockoutEnd,
					LockoutEnabled,
					AccessFailedCount,
					IsActive,
					UpdatedBy = ISNULL(UpdatedBy, CreatedBy),
					UpdatedAtUtc = CONVERT(VARCHAR, ISNULL(UpdatedAtUtc, CreatedAtUtc), 111) + ' ' + CONVERT(VARCHAR(5), ISNULL(UpdatedAtUtc, CreatedAtUtc), 108)
				FROM dbo.USER_ACCOUNT
				";
			return await dbHelper.QueryAsync<UserAccount>(sql);
		}

		public int AddOrUpdateUserAccount(UserAccount userAccount)
		{
			try
			{
				if (userAccount == null)
				{
					throw new ArgumentNullException(nameof(userAccount), "Input data cannot be null.");
				}

				var sql = @"
					IF EXISTS (SELECT TOP 1 Id FROM dbo.USER_ACCOUNT WHERE Id = @Id)
					BEGIN
						UPDATE dbo.USER_ACCOUNT SET
							FirstName = @FirstName,
							LastName = @LastName,
							UserName = @UserName,
							NormalizedUserName = @NormalizedUserName,
							Email = @Email,
							NormalizedEmail = @NormalizedEmail,
							EmailConfirmed = @EmailConfirmed,
							PhoneNumber = @PhoneNumber,
							PhoneNumberConfirmed = @PhoneNumberConfirmed,
							TwoFactorEnabled = @TwoFactorEnabled,
							LockoutEnabled = @LockoutEnabled,
							IsActive = @IsActive,
							UpdatedAtUtc = GETDATE(),
							UpdatedBy = @UpdatedBy
						WHERE Id = @Id
						SELECT 0;
					END
					ELSE
					BEGIN
						INSERT INTO dbo.USER_ACCOUNT
						(FirstName, LastName, UserName, NormalizedUserName, Email, NormalizedEmail,
							EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp,
							PhoneNumber, PhoneNumberConfirmed, TwoFactorEnabled, LockoutEnabled,
							AccessFailedCount, IsActive, CreatedAtUtc, CreatedBy)
						VALUES
						(@FirstName, @LastName, @UserName, @NormalizedUserName, @Email, @NormalizedEmail,
							@EmailConfirmed, @PasswordHash, NEWID(), NEWID(),
							@PhoneNumber, @PhoneNumberConfirmed, @TwoFactorEnabled, @LockoutEnabled,
							0, @IsActive, GETDATE(), @UpdatedBy)
						SELECT SCOPE_IDENTITY() AS NewId;
					END";

				var lstResult = dbHelper.Execute(sql, new
				{
					Id = userAccount.Id,
					FirstName = userAccount.FirstName,
					LastName = userAccount.LastName,
					UserName = userAccount.UserName,
					NormalizedUserName = userAccount.UserName?.ToUpper(),
					Email = userAccount.Email,
					NormalizedEmail = userAccount.Email?.ToUpper(),
					EmailConfirmed = userAccount.EmailConfirmed,
					PasswordHash = userAccount.PasswordHash ?? HashPassword(userAccount.UserName ?? ""), // Default password
					PhoneNumber = userAccount.PhoneNumber,
					PhoneNumberConfirmed = userAccount.PhoneNumberConfirmed,
					TwoFactorEnabled = userAccount.TwoFactorEnabled,
					LockoutEnabled = userAccount.LockoutEnabled,
					IsActive = userAccount.IsActive,
					UpdatedBy = _userManage.Name
				});

				return lstResult;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in AddOrUpdateUserAccount method.");
				return 0;
			}
		}

		public int DeleteUserAccount(int userId)
		{
			try
			{
				string sql = @"
					DELETE FROM dbo.USER_ACCOUNT WHERE Id = @UserId
				";
				dbHelper.Execute(sql, new { UserId = userId });
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in DeleteUserAccount method.");
				return 0;
			}
		}

		public int ApproveDataUserAccount(int userId, bool status)
		{
			try
			{
				string sql = @"
					UPDATE dbo.USER_ACCOUNT 
					SET IsActive = @Status,
						UpdatedAtUtc = GETDATE(),
						UpdatedBy = @UpdatedBy
					WHERE Id = @UserId
				";
				dbHelper.Execute(sql, new
				{
					UserId = userId,
					Status = status,
					UpdatedBy = _userManage.Name
				});
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ApproveDataUserAccount method.");
				return 0;
			}
		}

		public int ResetPassword(int userId, string newPassword)
		{
			try
			{
				string sql = @"
					UPDATE dbo.USER_ACCOUNT 
					SET PasswordHash = @PasswordHash,
						UpdatedAtUtc = GETDATE(),
						UpdatedBy = @UpdatedBy,
						SecurityStamp = NEWID()
					WHERE Id = @UserId
				";
				dbHelper.Execute(sql, new
				{
					UserId = userId,
					PasswordHash = HashPassword(newPassword),
					UpdatedBy = _userManage.Name
				});
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ResetPassword method.");
				return 0;
			}
		}

		// Helper method for password hashing (you should use proper hashing in production)
		private string HashPassword(string password)
		{
			// This is a placeholder - use proper password hashing like BCrypt or ASP.NET Core Identity's hasher
			using (var sha256 = System.Security.Cryptography.SHA256.Create())
			{
				var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
				return Convert.ToBase64String(hashedBytes);
			}
		}
	}
}
