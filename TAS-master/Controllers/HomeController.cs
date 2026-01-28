using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TAS.Resources;
using TAS.ViewModels;
using static Azure.Core.HttpHeader;

namespace TAS.Controllers
{
	[Authorize]
	public class HomeController : Controller
	{
		private readonly CommonModels _common;
		public HomeController(CommonModels common)
		{
			_common = common;
		}
		// GET: Products
		[Breadcrumb(nameof(Language.key_tongquan), "#", "", false)]
		public IActionResult Index()
		{
			ViewData["Title"] = Language.key_tongquan;
			ViewBag.TotalSystem = _common.TotalReportSystem();
			return View();
		}
		public IActionResult Layout()
		{
			return PartialView("_Layout");
		}
		public IActionResult utils()
		{	
			return View();
		}
		public IActionResult request()
		{
			return View();
		}
		public IActionResult response()
		{
			return View();
		}
		[Breadcrumb(nameof(Language.key_map), "#", nameof(Language.key_setting), true)]
		public IActionResult Map()
		{
			ViewData["Title"] = Language.key_map;
			return View();
		}
		[Breadcrumb(nameof(Language.key_icon), "#", nameof(Language.key_setting), true)]
		public IActionResult Icon()
		{
			ViewData["Title"] = Language.key_icon;
			return View();
		}
		//[Breadcrumb("key_menu")]
		//public IActionResult LoadMenu()
		//{
		//	ViewData["Title"] = _common.GetValueByKey("key_map");
		//	return View();
		//}
	}
}