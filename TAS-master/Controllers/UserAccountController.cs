using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAS.DTOs;
using TAS.Resources;
using TAS.ViewModels;
using static Azure.Core.HttpHeader;

namespace TAS.Controllers
{
	[Authorize]
	public class UserAccountController : Controller
	{
		private readonly UserAccountModels _userTableModels;
		private readonly ILogger<UserAccountController> _logger;
		private readonly CommonModels _common;

		public UserAccountController(UserAccountModels userTableModels, ILogger<UserAccountController> logger, CommonModels common)
		{
			_userTableModels = userTableModels;
			_logger = logger;
			_common = common;
		}
		// ========================================
		// VIEW PAGE
		// ========================================

		/// <summary>
		/// Display User management page
		/// </summary>
		/// 
		[HttpGet]
		[Breadcrumb(nameof(Language.key_quanlynguoidung), "#", nameof(Language.key_setting), true)]
		public IActionResult Index()
		{
			ViewData["Title"] = _common.GetValueByKey("key_quanlynguoidung");
			return View();
		}

		// ========================================
		// GET USERS - With Filters & Pagination
		// ========================================

		/// <summary>
		/// Get users with filters and pagination
		/// </summary>
		[HttpGet]
		public async Task<IActionResult> GetUsers([FromQuery] UserSearchDto searchDto)
		{
			try
			{
				_logger.LogInformation("Getting users with filters");

				var result = await _userTableModels.GetTableDataAsync(searchDto);

				return Json(new UserResponse<List<UserDto>>
				{
					Success = true,
					Message = "Tải danh sách người dùng thành công",
					Data = result.Data,
					TotalRecords = result.TotalRecords
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting users");
				return Json(new UserResponse<List<UserDto>>
				{
					Success = false,
					Message = $"Lỗi khi tải danh sách người dùng: {ex.Message}"
				});
			}
		}

		// ========================================
		// GET USER BY ID
		// ========================================

		/// <summary>
		/// Get single user by ID
		/// </summary>
		[HttpGet]
		public async Task<IActionResult> GetUserById(int id)
		{
			try
			{
				_logger.LogInformation($"Getting user by ID: {id}");

				var user = await _userTableModels.GetUserByIdAsync(id);

				if (user == null)
				{
					return Json(new UserResponse<UserDto>
					{
						Success = false,
						Message = "Không tìm thấy người dùng"
					});
				}

				return Json(new UserResponse<UserDto>
				{
					Success = true,
					Message = "Tải thông tin người dùng thành công",
					Data = user
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error getting user by ID: {id}");
				return Json(new UserResponse<UserDto>
				{
					Success = false,
					Message = $"Lỗi khi tải thông tin người dùng: {ex.Message}"
				});
			}
		}

		// ========================================
		// CREATE USER
		// ========================================

		/// <summary>
		/// Create new user with password
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					var errors = string.Join(", ", ModelState.Values
						.SelectMany(v => v.Errors)
						.Select(e => e.ErrorMessage));
					return Json(new UserResponse<int>
					{
						Success = false,
						Message = $"Dữ liệu không hợp lệ: {errors}"
					});
				}

				_logger.LogInformation($"Creating user: {dto.UserName}");

				// Check duplicate username
				var usernameExists = await _userTableModels.UsernameExistsAsync(dto.UserName);
				if (usernameExists)
				{
					return Json(new UserResponse<int>
					{
						Success = false,
						Message = $"Username '{dto.UserName}' đã tồn tại"
					});
				}

				// Check duplicate email
				var emailExists = await _userTableModels.EmailExistsAsync(dto.Email);
				if (emailExists)
				{
					return Json(new UserResponse<int>
					{
						Success = false,
						Message = $"Email '{dto.Email}' đã tồn tại"
					});
				}

				var currentUser = User.Identity?.Name ?? "System";
				var userId = await _userTableModels.CreateUserAsync(dto, currentUser);

				_logger.LogInformation($"User created successfully with ID: {userId}");

				return Json(new UserResponse<int>
				{
					Success = true,
					Message = "Tạo người dùng thành công",
					Data = userId
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error creating user");
				return Json(new UserResponse<int>
				{
					Success = false,
					Message = $"Lỗi khi tạo người dùng: {ex.Message}"
				});
			}
		}

		// ========================================
		// UPDATE USER
		// ========================================

		/// <summary>
		/// Update existing user
		/// </summary>
		[HttpPut]
		public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto dto)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					var errors = string.Join(", ", ModelState.Values
						.SelectMany(v => v.Errors)
						.Select(e => e.ErrorMessage));
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = $"Dữ liệu không hợp lệ: {errors}"
					});
				}

				_logger.LogInformation($"Updating user ID: {dto.Id}");

				// Check if user exists
				var existingUser = await _userTableModels.GetUserByIdAsync(dto.Id);
				if (existingUser == null)
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Không tìm thấy người dùng"
					});
				}

				// Check duplicate username (exclude current user)
				var usernameExists = await _userTableModels.UsernameExistsAsync(dto.UserName, dto.Id);
				if (usernameExists)
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = $"Username '{dto.UserName}' đã tồn tại"
					});
				}

				// Check duplicate email (exclude current user)
				var emailExists = await _userTableModels.EmailExistsAsync(dto.Email, dto.Id);
				if (emailExists)
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = $"Email '{dto.Email}' đã tồn tại"
					});
				}

				var currentUser = User.Identity?.Name ?? "System";
				var success = await _userTableModels.UpdateUserAsync(dto, currentUser);

				if (success)
				{
					_logger.LogInformation($"User updated successfully: {dto.Id}");
					return Json(new UserResponse<bool>
					{
						Success = true,
						Message = "Cập nhật người dùng thành công",
						Data = true
					});
				}
				else
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Cập nhật người dùng thất bại"
					});
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error updating user: {dto.Id}");
				return Json(new UserResponse<bool>
				{
					Success = false,
					Message = $"Lỗi khi cập nhật người dùng: {ex.Message}"
				});
			}
		}

		// ========================================
		// DELETE USER
		// ========================================

		/// <summary>
		/// Delete single user
		/// </summary>
		[HttpDelete]
		public async Task<IActionResult> DeleteUser(int id)
		{
			try
			{
				_logger.LogInformation($"Deleting user ID: {id}");

				// Check if user exists
				var user = await _userTableModels.GetUserByIdAsync(id);
				if (user == null)
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Không tìm thấy người dùng"
					});
				}

				// Prevent deleting current user
				var currentUsername = User.Identity?.Name;
				if (user.UserName == currentUsername)
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Không thể xóa tài khoản đang đăng nhập"
					});
				}

				var success = await _userTableModels.DeleteUserAsync(id);

				if (success)
				{
					_logger.LogInformation($"User deleted successfully: {id}");
					return Json(new UserResponse<bool>
					{
						Success = true,
						Message = "Xóa người dùng thành công",
						Data = true
					});
				}
				else
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Xóa người dùng thất bại"
					});
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error deleting user: {id}");
				return Json(new UserResponse<bool>
				{
					Success = false,
					Message = $"Lỗi khi xóa người dùng: {ex.Message}"
				});
			}
		}

		// ========================================
		// BULK DELETE USERS
		// ========================================

		/// <summary>
		/// Delete multiple users
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> BulkDeleteUsers([FromBody] BulkDeleteUserDto dto)
		{
			try
			{
				if (dto.UserIds == null || !dto.UserIds.Any())
				{
					return Json(new UserResponse<int>
					{
						Success = false,
						Message = "Vui lòng chọn ít nhất một người dùng"
					});
				}

				_logger.LogInformation($"Bulk deleting {dto.UserIds.Count} users");

				// Prevent deleting current user
				var currentUsername = User.Identity?.Name;
				foreach (var userId in dto.UserIds)
				{
					var user = await _userTableModels.GetUserByIdAsync(userId);
					if (user != null && user.UserName == currentUsername)
					{
						return Json(new UserResponse<int>
						{
							Success = false,
							Message = "Không thể xóa tài khoản đang đăng nhập"
						});
					}
				}

				var deletedCount = await _userTableModels.BulkDeleteUsersAsync(dto.UserIds);

				_logger.LogInformation($"Bulk deleted {deletedCount} users");

				return Json(new UserResponse<int>
				{
					Success = true,
					Message = $"Đã xóa {deletedCount} người dùng",
					Data = deletedCount
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error bulk deleting users");
				return Json(new UserResponse<int>
				{
					Success = false,
					Message = $"Lỗi khi xóa người dùng: {ex.Message}"
				});
			}
		}

		// ========================================
		// CHANGE PASSWORD
		// ========================================

		/// <summary>
		/// Change user password
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> ChangePassword([FromBody] ChangeUserPasswordDto dto)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					var errors = string.Join(", ", ModelState.Values
						.SelectMany(v => v.Errors)
						.Select(e => e.ErrorMessage));
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = $"Dữ liệu không hợp lệ: {errors}"
					});
				}

				_logger.LogInformation($"Changing password for user ID: {dto.UserId}");

				// Check if user exists
				var user = await _userTableModels.GetUserByIdAsync(dto.UserId);
				if (user == null)
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Không tìm thấy người dùng"
					});
				}

				var success = await _userTableModels.ChangePasswordAsync(dto.UserId, dto.NewPassword);

				if (success)
				{
					_logger.LogInformation($"Password changed successfully for user: {dto.UserId}");
					return Json(new UserResponse<bool>
					{
						Success = true,
						Message = "Đổi mật khẩu thành công",
						Data = true
					});
				}
				else
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Đổi mật khẩu thất bại"
					});
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error changing password for user: {dto.UserId}");
				return Json(new UserResponse<bool>
				{
					Success = false,
					Message = $"Lỗi khi đổi mật khẩu: {ex.Message}"
				});
			}
		}

		// ========================================
		// LOCK USER
		// ========================================

		/// <summary>
		/// Lock user account
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> LockUser([FromBody] LockUserDto dto)
		{
			try
			{
				_logger.LogInformation($"Locking user ID: {dto.UserId}");

				// Check if user exists
				var user = await _userTableModels.GetUserByIdAsync(dto.UserId);
				if (user == null)
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Không tìm thấy người dùng"
					});
				}

				// Prevent locking current user
				var currentUsername = User.Identity?.Name;
				if (user.UserName == currentUsername)
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Không thể khóa tài khoản đang đăng nhập"
					});
				}

				var success = await _userTableModels.LockUserAsync(dto.UserId, dto.LockoutMinutes);

				if (success)
				{
					var lockMessage = dto.LockoutMinutes.HasValue
						? $"Đã khóa tài khoản trong {dto.LockoutMinutes} phút"
						: "Đã khóa tài khoản vĩnh viễn";

					_logger.LogInformation($"User locked successfully: {dto.UserId}");

					return Json(new UserResponse<bool>
					{
						Success = true,
						Message = lockMessage,
						Data = true
					});
				}
				else
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Khóa tài khoản thất bại"
					});
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error locking user: {dto.UserId}");
				return Json(new UserResponse<bool>
				{
					Success = false,
					Message = $"Lỗi khi khóa tài khoản: {ex.Message}"
				});
			}
		}

		// ========================================
		// UNLOCK USER
		// ========================================

		/// <summary>
		/// Unlock user account
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> UnlockUser([FromBody] LockUserDto dto)
		{
			try
			{
				_logger.LogInformation($"Unlocking user ID: {dto.UserId}");

				// Check if user exists
				var user = await _userTableModels.GetUserByIdAsync(dto.UserId);
				if (user == null)
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Không tìm thấy người dùng"
					});
				}

				var success = await _userTableModels.UnlockUserAsync(dto.UserId);

				if (success)
				{
					_logger.LogInformation($"User unlocked successfully: {dto.UserId}");

					return Json(new UserResponse<bool>
					{
						Success = true,
						Message = "Đã mở khóa tài khoản",
						Data = true
					});
				}
				else
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Mở khóa tài khoản thất bại"
					});
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error unlocking user: {dto.UserId}");
				return Json(new UserResponse<bool>
				{
					Success = false,
					Message = $"Lỗi khi mở khóa tài khoản: {ex.Message}"
				});
			}
		}

		// ========================================
		// GET USER STATISTICS
		// ========================================

		/// <summary>
		/// Get user statistics
		/// </summary>
		[HttpGet]
		public async Task<IActionResult> GetUserStatistics()
		{
			try
			{
				_logger.LogInformation("Getting user statistics");

				var stats = await _userTableModels.GetUserStatisticsAsync();

				return Json(new UserResponse<UserStatisticsDto>
				{
					Success = true,
					Message = "Tải thống kê thành công",
					Data = stats
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting user statistics");
				return Json(new UserResponse<UserStatisticsDto>
				{
					Success = false,
					Message = $"Lỗi khi tải thống kê: {ex.Message}"
				});
			}
		}

		// ========================================
		// GET LOGIN HISTORY
		// ========================================

		/// <summary>
		/// Get user login history
		/// </summary>
		[HttpGet]
		public async Task<IActionResult> GetLoginHistory(int userId, int top = 10)
		{
			try
			{
				_logger.LogInformation($"Getting login history for user: {userId}");

				var history = await _userTableModels.GetLoginHistoryAsync(userId, top);

				return Json(new UserResponse<List<UserLoginHistoryDto>>
				{
					Success = true,
					Message = "Tải lịch sử đăng nhập thành công",
					Data = history
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error getting login history for user: {userId}");
				return Json(new UserResponse<List<UserLoginHistoryDto>>
				{
					Success = false,
					Message = $"Lỗi khi tải lịch sử đăng nhập: {ex.Message}"
				});
			}
		}

		// ========================================
		// SEARCH USERS
		// ========================================

		/// <summary>
		/// Simple keyword search
		/// </summary>
		[HttpGet]
		public async Task<IActionResult> SearchUsers(string keyword)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(keyword))
				{
					return Json(new UserResponse<List<UserDto>>
					{
						Success = false,
						Message = "Vui lòng nhập từ khóa tìm kiếm"
					});
				}

				_logger.LogInformation($"Searching users with keyword: {keyword}");

				var users = await _userTableModels.SearchUsersAsync(keyword);

				return Json(new UserResponse<List<UserDto>>
				{
					Success = true,
					Message = $"Tìm thấy {users.Count} người dùng",
					Data = users,
					TotalRecords = users.Count
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error searching users with keyword: {keyword}");
				return Json(new UserResponse<List<UserDto>>
				{
					Success = false,
					Message = $"Lỗi khi tìm kiếm: {ex.Message}"
				});
			}
		}

		// ========================================
		// CONFIRM EMAIL
		// ========================================

		/// <summary>
		/// Confirm user email
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> ConfirmEmail([FromBody] int userId)
		{
			try
			{
				_logger.LogInformation($"Confirming email for user: {userId}");

				var user = await _userTableModels.GetUserByIdAsync(userId);
				if (user == null)
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Không tìm thấy người dùng"
					});
				}

				var updateDto = new UpdateUserDto
				{
					Id = user.Id,
					UserName = user.UserName,
					Email = user.Email,
					FirstName = user.FirstName,
					LastName = user.LastName,
					PhoneNumber = user.PhoneNumber,
					IsActive = user.IsActive,
					EmailConfirmed = true,
					PhoneNumberConfirmed = user.PhoneNumberConfirmed,
					TwoFactorEnabled = user.TwoFactorEnabled
				};

				var currentUser = User.Identity?.Name ?? "System";
				var success = await _userTableModels.UpdateUserAsync(updateDto, currentUser);

				if (success)
				{
					return Json(new UserResponse<bool>
					{
						Success = true,
						Message = "Xác nhận email thành công",
						Data = true
					});
				}
				else
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Xác nhận email thất bại"
					});
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error confirming email for user: {userId}");
				return Json(new UserResponse<bool>
				{
					Success = false,
					Message = $"Lỗi khi xác nhận email: {ex.Message}"
				});
			}
		}

		// ========================================
		// TOGGLE TWO-FACTOR AUTHENTICATION
		// ========================================

		/// <summary>
		/// Enable/Disable Two-Factor Authentication
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> Toggle2FA([FromBody] int userId)
		{
			try
			{
				_logger.LogInformation($"Toggling 2FA for user: {userId}");

				var user = await _userTableModels.GetUserByIdAsync(userId);
				if (user == null)
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Không tìm thấy người dùng"
					});
				}

				var updateDto = new UpdateUserDto
				{
					Id = user.Id,
					UserName = user.UserName,
					Email = user.Email,
					FirstName = user.FirstName,
					LastName = user.LastName,
					PhoneNumber = user.PhoneNumber,
					IsActive = user.IsActive,
					EmailConfirmed = user.EmailConfirmed,
					PhoneNumberConfirmed = user.PhoneNumberConfirmed,
					TwoFactorEnabled = !user.TwoFactorEnabled // Toggle
				};

				var currentUser = User.Identity?.Name ?? "System";
				var success = await _userTableModels.UpdateUserAsync(updateDto, currentUser);

				if (success)
				{
					var message = updateDto.TwoFactorEnabled ? "Đã bật 2FA" : "Đã tắt 2FA";
					return Json(new UserResponse<bool>
					{
						Success = true,
						Message = message,
						Data = updateDto.TwoFactorEnabled
					});
				}
				else
				{
					return Json(new UserResponse<bool>
					{
						Success = false,
						Message = "Cập nhật 2FA thất bại"
					});
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Error toggling 2FA for user: {userId}");
				return Json(new UserResponse<bool>
				{
					Success = false,
					Message = $"Lỗi khi cập nhật 2FA: {ex.Message}"
				});
			}
		}
	}
}