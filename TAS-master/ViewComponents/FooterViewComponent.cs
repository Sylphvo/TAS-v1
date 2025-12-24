using Microsoft.AspNetCore.Mvc;

namespace TAS.ViewComponents
{
	public class FooterViewComponent : ViewComponent
	{
		private readonly ILanguageService _lang;
		public FooterViewComponent(ILanguageService lang)
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
