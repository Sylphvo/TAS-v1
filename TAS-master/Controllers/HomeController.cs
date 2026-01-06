using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TAS.Controllers
{
	[Authorize]
	public class HomeController : Controller
	{
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