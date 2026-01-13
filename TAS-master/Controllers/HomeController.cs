using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
		public IActionResult Index()
		{
			ViewData["Title"] = _common.GetValueByKey("key_tongquan");
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
		[Breadcrumb("key_map")]
		public IActionResult GeoJson()
		{
			ViewData["Title"] = _common.GetValueByKey("key_map");
			return View();
		}
	}
}