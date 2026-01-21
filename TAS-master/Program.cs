using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
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


var builder = WebApplication.CreateBuilder(args);// Tạo builder
var cs = builder.Configuration.GetConnectionString("DefaultConnection");// lấy chuỗi kết nối: appsettings.ConnectionStrings.Default
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(cs));// Đăng ký DI cho SQL Server + Dapper executor
builder.Services.AddScoped<ILanguageService, LanguageService>();// Đăng ký dịch vụ ngôn ngữ
builder.Services.AddSingleton<IBreadcrumbService, BreadcrumbService>();
builder.Services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
builder.Services.AddHttpClient();




// ========================================
// SERVICE REGISTRATION
// ========================================
builder.Services.AddScoped<ConnectDbHelper>();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddScoped<IPdfService, PdfService>();

//builder.Services.AddScoped<RubberGardenModels>();     // <-- bắt buộc
builder.Services.AddScoped<FarmModels>();     // <-- bắt buộc
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
// Identity (cookie auth của Identity tự handle)
builder.Services
	.AddIdentity<UserAccountIdentity, IdentityRole<Guid>>(options =>
	{
		options.Password.RequireDigit = true;
		options.Password.RequireLowercase = true;
		options.Password.RequireUppercase = false;
		options.Password.RequireNonAlphanumeric = false;
		options.Password.RequiredLength = 8;
		options.Password.RequiredUniqueChars = 1;

		options.User.RequireUniqueEmail = true;
		options.SignIn.RequireConfirmedEmail = false;

		options.Lockout.AllowedForNewUsers = true;
		options.Lockout.MaxFailedAccessAttempts = 5;
		options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromDays(1);

		options.ClaimsIdentity.UserIdClaimType = ClaimTypes.NameIdentifier;
		options.ClaimsIdentity.UserNameClaimType = ClaimTypes.Name;
		options.ClaimsIdentity.EmailClaimType = ClaimTypes.Email;
		options.ClaimsIdentity.RoleClaimType = ClaimTypes.Role;
	})
	.AddEntityFrameworkStores<AppDbContext>()
	.AddDefaultTokenProviders();
// ========================================
// SESSION CONFIGURATION
// ========================================
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
	options.IdleTimeout = TimeSpan.FromDays(1);
	options.Cookie.HttpOnly = true;
	options.Cookie.IsEssential = true;
});
// Set cookie của Identity (thay vì AddAuthentication().AddCookie())
builder.Services.ConfigureApplicationCookie(opt =>
{
	opt.LoginPath = "/Account/Login";
	opt.LogoutPath = "/Account/Logout";

	opt.Cookie.HttpOnly = true;
	opt.Cookie.SecurePolicy = CookieSecurePolicy.None; // 🔥 QUAN TRỌNG
	opt.Cookie.SameSite = SameSiteMode.Lax;

	opt.SlidingExpiration = true;
	opt.ExpireTimeSpan = TimeSpan.FromDays(1);
});
builder.Services.AddAuthorization();
builder.Services.AddDataProtection()
	.PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "keys")))
	.SetApplicationName("TAS");

builder.Services.AddHttpContextAccessor();
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
app.UseSession(); // if using session
app.UseAuthentication();  // ✅ 1. Authentication TRƯỚC
app.UseAuthorization();   // ✅ 2. Authorization SAU

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
app.Run();// Chạy ứng dụng
