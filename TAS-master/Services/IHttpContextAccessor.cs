using Microsoft.AspNetCore.Localization;
using System.Globalization;

public interface ILanguageService
{
	string GetUiCulture();
}

public sealed class LanguageService : ILanguageService
{
	private readonly IHttpContextAccessor _http;
	public LanguageService(IHttpContextAccessor http) { _http = http; }

	public string GetUiCulture()
	{
		var ctx = _http.HttpContext;
		if (ctx == null) return "vi";

		// 1) Thử feature (chuẩn nhất)
		var feature = ctx.Features.Get<IRequestCultureFeature>();
		var ui = feature?.RequestCulture.UICulture?.Name;
		if (!string.IsNullOrEmpty(ui)) return ui;

		// 2) Thử cookie .AspNetCore.Culture
		var ck = ctx.Request.Cookies[CookieRequestCultureProvider.DefaultCookieName];
		if (!string.IsNullOrEmpty(ck))
		{
			var parsed = CookieRequestCultureProvider.ParseCookieValue(ck);
			var fromUi = parsed?.UICultures?.FirstOrDefault().Value;
			if (!string.IsNullOrEmpty(fromUi)) return fromUi;
			var fromC = parsed?.Cultures?.FirstOrDefault().Value;
			if (!string.IsNullOrEmpty(fromC)) return fromC;
		}

		// 3) Thử header Accept-Language
		var header = ctx.Request.Headers.AcceptLanguage.ToString();
		if (!string.IsNullOrWhiteSpace(header))
		{
			var first = header.Split(',')[0].Trim();
			if (!string.IsNullOrEmpty(first)) return first switch
			{
				"vi" => "vi",
				"en" => "en",
				_ => first
			};
		}

		// 4) Fallback theo thread (đã được middleware set nếu chạy đúng)
		return CultureInfo.CurrentUICulture.Name;
	}
}
