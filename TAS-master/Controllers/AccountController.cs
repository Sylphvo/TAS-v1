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
		[HttpGet]
		[AllowAnonymous]
		public IActionResult Login(string? returnUrl = null)
		{
			ViewBag.ReturnUrl = returnUrl;
			return View();
		}

		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Login(LoginRequest model, string? returnUrl = null)
		{
			//if (!ModelState.IsValid)
			//	return View(model);

			// 1) Validate user
			var result = await _accountModels.ValidateUserAsync(model.Username, model.Password);
			if (!result.Success)
			{
				ModelState.AddModelError("", result.Message ?? "Sai tài khoản hoặc mật khẩu");
				return View(model);
			}

			// 2) Claims (tối thiểu NameIdentifier + Name)
			var claims = new List<Claim>
			{
				new Claim(ClaimTypes.NameIdentifier, result.UserId.ToString()),
				new Claim(ClaimTypes.Name, result.Username ?? result.Email ?? ""),
				new Claim(ClaimTypes.Email, result.Email ?? ""),
				new Claim(ClaimTypes.Role, "admin"), // nếu có
			};

			// Roles (nếu có)
			//foreach (var role in result.Roles ?? Enumerable.Empty<string>())
			//	claims.Add(new Claim(ClaimTypes.Role, role));

			var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
			var principal = new ClaimsPrincipal(identity);

			// 3) Cookie properties
			var authProps = new AuthenticationProperties
			{
				IsPersistent = model.RememberMe, // true => cookie sống lâu
				ExpiresUtc = model.RememberMe
					? DateTimeOffset.UtcNow.AddDays(7)
					: DateTimeOffset.UtcNow.AddHours(2),
				AllowRefresh = true
			};

			// 4) Sign-in => đây là cái làm IsAuthenticated = true
			await HttpContext.SignInAsync(IdentityConstants.ApplicationScheme, principal, authProps);
			// 5) Session (server-side) => optional, dùng cho data phụ
			HttpContext.Session.SetString("uid", result.UserId.ToString());
			HttpContext.Session.SetString("uname", result.Username ?? "");
			HttpContext.Session.SetString("fullName", result.FullName ?? "");

			// return
			if (!string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl))
				return Redirect(returnUrl);

			return RedirectToAction("Index", "Home");
		}
		[HttpGet]
		public async Task<IActionResult> Logout()
		{
			// Clear cookie auth
			await HttpContext.SignOutAsync(IdentityConstants.ApplicationScheme);

			// Clear session
			HttpContext.Session.Clear();

			return RedirectToAction("Login");
		}
	}
}