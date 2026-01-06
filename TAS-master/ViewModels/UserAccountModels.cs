using Dapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using System.Data;
using TAS.DTOs;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	// ========================================
	// USER TABLE MODELS - SQL QUERIES
	// ========================================
	public class UserAccountModels
	{
		private readonly ConnectDbHelper _dbHelper;
		private readonly IPasswordHasher<object> _passwordHasher;

		public UserAccountModels(ConnectDbHelper connectDbHelper)
		{
			_dbHelper = connectDbHelper;
			_passwordHasher = new PasswordHasher<object>();
		}

		// ========================================
		// GET TABLE DATA - With Filters & Pagination
		// ========================================
		public async Task<UserTableResult> GetTableDataAsync(UserSearchDto searchDto)
		{
			

			var whereClauses = new List<string> { "1=1" };
			var parameters = new DynamicParameters();

			// Build WHERE clauses
			if (!string.IsNullOrWhiteSpace(searchDto.SearchKeyword))
			{
				whereClauses.Add("(UserName LIKE @SearchKeyword OR Email LIKE @SearchKeyword OR FirstName LIKE @SearchKeyword OR LastName LIKE @SearchKeyword)");
				parameters.Add("@SearchKeyword", $"%{searchDto.SearchKeyword}%");
			}

			if (!string.IsNullOrWhiteSpace(searchDto.UserName))
			{
				whereClauses.Add("UserName LIKE @UserName");
				parameters.Add("@UserName", $"%{searchDto.UserName}%");
			}

			if (!string.IsNullOrWhiteSpace(searchDto.Email))
			{
				whereClauses.Add("Email LIKE @Email");
				parameters.Add("@Email", $"%{searchDto.Email}%");
			}

			//if (searchDto.IsActive.HasValue)
			//{
			//	whereClauses.Add("IsActive = @IsActive");
			//	parameters.Add("@IsActive", searchDto.IsActive.Value);
			//}

			if (searchDto.IsLocked.HasValue)
			{
				if (searchDto.IsLocked.Value)
				{
					whereClauses.Add("LockoutEnd IS NOT NULL AND LockoutEnd > GETUTCDATE()");
				}
				else
				{
					whereClauses.Add("(LockoutEnd IS NULL OR LockoutEnd <= GETUTCDATE())");
				}
			}

			if (searchDto.EmailConfirmed.HasValue)
			{
				whereClauses.Add("EmailConfirmed = @EmailConfirmed");
				parameters.Add("@EmailConfirmed", searchDto.EmailConfirmed.Value);
			}

			//if (searchDto.FromDate.HasValue)
			//{
			//	whereClauses.Add("CreatedAtUtc >= @FromDate");
			//	parameters.Add("@FromDate", searchDto.FromDate.Value);
			//}

			//if (searchDto.ToDate.HasValue)
			//{
			//	whereClauses.Add("CreatedAtUtc <= @ToDate");
			//	parameters.Add("@ToDate", searchDto.ToDate.Value.AddDays(1).AddSeconds(-1));
			//}

			var whereClause = string.Join(" AND ", whereClauses);

			// Count total

			// Get data with pagination
			var validSortColumns = new[] { "Id", "UserName", "Email", "FirstName", "LastName", "IsActive", "CreatedAtUtc", "LoginUtc" };
			var sortColumn = validSortColumns.Contains(searchDto.SortColumn) ? searchDto.SortColumn : "CreatedAtUtc";
			var sortOrder = searchDto.SortOrder.ToLower() == "asc" ? "ASC" : "DESC";

			var offset = (searchDto.PageNumber - 1) * searchDto.PageSize;

			var query = $@"
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY Id DESC) AS Id,
					UserId = Id,
                    UserName,
                    Email,
                    FirstName,
                    LastName,
                    PhoneNumber,
                    IsActive,
                    EmailConfirmed,
                    PhoneNumberConfirmed,
                    TwoFactorEnabled,
                    LockoutEnabled,
                    LockoutEnd,
                    AccessFailedCount,
                    CreatedAtUtc,
                    CreatedBy,
                    UpdatedAtUtc,
                    UpdatedBy,
                    LoginUtc,
                    LogOutUtc
                FROM USER_ACCOUNT
                WHERE {whereClause}
                ORDER BY {sortColumn} {sortOrder}
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY";

			parameters.Add("@Offset", offset);
			parameters.Add("@PageSize", searchDto.PageSize);

			var users = await _dbHelper.QueryAsync<UserDto>(query, parameters);

			return new UserTableResult
			{
				Data = users.ToList(),
				TotalRecords = users.Count(),
				PageNumber = searchDto.PageNumber,
				PageSize = searchDto.PageSize,
				TotalPages = (int)Math.Ceiling(users.Count() / (double)searchDto.PageSize)
			};
		}

		// ========================================
		// GET USER BY ID
		// ========================================
		public async Task<UserDto?> GetUserByIdAsync(int userId)
		{
			

			var query = @"
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY Id DESC) AS Id,
					UserId = Id,
                    UserName,
                    Email,
                    FirstName,
                    LastName,
                    PhoneNumber,
                    IsActive,
                    EmailConfirmed,
                    PhoneNumberConfirmed,
                    TwoFactorEnabled,
                    LockoutEnabled,
                    LockoutEnd,
                    AccessFailedCount,
                    CreatedAtUtc,
                    CreatedBy,
                    UpdatedAtUtc,
                    UpdatedBy,
                    LoginUtc,
                    LogOutUtc
                FROM USER_ACCOUNT
                WHERE Id = @UserId";

			return await _dbHelper.QueryFirstOrDefaultAsync<UserDto>(query, new { UserId = userId });
		}

		// ========================================
		// GET USER BY USERNAME
		// ========================================
		public async Task<UserDto?> GetUserByUsernameAsync(string userName)
		{
			

			var query = @"
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY Id DESC) AS Id,
					UserId = Id,
                    UserName,
                    Email,
                    FirstName,
                    LastName,
                    PhoneNumber,
                    IsActive,
                    EmailConfirmed,
                    PhoneNumberConfirmed,
                    TwoFactorEnabled,
                    LockoutEnabled,
                    LockoutEnd,
                    AccessFailedCount,
                    CreatedAtUtc,
                    CreatedBy,
                    UpdatedAtUtc,
                    UpdatedBy,
                    LoginUtc,
                    LogOutUtc
                FROM USER_ACCOUNT
                WHERE UserName = @UserName";

			return await _dbHelper.QueryFirstOrDefaultAsync<UserDto>(query, new { UserName = userName });
		}

		// ========================================
		// GET USER BY EMAIL
		// ========================================
		public async Task<UserDto?> GetUserByEmailAsync(string email)
		{
			

			var query = @"
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY Id DESC) AS Id,
					UserId = Id,
                    UserName,
                    Email,
                    FirstName,
                    LastName,
                    PhoneNumber,
                    IsActive,
                    EmailConfirmed,
                    PhoneNumberConfirmed,
                    TwoFactorEnabled,
                    LockoutEnabled,
                    LockoutEnd,
                    AccessFailedCount,
                    CreatedAtUtc,
                    CreatedBy,
                    UpdatedAtUtc,
                    UpdatedBy
                FROM USER_ACCOUNT
                WHERE Email = @Email";

			return await _dbHelper.QueryFirstOrDefaultAsync<UserDto>(query, new { Email = email });
		}

		// ========================================
		// CHECK USERNAME EXISTS
		// ========================================
		public async Task<bool> UsernameExistsAsync(string userName, int? excludeUserId = null)
		{
			

			var query = excludeUserId.HasValue
				? "SELECT COUNT(*) FROM USER_ACCOUNT WHERE UserName = @UserName AND Id != @ExcludeUserId"
				: "SELECT COUNT(*) FROM USER_ACCOUNT WHERE UserName = @UserName";

			var count = await _dbHelper.ExecuteScalarAsync<int>(query, new
			{
				UserName = userName,
				ExcludeUserId = excludeUserId
			});

			return count > 0;
		}

		// ========================================
		// CHECK EMAIL EXISTS
		// ========================================
		public async Task<bool> EmailExistsAsync(string email, int? excludeUserId = null)
		{
			

			var query = excludeUserId.HasValue
				? "SELECT COUNT(*) FROM USER_ACCOUNT WHERE Email = @Email AND Id != @ExcludeUserId"
				: "SELECT COUNT(*) FROM USER_ACCOUNT WHERE Email = @Email";

			var count = await _dbHelper.ExecuteScalarAsync<int>(query, new
			{
				Email = email,
				ExcludeUserId = excludeUserId
			});

			return count > 0;
		}

		// ========================================
		// CREATE USER
		// ========================================
		public async Task<int> CreateUserAsync(CreateUserDto dto, string createdBy)
		{
			

			// Hash password
			var passwordHash = _passwordHasher.HashPassword(null!, dto.Password);

			var insertQuery = @"
                INSERT INTO USER_ACCOUNT (
                    UserName,
                    NormalizedUserName,
                    Email,
                    NormalizedEmail,
                    EmailConfirmed,
                    PasswordHash,
                    SecurityStamp,
                    ConcurrencyStamp,
                    FirstName,
                    LastName,
                    PhoneNumber,
                    PhoneNumberConfirmed,
                    TwoFactorEnabled,
                    LockoutEnabled,
                    AccessFailedCount,
                    IsActive,
                    CreatedAtUtc,
                    CreatedBy
                )
                VALUES (
                    @UserName,
                    @NormalizedUserName,
                    @Email,
                    @NormalizedEmail,
                    @EmailConfirmed,
                    @PasswordHash,
                    @SecurityStamp,
                    @ConcurrencyStamp,
                    @FirstName,
                    @LastName,
                    @PhoneNumber,
                    0, -- PhoneNumberConfirmed
                    0, -- TwoFactorEnabled
                    1, -- LockoutEnabled
                    0, -- AccessFailedCount
                    @IsActive,
                    GETUTCDATE(),
                    @CreatedBy
                );
                SELECT CAST(SCOPE_IDENTITY() as int);";

			var userId = await _dbHelper.ExecuteScalarAsync<int>(insertQuery, new
			{
				dto.UserName,
				NormalizedUserName = dto.UserName.ToUpper(),
				dto.Email,
				NormalizedEmail = dto.Email.ToUpper(),
				dto.EmailConfirmed,
				PasswordHash = passwordHash,
				SecurityStamp = Guid.NewGuid().ToString(),
				ConcurrencyStamp = Guid.NewGuid().ToString(),
				dto.FirstName,
				dto.LastName,
				dto.PhoneNumber,
				dto.IsActive,
				CreatedBy = createdBy
			});

			return userId;
		}

		// ========================================
		// UPDATE USER
		// ========================================
		public async Task<bool> UpdateUserAsync(UpdateUserDto dto, string updatedBy)
		{
			

			var updateQuery = @"
                UPDATE USER_ACCOUNT
                SET 
                    UserName = @UserName,
                    NormalizedUserName = @NormalizedUserName,
                    Email = @Email,
                    NormalizedEmail = @NormalizedEmail,
                    EmailConfirmed = @EmailConfirmed,
                    FirstName = @FirstName,
                    LastName = @LastName,
                    PhoneNumber = @PhoneNumber,
                    PhoneNumberConfirmed = @PhoneNumberConfirmed,
                    TwoFactorEnabled = @TwoFactorEnabled,
                    IsActive = @IsActive,
                    UpdatedAtUtc = GETUTCDATE(),
                    UpdatedBy = @UpdatedBy
                WHERE Id = @Id";

			var rowsAffected = await _dbHelper.ExecuteAsync(updateQuery, new
			{
				dto.Id,
				dto.UserName,
				NormalizedUserName = dto.UserName.ToUpper(),
				dto.Email,
				NormalizedEmail = dto.Email.ToUpper(),
				dto.EmailConfirmed,
				dto.FirstName,
				dto.LastName,
				dto.PhoneNumber,
				dto.PhoneNumberConfirmed,
				dto.TwoFactorEnabled,
				dto.IsActive,
				UpdatedBy = updatedBy
			});

			return rowsAffected > 0;
		}

		// Continued in Part 2...
		// CHANGE PASSWORD
		// ========================================
		public async Task<bool> ChangePasswordAsync(int userId, string newPassword)
		{
			

			var passwordHash = _passwordHasher.HashPassword(null!, newPassword);

			var updateQuery = @"
                UPDATE USER_ACCOUNT
                SET 
                    PasswordHash = @PasswordHash,
                    SecurityStamp = @SecurityStamp,
                    UpdatedAtUtc = GETUTCDATE()
                WHERE Id = @UserId";

			var rowsAffected = await _dbHelper.ExecuteAsync(updateQuery, new
			{
				UserId = userId,
				PasswordHash = passwordHash,
				SecurityStamp = Guid.NewGuid().ToString()
			});

			return rowsAffected > 0;
		}

		// ========================================
		// LOCK USER
		// ========================================
		public async Task<bool> LockUserAsync(int userId, int? lockoutMinutes)
		{
			

			DateTimeOffset? lockoutEnd = lockoutMinutes.HasValue
				? DateTimeOffset.UtcNow.AddMinutes(lockoutMinutes.Value)
				: DateTimeOffset.UtcNow.AddYears(100); // Permanent lock

			var updateQuery = @"
                UPDATE USER_ACCOUNT
                SET 
                    LockoutEnd = @LockoutEnd,
                    LockoutEnabled = 1,
                    UpdatedAtUtc = GETUTCDATE()
                WHERE Id = @UserId";

			var rowsAffected = await _dbHelper.ExecuteAsync(updateQuery, new
			{
				UserId = userId,
				LockoutEnd = lockoutEnd
			});

			return rowsAffected > 0;
		}

		// ========================================
		// UNLOCK USER
		// ========================================
		public async Task<bool> UnlockUserAsync(int userId)
		{
			

			var updateQuery = @"
                UPDATE USER_ACCOUNT
                SET 
                    LockoutEnd = NULL,
                    AccessFailedCount = 0,
                    UpdatedAtUtc = GETUTCDATE()
                WHERE Id = @UserId";

			var rowsAffected = await _dbHelper.ExecuteAsync(updateQuery, new { UserId = userId });

			return rowsAffected > 0;
		}

		// ========================================
		// DELETE USER
		// ========================================
		public async Task<bool> DeleteUserAsync(int userId)
		{
			

			var deleteQuery = "DELETE FROM USER_ACCOUNT WHERE Id = @UserId";
			var rowsAffected = await _dbHelper.ExecuteAsync(deleteQuery, new { UserId = userId });

			return rowsAffected > 0;
		}

		// ========================================
		// BULK DELETE USERS
		// ========================================
		public async Task<int> BulkDeleteUsersAsync(List<int> userIds)
		{
			

			var ids = string.Join(",", userIds);
			var deleteQuery = $"DELETE FROM USER_ACCOUNT WHERE Id IN ({ids})";
			var rowsAffected = await _dbHelper.ExecuteAsync(deleteQuery);

			return rowsAffected;
		}

		// ========================================
		// GET USER STATISTICS
		// ========================================
		public async Task<UserStatisticsDto> GetUserStatisticsAsync()
		{
			var query = @"
                SELECT 
                    COUNT(*) AS TotalUsers,
                    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveUsers,
                    SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) AS InactiveUsers,
                    SUM(CASE WHEN LockoutEnd IS NOT NULL AND LockoutEnd > GETUTCDATE() THEN 1 ELSE 0 END) AS LockedUsers,
                    SUM(CASE WHEN EmailConfirmed = 1 THEN 1 ELSE 0 END) AS EmailConfirmedUsers,
                    SUM(CASE WHEN TwoFactorEnabled = 1 THEN 1 ELSE 0 END) AS TwoFactorEnabledUsers,
                    COUNT(CASE WHEN CreatedAtUtc >= DATEADD(MONTH, -1, GETUTCDATE()) THEN 1 END) AS NewUsersThisMonth,
                    COUNT(CASE WHEN LoginUtc >= DATEADD(MINUTE, -15, GETUTCDATE()) THEN 1 END) AS OnlineUsers
                FROM USER_ACCOUNT";

			return await _dbHelper.QueryFirstOrDefaultAsync<UserStatisticsDto>(query);
		}

		// ========================================
		// GET ACTIVE USERS
		// ========================================
		public async Task<List<UserDto>> GetActiveUsersAsync()
		{
			

			var query = @"
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY Id DESC) AS Id,
					UserId = Id,
                    UserName,
                    Email,
                    FirstName,
                    LastName,
                    IsActive
                FROM USER_ACCOUNT
                WHERE IsActive = 1 
                  AND (LockoutEnd IS NULL OR LockoutEnd <= GETUTCDATE())
                ORDER BY UserName";

			var result = await _dbHelper.QueryAsync<UserDto>(query);
			return result.ToList();
		}

		// ========================================
		// SEARCH USERS (Simple)
		// ========================================
		public async Task<List<UserDto>> SearchUsersAsync(string keyword)
		{
			

			var query = @"
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY Id DESC) AS Id,
					UserId = Id,
                    UserName,
                    Email,
                    FirstName,
                    LastName,
                    PhoneNumber,
                    IsActive,
                    EmailConfirmed
                FROM USER_ACCOUNT
                WHERE UserName LIKE @Keyword 
                   OR Email LIKE @Keyword 
                   OR FirstName LIKE @Keyword
                   OR LastName LIKE @Keyword
                ORDER BY UserName";

			var result = await _dbHelper.QueryAsync<UserDto>(query, new { Keyword = $"%{keyword}%" });
			return result.ToList();
		}

		// ========================================
		// GET USERS BY IDS
		// ========================================
		public async Task<List<UserDto>> GetUsersByIdsAsync(List<int> userIds)
		{
			

			var ids = string.Join(",", userIds);
			var query = $@"
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY Id DESC) AS Id,
					UserId = Id,
                    UserName,
                    Email,
                    FirstName,
                    LastName,
                    PhoneNumber,
                    IsActive,
                    EmailConfirmed
                FROM USER_ACCOUNT
                WHERE Id IN ({ids})
                ORDER BY UserName";

			var result = await _dbHelper.QueryAsync<UserDto>(query);
			return result.ToList();
		}

		// ========================================
		// GET LOGIN HISTORY
		// ========================================
		public async Task<List<UserLoginHistoryDto>> GetLoginHistoryAsync(int userId, int top = 10)
		{
			

			var query = $@"
                SELECT TOP {top}
					ROW_NUMBER() OVER (ORDER BY Id DESC) AS UserId,
                    UserName,
                    LoginUtc,
                    LogOutUtc
                FROM USER_ACCOUNT
                WHERE Id = @UserId
                  AND LoginUtc IS NOT NULL
                ORDER BY LoginUtc DESC";

			var result = await _dbHelper.QueryAsync<UserLoginHistoryDto>(query, new { UserId = userId });
			return result.ToList();
		}

		// ========================================
		// UPDATE LAST LOGIN
		// ========================================
		public async Task<bool> UpdateLastLoginAsync(int userId)
		{
			

			var updateQuery = @"
                UPDATE USER_ACCOUNT
                SET LoginUtc = GETUTCDATE()
                WHERE Id = @UserId";

			var rowsAffected = await _dbHelper.ExecuteAsync(updateQuery, new { UserId = userId });

			return rowsAffected > 0;
		}
	}

}
