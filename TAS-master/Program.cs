using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TAS.AttributeTargets;
using TAS.Data;
using TAS.Models;
using TAS.Repository;
using TAS.Services;
using TAS.TagHelpers;
using TAS.ViewModels; // DbContext của bạn

// Tạo builder
var builder = WebApplication.CreateBuilder(args);
// lấy chuỗi kết nối: appsettings.ConnectionStrings.Default
var cs = builder.Configuration.GetConnectionString("DefaultConnection");
// Đăng ký DI cho SQL Server + Dapper executor
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(cs));
builder.Services.AddScoped<ILanguageService, LanguageService>();// Đăng ký dịch vụ ngôn ngữ
builder.Services.AddSingleton<IBreadcrumbService, BreadcrumbService>();
builder.Services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
builder.Services.AddHttpClient();


// ========================================
// SESSION CONFIGURATION
// ========================================
builder.Services.AddSession(options =>
{
	options.IdleTimeout = TimeSpan.FromMinutes(30);
	options.Cookie.HttpOnly = true;
	options.Cookie.IsEssential = true;
});

builder.Services.AddHttpContextAccessor();

// ========================================
// SERVICE REGISTRATION
// ========================================
builder.Services.AddScoped<ConnectDbHelper>();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddScoped<IPdfService, PdfService>();

builder.Services.AddScoped<RubberGardenModels>();     // <-- bắt buộc
builder.Services.AddScoped<InformationGardenModels>();     // <-- bắt buộc
builder.Services.AddScoped<AgentModels>();     // <-- bắt buộc
builder.Services.AddScoped<TraceabilityModels>();     // <-- bắt buộc
builder.Services.AddScoped<OrderModels>();     // <-- bắt buộc
builder.Services.AddScoped<PondModels>();     // <-- bắt buộc
builder.Services.AddScoped<UserAccountModels>();     // <-- bắt buộc
builder.Services.AddScoped<CommonModels>();
builder.Services.AddScoped<AccountModels>();
builder.Services.AddScoped<RubberIntakeModels>();


// Đăng ký MVC với filter RequireLogin toàn cục
builder.Services.AddControllersWithViews(o =>
{
	o.Filters.Add(new RequireLoginAttribute()); // nhớ đặt [AllowAnonymous] cho Login/Register
})
	.AddViewLocalization()  // Thêm hỗ trợ localization cho View
	.AddDataAnnotationsLocalization(); // Thêm hỗ trợ localization cho DataAnnotation

// ========================================
// CONFIGURE CORS
// ========================================
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAll", builder =>
	{
		builder.AllowAnyOrigin()
			   .AllowAnyMethod()
			   .AllowAnyHeader();
	});
});

// ========================================
// LOCALIZATION CONFIGURATION
// ========================================
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
	var supported = new[] { "vi", "en" };
	options.SetDefaultCulture("vi")
		.AddSupportedCultures(supported)
		.AddSupportedUICultures(supported);
	options.RequestCultureProviders = new List<IRequestCultureProvider>
	{
		new CookieRequestCultureProvider(),      // Cookie
		new QueryStringRequestCultureProvider(), // ?culture=vi-VN
        new AcceptLanguageHeaderRequestCultureProvider() // Header
    };
});
builder.Services
	.AddIdentity<UserAccountIdentity, IdentityRole<Guid>>(options =>
	{
		// Password
		options.Password.RequireDigit = true;              // cần số
		options.Password.RequireLowercase = true;          // cần chữ thường
		options.Password.RequireUppercase = false;         // không bắt buộc chữ hoa
		options.Password.RequireNonAlphanumeric = false;   // không bắt buộc ký tự đặc biệt
		options.Password.RequiredLength = 8;               // tối thiểu 8 ký tự
		options.Password.RequiredUniqueChars = 1;          // tối thiểu 1 ký tự khác nhau

		// User / Sign-in
		options.User.RequireUniqueEmail = true;            // email unique
		options.SignIn.RequireConfirmedEmail = false;      // không bắt confirm email

		// Lockout (chống brute-force)
		options.Lockout.AllowedForNewUsers = true;
		options.Lockout.MaxFailedAccessAttempts = 5;
		options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);

		// Claim types (để consistent)
		options.ClaimsIdentity.UserIdClaimType = ClaimTypes.NameIdentifier;
		options.ClaimsIdentity.UserNameClaimType = ClaimTypes.Name;
		options.ClaimsIdentity.EmailClaimType = ClaimTypes.Email;
		options.ClaimsIdentity.RoleClaimType = ClaimTypes.Role;
	})
	.AddEntityFrameworkStores<AppDbContext>()
	.AddDefaultTokenProviders();

// ========================================
// CONFIGURE AUTHENTICATION & AUTHORIZATION
// ========================================
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
	.AddCookie(options =>
	{
		options.LoginPath = "/Account/Login";
		options.LogoutPath = "/Account/Logout";
		options.AccessDeniedPath = "/Account/AccessDenied";
		options.ExpireTimeSpan = TimeSpan.FromHours(8);
		options.SlidingExpiration = true;

		options.Cookie.HttpOnly = true;
		options.Cookie.Name = "TAS.Auth";

		options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // Always in production
		options.Cookie.SameSite = SameSiteMode.Lax;
	});
builder.Services.AddAuthorization();

// Cấu hình cookie Identity bằng ConfigureApplicationCookie (không AddCookie)
builder.Services.ConfigureApplicationCookie(opt =>
{
	opt.LoginPath = "/Account/Login";
	opt.AccessDeniedPath = "/Account/Denied";
	opt.SlidingExpiration = true;
	opt.ExpireTimeSpan = TimeSpan.FromDays(7);
});

// ========================================
// BUILD APP
// ========================================
var app = builder.Build();

// ========================================
// CONFIGURE PIPELINE
// ========================================
if (!app.Environment.IsDevelopment())
{
	app.UseExceptionHandler("/Home/Error");
	app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// ✅✅✅ QUAN TRỌNG: ĐÚNG THỨ TỰ ✅✅✅
// UseAuthentication PHẢI đứng TRƯỚC UseAuthorization
app.UseAuthentication();  // ✅ 1. Authentication TRƯỚC
app.UseAuthorization();   // ✅ 2. Authorization SAU

app.UseSession(); // if using session

// ========================================
// LOCALIZATION MIDDLEWARE
// ========================================
var opts = new RequestLocalizationOptions()
	.SetDefaultCulture("vi")
	.AddSupportedCultures("vi", "en")
	.AddSupportedUICultures("vi", "en");
app.UseRequestLocalization(opts);

app.MapControllerRoute(
	name: "default",
	pattern: "{controller=Home}/{action=Index}/{id?}");

// Chạy ứng dụng
app.Run();
