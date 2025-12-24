using Microsoft.AspNetCore.Mvc;
using System.Xml.Linq;
using TAS.Data;
using TAS.ViewModels;

namespace TAS.Controllers
{
	public class ResxDualController : Controller
	{
		private readonly CommonModels _common;
		private readonly XElement _viXml;
		private readonly XElement _enXml;
		public ResxDualController(IWebHostEnvironment env)
		{
			var root = Path.Combine(env.ContentRootPath, "Resources", "Views", "Shared");
			_viXml = _common.LoadXmlvi();
			_enXml = _common.LoadXmlen();
		}
		[Breadcrumb("key_ngonngu")]
		public IActionResult LanguageManage()
		{
			return View();
		}
		
		// GET list (merge 2 file)
		public IActionResult List()
		{
			var viDict = _viXml.Elements("data")
				.ToDictionary(
					x => x.Attribute("name")!.Value,
					x => x.Element("value")!.Value
				);

			var enDict = _enXml.Elements("data")
				.ToDictionary(
					x => x.Attribute("name")!.Value,
					x => x.Element("value")!.Value
				);

			var keys = viDict.Keys.Union(enDict.Keys).Distinct();

			var list = keys.Select(k => new
			{
				key = k,
				vi = viDict.ContainsKey(k) ? viDict[k] : "",
				en = enDict.ContainsKey(k) ? enDict[k] : ""
			});

			return Json(list);
		}

		// CREATE
		[HttpPost]
		public IActionResult Create([FromBody] ResxDualItem req)
		{
			bool exist = _viXml.Elements("data")
				.Any(x => x.Attribute("name")!.Value == req.key);

			if (exist)
				return BadRequest("Key đã tồn tại.");

			_viXml.Add(new XElement("data",
				new XAttribute("name", req.key ?? ""),
				new XElement("value", req.vi ?? "")
			));
			_enXml.Add(new XElement("data",
				new XAttribute("name", req.key ?? ""),
				new XElement("value", req.en ?? "")
			));

			_common.SaveXml();
			_common.RegenerateMsgFile();

			return Json(req);
		}

		// UPDATE
		[HttpPost]
		public IActionResult Update([FromBody] ResxDualItem req)
		{
			// VI update
			var viNode = _viXml.Elements("data")
				.FirstOrDefault(x => x.Attribute("name")!.Value == req.key);

			if (viNode != null)
				viNode.Element("value")!.Value = req.vi ?? "";

			// EN update
			var enNode = _enXml.Elements("data")
				.FirstOrDefault(x => x.Attribute("name")!.Value == req.key);

			if (enNode != null)
				enNode.Element("value")!.Value = req.en ?? "";

			_common.SaveXml();
			_common.RegenerateMsgFile();
			return Json(req);
		}

		// DELETE
		[HttpPost]
		public IActionResult Delete([FromBody] ResxDualItem req)
		{
			_viXml.Elements("data")
				.Where(x => x.Attribute("name")!.Value == req.key)
				.Remove();

			_enXml.Elements("data")
				.Where(x => x.Attribute("name")!.Value == req.key)
				.Remove();
			_common.SaveXml();
			_common.RegenerateMsgFile();
			return Json(new { success = true });
		}
	}
}
public class ResxDualItem
{
	public string? key { get; set; }
	public string? vi { get; set; }
	public string? en { get; set; }
}
