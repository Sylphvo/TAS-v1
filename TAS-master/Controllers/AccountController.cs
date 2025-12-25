using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TAS.Data;
using TAS.DTOs;
using TAS.Models;

namespace TAS.Controllers
{
    public class AccountController : Controller
    {
        private readonly AppDbContext _db;
        private readonly UserManager<UserAccountIdentity> _userManager;
        private readonly SignInManager<UserAccountIdentity> _signInManager;

        public AccountController(
            AppDbContext db,
            UserManager<UserAccountIdentity> userManager,
            SignInManager<UserAccountIdentity> signInManager)
        {
            _db = db;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(UserAccountDto model)
        {
            try
            {
                // ✅ Validate ModelState
                //if (!ModelState.IsValid)
                //{
                //    return View(model);
                //}

                // ✅ Kiểm tra input không null/empty
                if (string.IsNullOrWhiteSpace(model.UserName) || string.IsNullOrWhiteSpace(model.Password))
                {
                    ModelState.AddModelError("", "Vui lòng nhập đầy đủ thông tin đăng nhập");
                    return View(model);
                }

                // ✅ Normalize username/email để tìm kiếm chính xác
                var normalizedInput = model.UserName.Trim().ToUpperInvariant();

                // ✅ Tìm user theo NormalizedUserName hoặc NormalizedEmail (đúng cách Identity làm)
                var user = await _db.Users
                    .AsNoTracking() // Tăng performance
                    .FirstOrDefaultAsync(x =>
                        x.NormalizedUserName == normalizedInput ||
                        x.NormalizedEmail == normalizedInput);

                // ✅ Kiểm tra user tồn tại
                if (user == null)
                {
                    ModelState.AddModelError("", "Tên đăng nhập hoặc mật khẩu không đúng");
                    return View(model);
                }

                // ✅ Kiểm tra account có active không
                if (!user.IsActive)
                {
                    ModelState.AddModelError("", "Tài khoản đã bị vô hiệu hóa");
                    return View(model);
                }

                // ✅ Kiểm tra email confirmed (nếu cần)
                if (!user.EmailConfirmed && _userManager.Options.SignIn.RequireConfirmedEmail)
                {
                    ModelState.AddModelError("", "Vui lòng xác nhận email trước khi đăng nhập");
                    return View(model);
                }

                // ✅ Verify password
                var hasher = new PasswordHasher<UserAccountIdentity>();
                var verifyResult = BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash);

                if (!verifyResult)
                {
                    ModelState.AddModelError("", "Tên đăng nhập hoặc mật khẩu không đúng");
                    return View(model);
                }

                // ✅ Cập nhật thời gian đăng nhập
                user.LogInUtc = DateTime.UtcNow;
                _db.Users.Attach(user);
                _db.Entry(user).Property(x => x.LogInUtc).IsModified = true;
                await _db.SaveChangesAsync();

                // ✅ Tạo Claims
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.UserName ?? ""),
                    new Claim(ClaimTypes.Email, user.Email ?? ""),
                    new Claim(ClaimTypes.GivenName, user.FirstName ?? ""),
                    new Claim(ClaimTypes.Surname, user.LastName ?? ""),
                    new Claim("FullName", $"{user.FirstName} {user.LastName}".Trim())
                };

                // ✅ Thêm Roles
                var roles = await _userManager.GetRolesAsync(user);
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }

                // ✅ Tạo Identity và Sign In
                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var principal = new ClaimsPrincipal(identity);

                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = model.RememberMe,
                    ExpiresUtc = model.RememberMe
                        ? DateTimeOffset.UtcNow.AddDays(30)
                        : DateTimeOffset.UtcNow.AddHours(2),
                    AllowRefresh = true,
                    IssuedUtc = DateTimeOffset.UtcNow
                };

                await _signInManager.SignInAsync(user, isPersistent: model.RememberMe);
                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                // ✅ Log chi tiết để debug
                //_logger?.LogError(ex, "Login failed for user: {UserName}", model.UserName);
                ModelState.AddModelError("", ex.Message);
                return View(model);
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login");
        }
    }
}
