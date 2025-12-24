using Microsoft.AspNetCore.Mvc;

namespace TAS.ViewComponents
{
	public class HeaderViewComponent : ViewComponent
	{
		private readonly ILanguageService _lang;
		public HeaderViewComponent(ILanguageService lang)
		{
			_lang = lang;
		}
		public IViewComponentResult Invoke()
		{
			ViewBag.langCommon = _lang.GetUiCulture();
			return View();// Views/Shared/Components/Header/Default.cshtml
		}
	}
}
