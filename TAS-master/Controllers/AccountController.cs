using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Data.Entity;
using System.Security.Claims;
using TAS.Data;
using TAS.DTOs;
using TAS.Models;
using TAS.ViewModels;

namespace TAS.Controllers
{
	public class AccountController(
		AppDbContext db,
		UserManager<UserAccountIdentity> userManager,
		SignInManager<UserAccountIdentity> signInManager,
		AccountModels accountModels,
		ILogger<AccountController> logger) : Controller
	{
		private readonly AccountModels _accountModels = accountModels;
		private readonly ILogger<AccountController> _logger = logger;
		private readonly AppDbContext _db = db;
		private readonly UserManager<UserAccountIdentity> _userManager = userManager;
		private readonly SignInManager<UserAccountIdentity> _signInManager = signInManager;

		// ========================================
		// GET: /Account/Login
		// ========================================
		[AllowAnonymous]
		public IActionResult Login(string? returnUrl = null)
		{
			// Nếu đã login rồi thì redirect về Home
			if (User.Identity?.IsAuthenticated == true)
			{
				return RedirectToAction("Index", "Home");
			}
			ViewData["Title"] = "Login";
			ViewBag.ReturnUrl = "/Home/Index";
			return View();
		}

		// ========================================
		// POST: /Account/Login
		// ========================================
		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Login(LoginRequest model, string? returnUrl = null)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return Json(new { success = false, message = "Vui lòng điền đầy đủ thông tin" });
				}

				// Xác thực user
				var result = await _accountModels.ValidateUserAsync(model.Username, model.Password);

				if (!result.Success)
				{
					return Json(new { success = false, message = result.Message });
				}

				
				// Tạo claims
				var claims = new List<Claim>
				{
					new Claim(ClaimTypes.NameIdentifier, result.UserId.ToString()),
					new Claim(ClaimTypes.Name, result.Username ?? ""),
					new Claim(ClaimTypes.Email, result.Email ?? ""),
					new Claim("FullName", result.FullName ?? ""),
					new Claim("FirstName", result.FirstName ?? ""),
					new Claim("LastName", result.LastName ?? "")
				};

				// Thêm roles (nếu có)
				if (result.Roles != null && result.Roles.Any())
				{
					foreach (var role in result.Roles)
					{
						claims.Add(new Claim(ClaimTypes.Role, role));
					}
				}

				var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
				var authProperties = new AuthenticationProperties
				{
					IsPersistent = true,
					ExpiresUtc = model.RememberMe
						? DateTimeOffset.UtcNow.AddDays(30)
						: DateTimeOffset.UtcNow.AddHours(8)
				};
				 //✅ Normalize username/ email để tìm kiếm chính xác
				var normalizedInput = model.Username.Trim().ToUpperInvariant();

				 //✅ Tìm user theo NormalizedUserName hoặc NormalizedEmail(đúng cách Identity làm)
				var user = await _db.Users
					.AsNoTracking() // Tăng performance
					.FirstOrDefaultAsync(x =>
						x.NormalizedUserName == normalizedInput ||
						x.NormalizedEmail == normalizedInput);

				await _signInManager.SignInAsync(user, isPersistent: model.RememberMe);


				// Sign in
				//await HttpContext.SignInAsync(
				//	CookieAuthenticationDefaults.AuthenticationScheme,
				//	new ClaimsPrincipal(claimsIdentity),
				//	authProperties);
				//HttpContext.User = new ClaimsPrincipal(claimsIdentity);

				// ✅ VERIFY: Kiểm tra ngay sau khi sign in
				//var isAuthenticated = HttpContext.User?.Identity?.IsAuthenticated ?? false;
				//_logger.LogInformation($"After SignIn - IsAuthenticated: {isAuthenticated}");

				//if (!isAuthenticated)
				//{
				//	_logger.LogError($"❌ Sign in failed for {model.Username} - User not authenticated after SignInAsync");
				//	return Json(new { success = false, message = "Đăng nhập thất bại. Vui lòng kiểm tra cấu hình." });
				//}

				// Cập nhật LastLogin
				await _accountModels.UpdateLastLoginAsync(result.UserId);

				_logger.LogInformation($"User {model.Username} logged in successfully");

				// Return URL
				var redirectUrl = !string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl)
					? returnUrl
					: Url.Action("Index", "Home");

				return Json(new { success = true, message = "Đăng nhập thành công", redirectUrl });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in Login");
				return Json(new { success = false, message = "Đã xảy ra lỗi. Vui lòng thử lại." });
			}
		}

		// ========================================
		// POST: /Account/Logout
		// ========================================
		[HttpPost]
		public async Task<IActionResult> Logout()
		{
			try
			{
				//var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
				//if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var userGuid))
				//{
				//	await _accountModels.UpdateLastLogoutAsync(userGuid);
				//}
				//// ✅ Normalize username/email để tìm kiếm chính xác
				//var normalizedInput = model.Username.Trim().ToUpperInvariant();

				//// ✅ Tìm user theo NormalizedUserName hoặc NormalizedEmail (đúng cách Identity làm)
				//var user = await _db.Users
				//	.AsNoTracking() // Tăng performance
				//	.FirstOrDefaultAsync(x =>
				//		x.NormalizedUserName == normalizedInput ||
				//		x.NormalizedEmail == normalizedInput);
				await _signInManager.SignOutAsync();
				//await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

				_logger.LogInformation($"User logged out");
				return RedirectToAction("Login");
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in Logout");
				return RedirectToAction("Login");
			}
		}

		// ========================================
		// GET: /Account/ForgotPassword
		// ========================================
		[AllowAnonymous]
		public IActionResult ForgotPassword()
		{
			if (User.Identity?.IsAuthenticated == true)
			{
				return RedirectToAction("Index", "Home");
			}

			return View();
		}

		// ========================================
		// POST: /Account/ForgotPassword
		// ========================================
		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest model)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return Json(new { success = false, message = "Vui lòng nhập email hoặc username" });
				}

				var result = await _accountModels.GeneratePasswordResetTokenAsync(model.EmailOrUsername);

				if (!result.Success)
				{
					// Vẫn trả về success để tránh enumerate users
					return Json(new
					{
						success = true,
						message = "Nếu tài khoản tồn tại, link đặt lại mật khẩu đã được gửi đến email của bạn."
					});
				}

				// Gửi email (hoặc log ra console trong dev)
				var resetLink = Url.Action(
					nameof(ResetPassword),
					"Account",
					new { token = result.ResetToken, email = result.Email },
					Request.Scheme);

				await _accountModels.SendPasswordResetEmailAsync(result.Email!, resetLink!);

				_logger.LogInformation($"Password reset requested for {model.EmailOrUsername}");

				return Json(new
				{
					success = true,
					message = "Link đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ForgotPassword");
				return Json(new { success = false, message = "Đã xảy ra lỗi. Vui lòng thử lại." });
			}
		}

		// ========================================
		// GET: /Account/ResetPassword
		// ========================================
		[AllowAnonymous]
		public async Task<IActionResult> ResetPassword(string? token, string? email)
		{
			if (User.Identity?.IsAuthenticated == true)
			{
				return RedirectToAction("Index", "Home");
			}

			if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(email))
			{
				TempData["Error"] = "Link không hợp lệ";
				return RedirectToAction(nameof(ForgotPassword));
			}

			// Verify token
			var isValid = await _accountModels.VerifyResetTokenAsync(email, token);
			if (!isValid)
			{
				TempData["Error"] = "Link đã hết hạn hoặc không hợp lệ";
				return RedirectToAction(nameof(ForgotPassword));
			}

			ViewBag.Token = token;
			ViewBag.Email = email;
			return View();
		}

		// ========================================
		// POST: /Account/ResetPassword
		// ========================================
		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> ResetPassword(ResetPasswordRequest model)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return Json(new { success = false, message = "Vui lòng điền đầy đủ thông tin" });
				}

				if (model.NewPassword != model.ConfirmPassword)
				{
					return Json(new { success = false, message = "Mật khẩu xác nhận không khớp" });
				}

				var result = await _accountModels.ResetPasswordAsync(
					model.Email,
					model.Token,
					model.NewPassword);

				if (!result.Success)
				{
					return Json(new { success = false, message = result.Message });
				}

				_logger.LogInformation($"Password reset successfully for {model.Email}");

				return Json(new
				{
					success = true,
					message = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.",
					redirectUrl = Url.Action(nameof(Login))
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ResetPassword");
				return Json(new { success = false, message = "Đã xảy ra lỗi. Vui lòng thử lại." });
			}
		}

		// ========================================
		// GET: /Account/AccessDenied
		// ========================================
		[AllowAnonymous]
		public IActionResult AccessDenied()
		{
			return View();
		}

		// ========================================
		// POST: /Account/ChangePassword (cho user đã login)
		// ========================================
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> ChangePassword(ChangePasswordRequest model)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return Json(new { success = false, message = "Vui lòng điền đầy đủ thông tin" });
				}

				var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
				if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
				{
					return Json(new { success = false, message = "Vui lòng đăng nhập lại" });
				}

				if (model.NewPassword != model.ConfirmPassword)
				{
					return Json(new { success = false, message = "Mật khẩu mới không khớp" });
				}

				var result = await _accountModels.ChangePasswordAsync(
					userGuid,
					model.CurrentPassword,
					model.NewPassword);

				if (!result.Success)
				{
					return Json(new { success = false, message = result.Message });
				}

				_logger.LogInformation($"Password changed for user {userId}");

				return Json(new { success = true, message = "Đổi mật khẩu thành công" });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ChangePassword");
				return Json(new { success = false, message = "Đã xảy ra lỗi. Vui lòng thử lại." });
			}
		}
	}
}
