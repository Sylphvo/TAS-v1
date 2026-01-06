using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using TAS.ViewModels;
using static Azure.Core.HttpHeader;

namespace TAS.Controllers
{
	public class CommonController : Controller
	{
		private readonly CommonModels _common;
		public CommonController(CommonModels common)
		{
			_common = common;
		}
		//Set cookie language
		public IActionResult SetLanguageCookie(string culture, string returnUrl)
		{
			var cookieValue = CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture));
			Response.Cookies.Append(
				CookieRequestCultureProvider.DefaultCookieName,
				cookieValue,
				new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
			);
			return LocalRedirect(returnUrl);
		}
		public IActionResult GetAllCombos()
		{
			try
			{
				return Json(new
				{
					success = true,
					comboAgent = _common.ComboAgent(),
					comboFarmCode = _common.ComboFarmCode(),
					comboOrder = _common.ComboOrderCode()
				});
			}
			catch (Exception ex)
			{
				return Json(new { success = false, message = ex.Message });
			}
		}
	}
}
