using Microsoft.AspNetCore.Mvc.Rendering;
using System.Xml.Linq;
using TAS.DTOs;
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
		private readonly string fileName = "Language";
		public CommonModels(ILogger<CommonModels> logger, IWebHostEnvironment env, ILanguageService lang)
		{
			var root = Path.Combine(env.ContentRootPath, "Resources");
			_dbHelper = new ConnectDbHelper();
			_logger = logger;
			_viPath = Path.Combine(root, fileName + ".vi.resx");
			_enPath = Path.Combine(root, fileName + ".en.resx");
			_msgViewPath = Path.Combine(env.ContentRootPath, fileName + ".cshtml");
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
                        AgentName AS [Text]
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
                        FarmerName AS [Text]
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
                        FarmerName AS [Text]
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
                        ISNULL(BuyerCompany, N'Chưa có tên') AS [Text]
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
                        PondName AS [Text]
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

		#endregion
		// ========================================
		// ComboBox Agent (Đại lý)
		// ========================================
		public List<TotalCommonSystem> TotalReportSystem()
		{
			try
			{
				var sql = @"
                    CREATE TABLE #ChartData (
						Type NVARCHAR(20),
						Label NVARCHAR(100),
						Color NVARCHAR(20),
						Total INT
					);
					INSERT INTO #ChartData
					SELECT 
					'AGENT',
					N'Tổng đại lý',
					'#4680FF',
					Total = COUNT(DISTINCT AgentCode)
					FROM RubberAgent 

					INSERT INTO #ChartData
					SELECT 
					'FARM',
					N'Tổng nhà vườn',
					'#E58A00',
					Total = COUNT(DISTINCT FarmCode)
					FROM RubberFarm 

					INSERT INTO #ChartData
					SELECT 
					'REPORTIN',
					N'Tổng nguyên liệu thu mua',
					'#2CA87F',
					Total = 5

					INSERT INTO #ChartData
					SELECT 
					'REPORTOUT',
					N'Tổng thành phẩm đã xuất',
					'#4680FF',
					Total = 5

					SELECT * FROM #ChartData
					DROP TABLE #ChartData
                ";

				var result = _dbHelper.Query<TotalCommonSystem>(sql);
				return result;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error in ComboAgent: {ex.Message}");
				return new List<TotalCommonSystem>();
			}
		}
	}
}
