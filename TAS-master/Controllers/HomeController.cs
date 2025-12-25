using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TAS.Controllers
{
	public class HomeController : Controller
	{
		CommonController commonController = new CommonController();
		public HomeController()
		{

		}
		// GET: Products
		public IActionResult Index()
		{
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
	}
}