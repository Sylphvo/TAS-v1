using Microsoft.AspNetCore.Mvc;

namespace TAS.ViewComponents
{
	public class BreadcrumbViewComponent : ViewComponent
	{
		private readonly ILanguageService _lang;
		public BreadcrumbViewComponent(ILanguageService lang)
		{
			_lang = lang;
		}
		public IViewComponentResult Invoke()
		{
			ViewBag.langCommon = _lang.GetUiCulture();
			return View();// Views/Shared/Components/Breadcrumb/Default.cshtml
		}
	}
}
