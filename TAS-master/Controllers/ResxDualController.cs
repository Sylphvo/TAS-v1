using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Xml.Linq;
using TAS.Data;
using TAS.Resources;
using TAS.TagHelpers;
using TAS.ViewModels;

namespace TAS.Controllers
{
	public class ResxDualController : Controller
	{
		private readonly CommonModels _common;
		private readonly string _viPath, _enPath, _defaultPath, _msgViewPath, fileName = "Language";
		public ResxDualController(IWebHostEnvironment env, CommonModels commonModels)
		{
			var root = Path.Combine(env.ContentRootPath, "Resources");
			_viPath = Path.Combine(root, fileName + ".vi.resx");
			_enPath = Path.Combine(root, fileName + ".en.resx");
			_defaultPath = Path.Combine(root, fileName + ".resx");
			_msgViewPath = Path.Combine(env.ContentRootPath, "Views", "Shared", "_Msg.cshtml");
			_common = commonModels;
		}
		[Breadcrumb(nameof(Language.key_ngonngu), "#", nameof(Language.key_setting), true)]
		public IActionResult LanguageManage()
		{
			ViewData["Title"] = _common.GetValueByKey("key_ngonngu");
			return View();
		}
		
		// GET list (merge 2 file)
		public IActionResult List()
		{
			var vi = LoadXml(_viPath);
			var en = LoadXml(_enPath);
			var viDict = vi.Elements("data")
				.ToDictionary(
					x => x.Attribute("name")!.Value,
					x => x.Element("value")!.Value
				);

			var enDict = en.Elements("data")
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
			var vi = LoadXml(_viPath); var en = LoadXml(_enPath); var defaultLanguage = LoadXml(_defaultPath);
			bool exist = vi.Elements("data").Any(x => x.Attribute("name")!.Value == req.key);

			if (exist)
				return BadRequest("Key đã tồn tại.");

			vi.Add(new XElement("data", new XAttribute("name", req.key ?? ""), new XElement("value", req.vi ?? "")));
			en.Add(new XElement("data", new XAttribute("name", req.key ?? ""), new XElement("value", req.en ?? "")));
			defaultLanguage.Add(new XElement("data", new XAttribute("name", req.key ?? ""), new XElement("value", req.en ?? "")));

			vi.Save(_viPath); en.Save(_enPath); defaultLanguage.Save(_defaultPath);
			RegenerateMsgFile();

			return Json(req);
		}

		// UPDATE
		[HttpPost]
		public IActionResult Update([FromBody] ResxDualItem req)
		{
			var vi = LoadXml(_viPath); var en = LoadXml(_enPath);var defaultLanguage = LoadXml(_defaultPath);
			// VI update
			var viNode = vi.Elements("data").FirstOrDefault(x => x.Attribute("name")!.Value == req.key);
			var defaultNode = defaultLanguage.Elements("data").FirstOrDefault(x => x.Attribute("name")!.Value == req.key);

			if (viNode != null)
				viNode.Element("value")!.Value = req.vi ?? "";
				defaultNode.Element("value")!.Value = req.vi ?? "";

			// EN update
			var enNode = en.Elements("data")
				.FirstOrDefault(x => x.Attribute("name")!.Value == req.key);

			if (enNode != null)
				enNode.Element("value")!.Value = req.en ?? "";

			vi.Save(_viPath); en.Save(_enPath); defaultLanguage.Save(_defaultPath);
			RegenerateMsgFile();

			return Json(req);
		}

		// DELETE
		[HttpPost]
		public IActionResult Delete([FromBody] ResxDualItem req)
		{
			var vi = LoadXml(_viPath); var en = LoadXml(_enPath); var defaultLanguage = LoadXml(_defaultPath);

			vi.Elements("data").Where(x => x.Attribute("name")!.Value == req.key).Remove();
			en.Elements("data").Where(x => x.Attribute("name")!.Value == req.key).Remove();
			defaultLanguage.Elements("data").Where(x => x.Attribute("name")!.Value == req.key).Remove();

			vi.Save(_viPath); en.Save(_enPath); defaultLanguage.Save(_defaultPath);
			RegenerateMsgFile();

			return Json(new { success = true });
		}
		public XElement LoadXml(string path) => XElement.Load(path);
		public void RegenerateMsgFile()
		{
			//BackupMsgFile();   // 🔥 luôn backup trước khi ghi

			var keys = GetAllKeys();  // sorted

			var sb = new System.Text.StringBuilder();

			sb.AppendLine(@"@using TAS.Resources");
			sb.AppendLine("<script>");
			sb.AppendLine("var arrMsg = {");
			foreach (var key in keys)
			{
				sb.AppendLine($"	{key}: '@Html.Raw(@Language.{key})',");
			}
			sb.AppendLine("};");
			sb.AppendLine("</script>");
			System.IO.File.WriteAllText(_msgViewPath, sb.ToString());
		}
		public List<string> GetAllKeys()
		{
			var vi = LoadXml(_viPath);
			var en = LoadXml(_enPath);

			var viKeys = vi.Elements("data").Select(x => x.Attribute("name")!.Value);
			var enKeys = en.Elements("data").Select(x => x.Attribute("name")!.Value);

			return viKeys.Union(enKeys).Distinct().OrderBy(x => x).ToList();
		}
	}
}
public class ResxDualItem
{
	public string? key { get; set; }
	public string? vi { get; set; }
	public string? en { get; set; }
}
