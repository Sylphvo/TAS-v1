using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;
using TAS.AttributeTargets;
using TAS.Data;
using TAS.Repository;
using TAS.Services;
using TAS.TagHelpers;
using TAS.Models;
using TAS.ViewModels; // DbContext của bạn

// Tạo builder
var builder = WebApplication.CreateBuilder(args);
// lấy chuỗi kết nối: appsettings.ConnectionStrings.Default
var cs = builder.Configuration.GetConnectionString("DefaultConnection");
// Đăng ký DI cho SQL Server + Dapper executor
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(cs));
// Đăng ký Identity
builder.Services.AddScoped<ConnectDbHelper>();// Đăng ký CommonDb
builder.Services.AddHttpContextAccessor();// Đăng ký LanguageService
builder.Services.AddScoped<ICurrentUser, CurrentUserService>();// Đăng ký dịch vụ lấy thông tin người dùng hiện tại
builder.Services.AddScoped<CommonModels>();           // <-- bắt buộc
builder.Services.AddScoped<RubberGardenModels>();     // <-- bắt buộc
builder.Services.AddScoped<InformationGardenModels>();     // <-- bắt buộc
builder.Services.AddScoped<AgentModels>();     // <-- bắt buộc
builder.Services.AddScoped<TraceabilityModels>();     // <-- bắt buộc
builder.Services.AddScoped<OrderModels>();     // <-- bắt buộc
builder.Services.AddScoped<PondModels>();     // <-- bắt buộc
builder.Services.AddScoped<UserAccountModels>();     // <-- bắt buộc

builder.Services.AddScoped<ILanguageService, LanguageService>();// Đăng ký dịch vụ ngôn ngữ
builder.Services.AddSingleton<IBreadcrumbService, BreadcrumbService>();
builder.Services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
builder.Services.AddHttpClient();
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


// Đăng ký MVC với filter RequireLogin toàn cục
builder.Services.AddControllersWithViews(o =>
{
	o.Filters.Add(new RequireLoginAttribute()); // nhớ đặt [AllowAnonymous] cho Login/Register
})
	.AddViewLocalization()  // Thêm hỗ trợ localization cho View
	.AddDataAnnotationsLocalization(); // Thêm hỗ trợ localization cho DataAnnotation
									   // Add services to the container
builder.Services.AddScoped<IPdfService, PdfService>();
// Add CORS if needed
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAll", builder =>
	{
		builder.AllowAnyOrigin()
			   .AllowAnyMethod()
			   .AllowAnyHeader();
	});
});
// Cấu hình cookie Identity bằng ConfigureApplicationCookie (không AddCookie)
builder.Services.ConfigureApplicationCookie(opt =>
{
	opt.LoginPath = "/Account/Login";
	opt.AccessDeniedPath = "/Account/Denied";
	opt.SlidingExpiration = true;
	opt.ExpireTimeSpan = TimeSpan.FromDays(7);
});

// Thêm Localization
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
// Cấu hình RequestLocalizationOptions
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
	var supported = new[] { "vi", "en" };
	options.SetDefaultCulture("vi")
		.AddSupportedCultures(supported)
		.AddSupportedUICultures(supported);

	// Cấu hình các provider để detect ngôn ngữ

	options.RequestCultureProviders = new List<IRequestCultureProvider>
	{
		new CookieRequestCultureProvider(),      // Cookie
		new QueryStringRequestCultureProvider(), // ?culture=vi-VN
        new AcceptLanguageHeaderRequestCultureProvider() // Header
    };
});
// Đăng ký Authorization
builder.Services.AddAuthorization();

// Đăng ký TagHelper
var app = builder.Build();
if (!app.Environment.IsDevelopment())
{
	app.UseExceptionHandler("/Home/Error");// custom error page
	app.UseHsts();// 30 days HSTS
}

// Sử dụng Localization
// QUAN TRỌNG: UseRequestLocalization phải đặt trước UseRouting
var opts = new RequestLocalizationOptions()
	.SetDefaultCulture("vi")
	.AddSupportedCultures("vi", "en")
	.AddSupportedUICultures("vi", "en");
app.UseRequestLocalization(opts);
// Middleware
app.UseHttpsRedirection();
// Phục vụ file tĩnh từ wwwroot
app.UseStaticFiles();
// Kích hoạt routing
app.UseRouting();
// Xác thực & ủy quyền
app.UseAuthentication();
// Ủy quyền
app.UseAuthorization();
// Định nghĩa route mặc định
app.MapControllerRoute(
	name: "default",
	pattern: "{controller=Home}/{action=Index}/{id?}");

// Chạy ứng dụng
app.Run();
