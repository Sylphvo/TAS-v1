using Microsoft.AspNetCore.Mvc.Rendering;
using System.Xml.Linq;
using TAS.Helpers;
using TAS.Models;
using TAS.TagHelpers;
using static Azure.Core.HttpHeader;

namespace TAS.ViewModels
{
	public class CommonModels
	{
		ConnectDbHelper _dbHelper;
		private readonly ILogger<CommonModels> _logger;
		private readonly string _viPath;
		private readonly string _enPath;
		private readonly string _msgViewPath;
		private readonly ILanguageService _lang;
		public CommonModels(ILogger<CommonModels> logger, IWebHostEnvironment env, ILanguageService lang)
		{
			var root = Path.Combine(env.ContentRootPath, "Resources", "Views", "Shared");
			_dbHelper = new ConnectDbHelper();
			_logger = logger;
			_viPath = Path.Combine(root, "_Msg.vi.resx");
			_enPath = Path.Combine(root, "_Msg.en.resx");
			_msgViewPath = Path.Combine(env.ContentRootPath, "Views", "Shared", "_Msg.cshtml");
			_lang = lang;
		}

		// ========================================
		// ComboBox Agent (Đại lý)
		// ========================================
		public List<SelectListItem> ComboAgent()
		{
			try
			{
				var sql = @"
                    SELECT 
                        AgentCode AS [Value],
                        CONCAT(AgentCode, ' - ', AgentName) AS [Text]
                    FROM RubberAgent
                    WHERE IsActive = 1
                    ORDER BY AgentCode
                ";

				var result = _dbHelper.Query<SelectListItem>(sql);
				return result ?? new List<SelectListItem>();
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error in ComboAgent: {ex.Message}");
				return new List<SelectListItem>();
			}
		}

		// ========================================
		// ComboBox Farm (Nhà vườn)
		// ========================================
		public List<SelectListItem> ComboFarmCode()
		{
			try
			{
				var sql = @"
                    SELECT 
                        FarmCode AS [Value],
                        CONCAT(FarmCode, ' - ', FarmerName) AS [Text]
                    FROM RubberFarm
                    WHERE IsActive = 1
                    ORDER BY FarmCode
                ";

				var result = _dbHelper.Query<SelectListItem>(sql);
				return result ?? new List<SelectListItem>();
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error in ComboFarmCode: {ex.Message}");
				return new List<SelectListItem>();
			}
		}

		// ========================================
		// ComboBox Farm by Agent
		// ========================================
		public List<SelectListItem> ComboFarmCodeByAgent(string agentCode)
		{
			try
			{
				var sql = @"
                    SELECT 
                        FarmCode AS [Value],
                        CONCAT(FarmCode, ' - ', FarmerName) AS [Text]
                    FROM RubberFarm
                    WHERE IsActive = 1
                        AND AgentCode = @AgentCode
                    ORDER BY FarmCode
                ";

				var result = _dbHelper.Query<SelectListItem>(sql, new { AgentCode = agentCode });
				return result ?? new List<SelectListItem>();
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error in ComboFarmCodeByAgent: {ex.Message}");
				return new List<SelectListItem>();
			}
		}

		// ========================================
		// ComboBox Order (Đơn hàng)
		// ========================================
		public List<SelectListItem> ComboOrderCode()
		{
			try
			{
				var sql = @"
                    SELECT 
                        OrderCode AS [Value],
                        CONCAT(OrderCode, ' - ', ISNULL(BuyerCompany, N'Chưa có tên')) AS [Text]
                    FROM RubberOrder
                    WHERE Status IN (1, 2)  -- Mới hoặc Đang xử lý
                    ORDER BY OrderDate DESC, OrderCode DESC
                ";

				var result = _dbHelper.Query<SelectListItem>(sql);
				return result ?? new List<SelectListItem>();
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error in ComboOrderCode: {ex.Message}");
				return new List<SelectListItem>();
			}
		}

		// ========================================
		// ComboBox Pond (Hồ)
		// ========================================
		public List<SelectListItem> ComboPondCode()
		{
			try
			{
				var sql = @"
                    SELECT 
                        PondCode AS [Value],
                        CONCAT(PondCode, ' - ', PondName) AS [Text]
                    FROM RubberPond
                    WHERE Status = 1  -- Sẵn sàng
                    ORDER BY PondCode
                ";

				var result = _dbHelper.Query<SelectListItem>(sql);
				return result ?? new List<SelectListItem>();
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error in ComboPondCode: {ex.Message}");
				return new List<SelectListItem>();
			}
		}

		// ========================================
		// ComboBox Status
		// ========================================
		public List<SelectListItem> ComboStatus()
		{
			return new List<SelectListItem>
			{
				new SelectListItem { Value = "0", Text = "Chưa duyệt" },
				new SelectListItem { Value = "1", Text = "Chờ xử lý" },
				new SelectListItem { Value = "2", Text = "Đã vào hồ" },
				new SelectListItem { Value = "3", Text = "Hoàn thành" }
			};
		}

		// ========================================
		// Get Agent Name by Code
		// ========================================
		public string GetAgentName(string agentCode)
		{
			try
			{
				var sql = "SELECT AgentName FROM RubberAgent WHERE AgentCode = @AgentCode";
				return _dbHelper.QueryFirstOrDefault<string>(sql, new { AgentCode = agentCode }) ?? string.Empty;
			}
			catch
			{
				return string.Empty;
			}
		}

		// ========================================
		// Get Farm Name by Code
		// ========================================
		public string GetFarmName(string farmCode)
		{
			try
			{
				var sql = "SELECT FarmerName FROM RubberFarm WHERE FarmCode = @FarmCode";
				return _dbHelper.QueryFirstOrDefault<string>(sql, new { FarmCode = farmCode }) ?? string.Empty;
			}
			catch
			{
				return string.Empty;
			}
		}
		#region Resx Dual Language
		public List<string> GetAllKeys()
		{
			var vi = LoadXml(_viPath);
			var en = LoadXml(_enPath);

			var viKeys = vi.Elements("data").Select(x => x.Attribute("name")!.Value);
			var enKeys = en.Elements("data").Select(x => x.Attribute("name")!.Value);

			return viKeys.Union(enKeys).Distinct().OrderBy(x => x).ToList();
		}
		public string? GetValueByKey(string key)
		{
			string culture = _lang.GetUiCulture();
			var path = culture.ToLower() == "vi" ? _viPath : _enPath;
			var xml = LoadXml(path);
			var node = xml.Elements("data")
				.FirstOrDefault(x => x.Attribute("name")!.Value == key);
			return node?.Element("value")!.Value;
		}
		// Load file
		public XElement LoadXml(string path) => XElement.Load(path);
		public XElement LoadXmlvi() => XElement.Load(_viPath);
		public XElement LoadXmlen() => XElement.Load(_enPath);
		// Save file
		public void SaveXml() {
			LoadXmlvi().Save(_viPath);
			LoadXmlen().Save(_enPath);
		}
		public void RegenerateMsgFile()
		{
			//BackupMsgFile();   // 🔥 luôn backup trước khi ghi

			var keys = GetAllKeys();  // sorted

			var sb = new System.Text.StringBuilder();

			sb.AppendLine(@"@using Microsoft.Extensions.Localization
@inject Microsoft.Extensions.Localization.IStringLocalizer<TAS.Resources.SharedResource> localizerShared
@inject Microsoft.AspNetCore.Mvc.Localization.IViewLocalizer localizer
			");
			sb.AppendLine("<script>");
			sb.AppendLine("var arrMsg = {");

			foreach (var key in keys)
			{
				sb.AppendLine($"	{key}: '@localizer[\"{key}\"]',");
			}

			sb.AppendLine("};");
			sb.AppendLine("document.querySelectorAll(\"[data-i18n]\").forEach(el => {\r\n\tconst key = el.getAttribute(\"data-i18n\");\r\n\tif (arrMsg[key]) {\r\n\t\tel.textContent = arrMsg[key];\r\n\t}\r\n});");
			sb.AppendLine("</script>");
			System.IO.File.WriteAllText(_msgViewPath, sb.ToString());
		}
		#endregion
	}
}
