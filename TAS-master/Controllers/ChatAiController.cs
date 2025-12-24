using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
namespace TAS.Controllers
{
	public class ChatAiController : Controller
	{
		private readonly IHttpClientFactory _httpClientFactory;
		private readonly IConfiguration _configuration;

		public ChatAiController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
		{
			_httpClientFactory = httpClientFactory;
			_configuration = configuration;
		}

		[HttpPost]
		public IActionResult ChatRequest([FromBody] ChatRequest request)
		{
			try
			{
				var apiKey = _configuration["Gemini:ApiKey"];
				if (string.IsNullOrEmpty(apiKey))
				{
					return StatusCode(500, new { response = "API key chưa được cấu hình." });
				}

				// 1. PHÂN TÍCH Ý ĐỊNH của người dùng
				var intent = AnalyzeIntent(request.Message!);

				// 2. Nếu là hành động cụ thể, thực thi action
				if (intent.IsAction)
				{
					var actionResult = ExecuteAction(intent, request);
					return Ok(new { response = actionResult });
				}

				// 3. Nếu là câu hỏi thông thường, gọi AI
				var aiResponse = CallGeminiAI(request);
				return Ok(new { response = aiResponse });
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error: {ex.Message}");
				return StatusCode(500, new { response = $"Lỗi: {ex.Message}" });
			}
		}
		#region PHÂN TÍCH Ý ĐỊNH

		private UserIntent AnalyzeIntent(string message)
		{
			var intent = new UserIntent { OriginalMessage = message };
			var lowerMsg = message.ToLower();

			// ============ QUẢN LÝ NHẬP LIỆU MỦ ============

			// Nhập dữ liệu mua mủ
			if (Regex.IsMatch(lowerMsg, @"(nhập|thêm|tạo|ghi nhận)\s+(dữ liệu|số liệu|đơn|mủ|mua)"))
			{
				intent.IsAction = true;
				intent.Action = "CREATE_PURCHASE";
				intent.Entity = "PurchaseData";
				intent.Data = ExtractPurchaseData(message);
				return intent;
			}

			// Sửa dữ liệu mua mủ
			if (Regex.IsMatch(lowerMsg, @"(sửa|cập nhật|chỉnh)\s+(dữ liệu|số liệu|đơn|mủ)"))
			{
				intent.IsAction = true;
				intent.Action = "UPDATE_PURCHASE";
				intent.Entity = "PurchaseData";
				intent.Data = ExtractPurchaseData(message);
				return intent;
			}

			// Xóa dữ liệu
			if (Regex.IsMatch(lowerMsg, @"(xóa|xoá|hủy)\s+(dữ liệu|số liệu|đơn|mủ)"))
			{
				intent.IsAction = true;
				intent.Action = "DELETE_PURCHASE";
				intent.Entity = "PurchaseData";
				intent.Data = ExtractPurchaseData(message);
				return intent;
			}

			// ============ QUẢN LÝ ĐẠI LÝ (AGENT) ============

			// Thêm đại lý
			if (Regex.IsMatch(lowerMsg, @"(thêm|tạo|thêm mới)\s+(đại lý|agent)"))
			{
				intent.IsAction = true;
				intent.Action = "CREATE_AGENT";
				intent.Entity = "Agent";
				intent.Data = ExtractAgentData(message);
				return intent;
			}

			// Sửa đại lý
			if (Regex.IsMatch(lowerMsg, @"(sửa|cập nhật|chỉnh)\s+(đại lý|agent)"))
			{
				intent.IsAction = true;
				intent.Action = "UPDATE_AGENT";
				intent.Entity = "Agent";
				intent.Data = ExtractAgentData(message);
				return intent;
			}

			// Xóa đại lý
			if (Regex.IsMatch(lowerMsg, @"(xóa|xoá)\s+(đại lý|agent)"))
			{
				intent.IsAction = true;
				intent.Action = "DELETE_AGENT";
				intent.Entity = "Agent";
				intent.Data = ExtractAgentData(message);
				return intent;
			}

			// ============ QUẢN LÝ NHÀ VƯỜN ============

			// Thêm nhà vườn
			if (Regex.IsMatch(lowerMsg, @"(thêm|tạo|thêm mới)\s+(nhà vườn|vườn)"))
			{
				intent.IsAction = true;
				intent.Action = "CREATE_FARM";
				intent.Entity = "Farm";
				intent.Data = ExtractFarmData(message);
				return intent;
			}

			// Sửa nhà vườn
			if (Regex.IsMatch(lowerMsg, @"(sửa|cập nhật|chỉnh)\s+(nhà vườn|vườn)"))
			{
				intent.IsAction = true;
				intent.Action = "UPDATE_FARM";
				intent.Entity = "Farm";
				intent.Data = ExtractFarmData(message);
				return intent;
			}

			// Xóa nhà vườn
			if (Regex.IsMatch(lowerMsg, @"(xóa|xoá)\s+(nhà vườn|vườn)"))
			{
				intent.IsAction = true;
				intent.Action = "DELETE_FARM";
				intent.Entity = "Farm";
				intent.Data = ExtractFarmData(message);
				return intent;
			}

			// ============ TRA CỨU & BÁO CÁO ============

			// Xem danh sách
			if (Regex.IsMatch(lowerMsg, @"(xem|hiển thị|danh sách|list)\s+(đại lý|nhà vườn|dữ liệu|đơn)"))
			{
				intent.IsAction = true;
				intent.Action = "LIST";
				intent.Entity = ExtractEntityType(lowerMsg);
				return intent;
			}

			// Tìm kiếm
			if (Regex.IsMatch(lowerMsg, @"(tìm|tra cứu|tìm kiếm|search)\s+(đại lý|nhà vườn|dữ liệu)"))
			{
				intent.IsAction = true;
				intent.Action = "SEARCH";
				intent.Entity = ExtractEntityType(lowerMsg);
				intent.Data = ExtractSearchData(message);
				return intent;
			}

			// Thống kê / Báo cáo
			if (Regex.IsMatch(lowerMsg, @"(thống kê|báo cáo|tổng|doanh thu)"))
			{
				intent.IsAction = true;
				intent.Action = "REPORT";
				intent.Data = ExtractReportData(message);
				return intent;
			}

			return intent;
		}
		private string ExtractEntityType(string message)
		{
			if (message.Contains("đại lý") || message.Contains("agent")) return "Agent";
			if (message.Contains("nhà vườn") || message.Contains("vườn") || message.Contains("farm")) return "Farm";
			if (message.Contains("dữ liệu") || message.Contains("đơn") || message.Contains("mủ")) return "PurchaseData";
			return "Unknown";
		}
		private Dictionary<string, string> ExtractPurchaseData(string message)
		{
			var data = new Dictionary<string, string>();

			// Mã nhà vườn (VD: NV_1, NV_5)
			var farmCodeMatch = Regex.Match(message, @"(NV_\d+|mã\s+vườn\s+(\w+))", RegexOptions.IgnoreCase);
			if (farmCodeMatch.Success)
				data["farmCode"] = farmCodeMatch.Value.Replace("mã vườn", "").Trim();

			// Tên nhà vườn
			var farmNameMatch = Regex.Match(message, @"(nhà vườn|vườn)\s+([^\d,]+)", RegexOptions.IgnoreCase);
			if (farmNameMatch.Success)
				data["farmName"] = farmNameMatch.Groups[2].Value.Trim();

			// Khối lượng (TSC)
			var weightMatch = Regex.Match(message, @"(\d+\.?\d*)\s*(kg|ký|tấn)", RegexOptions.IgnoreCase);
			if (weightMatch.Success)
				data["weight"] = weightMatch.Groups[1].Value;

			// Thành phẩm
			var productMatch = Regex.Match(message, @"thành phẩm\s+(\d+\.?\d*)", RegexOptions.IgnoreCase);
			if (productMatch.Success)
				data["product"] = productMatch.Groups[1].Value;

			// Số thứ tự
			var idMatch = Regex.Match(message, @"(số|id|stt)\s+(\d+)", RegexOptions.IgnoreCase);
			if (idMatch.Success)
				data["id"] = idMatch.Groups[2].Value;

			return data;
		}
		private string ExtractEntity(string message)
		{
			if (message.Contains("sản phẩm") || message.Contains("product")) return "Product";
			if (message.Contains("khách hàng") || message.Contains("customer")) return "Customer";
			if (message.Contains("đơn hàng") || message.Contains("order")) return "Order";
			if (message.Contains("user") || message.Contains("người dùng")) return "User";
			if (message.Contains("bài viết") || message.Contains("post")) return "Post";
			return "Unknown";
		}

		private Dictionary<string, string> ExtractDataFromMessage(string message)
		{
			var data = new Dictionary<string, string>();

			// Trích xuất tên
			var nameMatch = Regex.Match(message, @"tên\s+[""']?([^""',]+)[""']?", RegexOptions.IgnoreCase);
			if (nameMatch.Success)
				data["name"] = nameMatch.Groups[1].Value.Trim();

			// Trích xuất giá
			var priceMatch = Regex.Match(message, @"giá\s+(\d+)", RegexOptions.IgnoreCase);
			if (priceMatch.Success)
				data["price"] = priceMatch.Groups[1].Value;

			// Trích xuất email
			var emailMatch = Regex.Match(message, @"email\s+([^\s,]+)", RegexOptions.IgnoreCase);
			if (emailMatch.Success)
				data["email"] = emailMatch.Groups[1].Value;

			// Trích xuất ID
			var idMatch = Regex.Match(message, @"id\s+(\d+)", RegexOptions.IgnoreCase);
			if (idMatch.Success)
				data["id"] = idMatch.Groups[1].Value;

			return data;
		}

		#endregion

		#region THỰC THI HÀNH ĐỘNG

		private string ExecuteAction(UserIntent intent, ChatRequest request)
		{
			try
			{
				switch (intent.Action)
				{
					case "CREATE":
						return CreateEntity(intent);

					case "UPDATE":
						return UpdateEntity(intent);

					case "DELETE":
						return DeleteEntity(intent);

					case "READ":
						return ReadEntity(intent);

					default:
						return "Xin lỗi, tôi chưa hiểu yêu cầu của bạn.";
				}
			}
			catch (Exception ex)
			{
				return $"❌ Lỗi khi thực thi: {ex.Message}";
			}
		}

		private string CreateEntity(UserIntent intent)
		{
			// TODO: Thay thế bằng code thực tế của bạn
			switch (intent.Entity)
			{
				case "Product":
					// VÍ DỤ: Tạo sản phẩm
					var productName = intent.Data.GetValueOrDefault("name", "Sản phẩm mới");
					var price = intent.Data.GetValueOrDefault("price", "0");

					// await _context.Products.AddAsync(new Product { 
					//     Name = productName, 
					//     Price = decimal.Parse(price) 
					// });
					// await _context.SaveChangesAsync();

					return $"✅ Đã tạo sản phẩm '{productName}' với giá {price}đ thành công!";

				case "Customer":
					var customerName = intent.Data.GetValueOrDefault("name", "Khách hàng mới");
					var email = intent.Data.GetValueOrDefault("email", "");

					// TODO: Thêm vào database
					return $"✅ Đã tạo khách hàng '{customerName}' (Email: {email}) thành công!";

				case "Order":
					return "✅ Đã tạo đơn hàng mới thành công!";

				default:
					return $"❌ Chưa hỗ trợ tạo {intent.Entity}";
			}
		}

		private string UpdateEntity(UserIntent intent)
		{
			switch (intent.Entity)
			{
				case "Product":
					var id = intent.Data.GetValueOrDefault("id", "0");
					var newName = intent.Data.GetValueOrDefault("name", "");

					// TODO: Cập nhật database
					// var product = await _context.Products.FindAsync(int.Parse(id));
					// if (product != null) {
					//     product.Name = newName;
					//     await _context.SaveChangesAsync();
					// }

					return $"✅ Đã cập nhật sản phẩm ID {id} thành công!";

				case "Customer":
					return "✅ Đã cập nhật thông tin khách hàng!";

				default:
					return $"❌ Chưa hỗ trợ cập nhật {intent.Entity}";
			}
		}

		private string DeleteEntity(UserIntent intent)
		{
			var id = intent.Data.GetValueOrDefault("id", "0");

			switch (intent.Entity)
			{
				case "Product":
					// TODO: Xóa khỏi database
					// var product = await _context.Products.FindAsync(int.Parse(id));
					// if (product != null) {
					//     _context.Products.Remove(product);
					//     await _context.SaveChangesAsync();
					// }

					return $"✅ Đã xóa sản phẩm ID {id} thành công!";

				default:
					return $"❌ Chưa hỗ trợ xóa {intent.Entity}";
			}
		}

		private string ReadEntity(UserIntent intent)
		{
			switch (intent.Entity)
			{
				case "Product":
					// TODO: Lấy từ database
					// var products = await _context.Products.Take(5).ToListAsync();
					// var productList = string.Join("\n", products.Select(p => $"• {p.Name} - {p.Price}đ"));

					var sampleProducts = @"📦 Danh sách sản phẩm:
• Laptop Dell XPS 13 - 25,000,000đ
• iPhone 15 Pro Max - 32,000,000đ
• AirPods Pro - 6,500,000đ
• Samsung Galaxy S24 - 22,000,000đ
• MacBook Pro M3 - 45,000,000đ";

					return sampleProducts;

				case "Customer":
					return @"👥 Danh sách khách hàng:
• Nguyễn Văn A - nguyenvana@email.com
• Trần Thị B - tranthib@email.com
• Lê Văn C - levanc@email.com";

				case "Order":
					return @"📋 Danh sách đơn hàng:
• ĐH001 - Nguyễn Văn A - 25,000,000đ - Đang xử lý
• ĐH002 - Trần Thị B - 32,000,000đ - Đã giao
• ĐH003 - Lê Văn C - 6,500,000đ - Chờ xác nhận";

				default:
					return $"❌ Chưa hỗ trợ tra cứu {intent.Entity}";
			}
		}
		private Dictionary<string, string> ExtractAgentData(string message)
		{
			var data = new Dictionary<string, string>();

			// Mã đại lý
			var codeMatch = Regex.Match(message, @"(mã|code)\s+([A-Z0-9_]+)", RegexOptions.IgnoreCase);
			if (codeMatch.Success)
				data["code"] = codeMatch.Groups[2].Value;

			// Tên
			var nameMatch = Regex.Match(message, @"(tên|name)\s+([^\d,]+)", RegexOptions.IgnoreCase);
			if (nameMatch.Success)
				data["name"] = nameMatch.Groups[2].Value.Trim();

			// Loại nguyên liệu
			var materialMatch = Regex.Match(message, @"(mủ nước|mủ tạp|latex)", RegexOptions.IgnoreCase);
			if (materialMatch.Success)
				data["material"] = materialMatch.Groups[1].Value;

			return data;
		}

		private Dictionary<string, string> ExtractFarmData(string message)
		{
			var data = new Dictionary<string, string>();

			// Mã nhà vườn
			var codeMatch = Regex.Match(message, @"(NV_\d+|mã\s+([A-Z0-9_]+))", RegexOptions.IgnoreCase);
			if (codeMatch.Success)
				data["code"] = codeMatch.Value.Replace("mã", "").Trim();

			// Tên nhà vườn
			var nameMatch = Regex.Match(message, @"(tên|name)\s+([^\d,]+)", RegexOptions.IgnoreCase);
			if (nameMatch.Success)
				data["name"] = nameMatch.Groups[2].Value.Trim();

			// Khối lượng
			var capacityMatch = Regex.Match(message, @"(khối lượng|capacity)\s+(\d+)", RegexOptions.IgnoreCase);
			if (capacityMatch.Success)
				data["capacity"] = capacityMatch.Groups[2].Value;

			return data;
		}

		private Dictionary<string, string> ExtractSearchData(string message)
		{
			var data = new Dictionary<string, string>();

			// Tên
			var nameMatch = Regex.Match(message, @"tên\s+([^\d,]+)", RegexOptions.IgnoreCase);
			if (nameMatch.Success)
				data["name"] = nameMatch.Groups[1].Value.Trim();

			// Mã
			var codeMatch = Regex.Match(message, @"mã\s+([A-Z0-9_]+)", RegexOptions.IgnoreCase);
			if (codeMatch.Success)
				data["code"] = codeMatch.Groups[1].Value;

			return data;
		}

		private Dictionary<string, string> ExtractReportData(string message)
		{
			var data = new Dictionary<string, string>();

			// Thời gian
			if (message.Contains("hôm nay")) data["period"] = "today";
			if (message.Contains("tuần này")) data["period"] = "week";
			if (message.Contains("tháng này")) data["period"] = "month";

			// Đại lý
			var agentMatch = Regex.Match(message, @"đại lý\s+([^\d,]+)", RegexOptions.IgnoreCase);
			if (agentMatch.Success)
				data["agent"] = agentMatch.Groups[1].Value.Trim();

			return data;
		}
		private string ExecuteAction(UserIntent intent)
		{
			try
			{
				switch (intent.Action)
				{
					// ============ NHẬP LIỆU MỦ ============
					case "CREATE_PURCHASE":
						return CreatePurchaseRecord(intent);

					case "UPDATE_PURCHASE":
						return UpdatePurchaseRecord(intent);

					case "DELETE_PURCHASE":
						return DeletePurchaseRecord(intent);

					// ============ QUẢN LÝ ĐẠI LÝ ============
					case "CREATE_AGENT":
						return CreateAgent(intent);

					case "UPDATE_AGENT":
						return UpdateAgent(intent);

					case "DELETE_AGENT":
						return DeleteAgent(intent);

					// ============ QUẢN LÝ NHÀ VƯỜN ============
					case "CREATE_FARM":
						return CreateFarm(intent);

					case "UPDATE_FARM":
						return UpdateFarm(intent);

					case "DELETE_FARM":
						return DeleteFarm(intent);

					// ============ TRA CỨU ============
					case "LIST":
						return ListRecords(intent);

					case "SEARCH":
						return SearchRecords(intent);

					case "REPORT":
						return GenerateReport(intent);

					default:
						return "❓ Xin lỗi, tôi chưa hiểu yêu cầu của bạn. Bạn có thể nói rõ hơn được không?";
				}
			}
			catch (Exception ex)
			{
				return $"❌ Lỗi khi thực thi: {ex.Message}";
			}
		}
		// ============ NHẬP LIỆU MỦ ============

		private string CreatePurchaseRecord(UserIntent intent)
		{
			var farmCode = intent.Data.GetValueOrDefault("farmCode", "");
			var farmName = intent.Data.GetValueOrDefault("farmName", "");
			var weight = intent.Data.GetValueOrDefault("weight", "0");
			var product = intent.Data.GetValueOrDefault("product", "0");

			// TODO: Thêm vào database
			// var record = new PurchaseData {
			//     FarmCode = farmCode,
			//     FarmName = farmName,
			//     Weight = decimal.Parse(weight),
			//     Product = decimal.Parse(product),
			//     CreatedDate = DateTime.Now,
			//     CreatedBy = "admin"
			// };
			// await _context.PurchaseData.AddAsync(record);
			// await _context.SaveChangesAsync();

			return $@"✅ **Đã ghi nhận dữ liệu mua mủ thành công!**

📋 Thông tin:
• Mã nhà vườn: {farmCode}
• Tên nhà vườn: {farmName}
• Khối lượng (TSC): {weight} kg
• Thành phẩm: {product} kg
• Thời gian: {DateTime.Now:dd/MM/yyyy HH:mm}

Dữ liệu đã được lưu vào hệ thống.";
		}

		private string UpdatePurchaseRecord(UserIntent intent)
		{
			var id = intent.Data.GetValueOrDefault("id", "0");

			// TODO: Cập nhật database

			return $@"✅ **Đã cập nhật dữ liệu số {id} thành công!**

Thông tin đã được cập nhật trong hệ thống.";
		}

		private string DeletePurchaseRecord(UserIntent intent)
		{
			var id = intent.Data.GetValueOrDefault("id", "0");

			// TODO: Xóa khỏi database

			return $@"✅ **Đã xóa dữ liệu số {id} thành công!**

⚠️ Lưu ý: Dữ liệu đã xóa không thể khôi phục.";
		}

		// ============ QUẢN LÝ ĐẠI LÝ ============

		private string CreateAgent(UserIntent intent)
		{
			var code = intent.Data.GetValueOrDefault("code", "");
			var name = intent.Data.GetValueOrDefault("name", "");
			var material = intent.Data.GetValueOrDefault("material", "Mủ nước");

			// TODO: Thêm vào database

			return $@"✅ **Đã thêm đại lý mới thành công!**

📋 Thông tin đại lý:
• Mã đại lý: {code}
• Tên: {name}
• Loại nguyên liệu: {material}
• Ngày tạo: {DateTime.Now:dd/MM/yyyy}";
		}

		private string UpdateAgent(UserIntent intent)
		{
			var code = intent.Data.GetValueOrDefault("code", "");

			return $@"✅ **Đã cập nhật thông tin đại lý {code} thành công!**";
		}

		private string DeleteAgent(UserIntent intent)
		{
			var code = intent.Data.GetValueOrDefault("code", "");

			return $@"✅ **Đã xóa đại lý {code} thành công!**

⚠️ Lưu ý: Tất cả dữ liệu liên quan đến đại lý này sẽ bị ảnh hưởng.";
		}

		// ============ QUẢN LÝ NHÀ VƯỜN ============

		private string CreateFarm(UserIntent intent)
		{
			var code = intent.Data.GetValueOrDefault("code", "");
			var name = intent.Data.GetValueOrDefault("name", "");
			var capacity = intent.Data.GetValueOrDefault("capacity", "47");

			return $@"✅ **Đã thêm nhà vườn mới thành công!**

📋 Thông tin nhà vườn:
• Mã nhà vườn: {code}
• Tên: {name}
• Khối lượng: {capacity}
• Ngày tạo: {DateTime.Now:dd/MM/yyyy}";
		}

		private string UpdateFarm(UserIntent intent)
		{
			var code = intent.Data.GetValueOrDefault("code", "");

			return $@"✅ **Đã cập nhật thông tin nhà vườn {code} thành công!**";
		}

		private string DeleteFarm(UserIntent intent)
		{
			var code = intent.Data.GetValueOrDefault("code", "");

			return $@"✅ **Đã xóa nhà vườn {code} thành công!**

⚠️ Lưu ý: Các bản ghi mua mủ từ nhà vườn này vẫn được giữ lại.";
		}
		private string ListRecords(UserIntent intent)
		{
			switch (intent.Entity)
			{
				case "Agent":
					return @"📊 **DANH SÁCH ĐẠI LÝ**

1️⃣ **NV_1** - Đại lý 1 (Mủ nước)
2️⃣ **NV_3** - Đại lý 3 (Mủ nước)
3️⃣ **NV_4** - Đại lý 4 (Mủ nước)

💡 Gõ 'xem chi tiết đại lý NV_1' để xem thêm.";

				case "Farm":
					return @"🌳 **DANH SÁCH NHÀ VƯỜN**

1️⃣ **NV_1** - Phan Thị Dư 1 3 4 (KL: 47)
2️⃣ **NV_1** - Đoàn Thị Diệu Hiền (giang) 222 (KL: 47)
3️⃣ **NV_3** - Hoàng Thị Long (C4) (KL: 47)
4️⃣ **NV_4** - Nguyễn Văn Hải 01 (Thành) (KL: 47)
5️⃣ **NV_5** - Nguyễn Văn Hải 02 (Thành) (KL: 47)

💡 Tổng: 11 nhà vườn";

				case "PurchaseData":
					return @"📦 **DỮ LIỆU MUA MỦ HÔM NAY**

1️⃣ NV_1 - Phan Thị Dư 1 3 4
   • TSC: 15 kg | Thành phẩm: 0 kg
   • Thời gian: 2025/11/18 09:30

2️⃣ NV_1 - Đoàn Thị Diệu Hiền 
   • TSC: 15 kg | Thành phẩm: 39.6 kg
   • Thời gian: 2025/11/18 09:30

3️⃣ NV_3 - Hoàng Thị Long (C4)
   • TSC: 15 kg | Thành phẩm: 210.532 kg
   • Thời gian: 2025/11/18 09:30

💡 Tổng hôm nay: 165 kg TSC, 250.132 kg thành phẩm";

				default:
					return "❓ Bạn muốn xem danh sách gì? (đại lý, nhà vườn, hoặc dữ liệu mua mủ)";
			}
		}

		private string SearchRecords(UserIntent intent)
		{
			var name = intent.Data.GetValueOrDefault("name", "");
			var code = intent.Data.GetValueOrDefault("code", "");

			return $@"🔍 **KẾT QUẢ TÌM KIẾM**

Tìm thấy 1 kết quả cho '{name}{code}':

📋 **Nguyễn Văn Hải 01 (Thành)** - NV_4
• Khối lượng: 47
• TSC: 15 kg
• Thành phẩm: 66.44 kg
• Cập nhật lần cuối: 2025/11/18 09:30
• Người cập nhật: admin

💡 Gõ 'xem chi tiết NV_4' để xem đầy đủ.";
		}

		private string GenerateReport(UserIntent intent)
		{
			var period = intent.Data.GetValueOrDefault("period", "today");

			return $@"📊 **BÁO CÁO THU MUA HÔM NAY** (19/11/2025)

📈 **TỔNG QUAN:**
• Tổng TSC thu mua: 165 kg
• Tổng thành phẩm: 843.243 kg
• Số lượng đơn: 11 đơn
• Số nhà vườn đã giao: 9 vườn

🏆 **TOP NHÀ VƯỜN:**
1. Hoàng Thị Long (C4) - 210.532 kg
2. Trần Văn Hương (Quốc) - 141.192 kg  
3. Nguyễn Văn Hà (Fong) - 105.05 kg

📊 **THEO ĐẠI LÝ:**
• NV_1: 3 đơn - 85.5 kg
• NV_3: 2 đơn - 225.6 kg
• NV_4: 4 đơn - 320.2 kg

💡 So với hôm qua: ↑ 12.5%";
		}
		#endregion
		#region GỌI GEMINI AI

		private async Task<string> CallGeminiAI(ChatRequest request)
		{
			var apiKey = _configuration["Gemini:ApiKey"];
			var client = _httpClientFactory.CreateClient();

			var websiteKnowledge = @"
🌐 HỆ THỐNG QUẢN LÝ THU MUA MỦ CAO SU - TAS

📋 THÔNG TIN HỆ THỐNG:
• Tên: TAS (Traceability Automation System)
• Nghiệp vụ: Thu mua mủ cao su từ các nhà vườn qua đại lý
• Phiên bản: v1.0

🎯 CÁC CHỨC NĂNG CHÍNH:

1️⃣ **NHẬP DỮ LIỆU MUA MỦ:**
   - Ghi nhận số liệu thu mua từ nhà vườn
   - Cập nhật thông tin: Mã nhà vườn, Tên nhà vườn, Khối lượng (TSC), Thành phẩm
   - Thời gian ghi nhận tự động
   - Trạng thái: Đã tạo đơn hàng / Chưa tạo

   VÍ DỤ: 'Nhập dữ liệu mua mủ từ vườn NV_5 khối lượng 15kg thành phẩm 79.704kg'

2️⃣ **QUẢN LÝ ĐẠI LÝ (AGENT):**
   - Thêm đại lý mới (mã đại lý, tên, loại nguyên liệu)
   - Sửa thông tin đại lý
   - Xóa đại lý
   - Loại nguyên liệu: Mủ nước, Mủ tạp, Latex

   VÍ DỤ: 'Thêm đại lý mã NV_10 tên Đại lý Tân Phú loại mủ nước'

3️⃣ **QUẢN LÝ NHÀ VƯỜN (FARM INFORMATION):**
   - Thêm nhà vườn mới (mã, tên, khối lượng)
   - Sửa thông tin nhà vườn
   - Xóa nhà vườn
   - Khối lượng tiêu chuẩn: thường là 47

   VÍ DỤ: 'Thêm nhà vườn mã NV_12 tên Nguyễn Văn A khối lượng 47'

4️⃣ **TRA CỨU & BÁO CÁO:**
   - Xem danh sách đại lý, nhà vườn, dữ liệu mua mủ
   - Tìm kiếm theo tên, mã
   - Báo cáo thống kê theo ngày/tuần/tháng
   - Xuất Excel, Import Excel

   VÍ DỤ: 
   - 'Hiển thị danh sách nhà vườn'
   - 'Tìm nhà vườn tên Nguyễn Văn Hải'
   - 'Báo cáo thu mua hôm nay'

5️⃣ **TÍNH NĂNG KHÁC:**
   - Import dữ liệu từ Excel
   - Export dữ liệu ra Excel
   - Sample Excel template
   - Tạo đơn hàng tự động
   - Traceability (Truy xuất nguồn gốc)

📊 CẤU TRÚC DỮ LIỆU:

**Bảng Update Data (Dữ liệu thu mua):**
• Số thứ tự (STT)
•- Mã nhà vườn (NV_1, NV_2,...)
- Tên nhà vườn
- Khối lượng (47)
- TSC (Khối lượng thu mua)
- Thành phẩm
- Thời gian ghi nhận
- Người cập nhật
- Trạng thái đơn hàng

**Bảng Agent (Đại lý):**
- Mã đại lý
- Tên đại lý
- Loại nguyên liệu
- Ngày tạo

**Bảng Farm Information (Nhà vườn):**
- Mã nhà vườn
- Tên nhà vườn
- Khối lượng
- Đại lý quản lý
- Ngày tạo

💬 CÁCH SỬ DỤNG CHATBOT:

✅ **Nhập liệu:**
- 'Nhập dữ liệu mua mủ từ vườn NV_1 khối lượng 15kg thành phẩm 39.6kg'
- 'Thêm đơn mủ NV_3 TSC 15kg'

✅ **Quản lý:**
- 'Thêm đại lý mã AG_5 tên Đại lý Miền Nam'
- 'Sửa nhà vườn NV_1 tên Phan Thị Dư'
- 'Xóa đại lý AG_3'

✅ **Tra cứu:**
- 'Xem danh sách nhà vườn'
- 'Tìm nhà vườn Nguyễn Văn Hải'
- 'Báo cáo thu mua hôm nay'
- 'Thống kê tháng này'

✅ **Câu hỏi:**
- 'Hệ thống có những tính năng gì?'
- 'Làm sao để nhập dữ liệu?'
- 'TSC là gì?'

📌 CHÚ THÍCH:
- TSC: Trọng lượng sản phẩm cao su (Total Solid Content)
- Mã nhà vườn: NV_1, NV_2, NV_3,... (NV = Nhà Vườn)
- Khối lượng: Đơn vị kg
- Thành phẩm: Sản phẩm sau chế biến

🎯 MỤC TIÊU:
Hệ thống giúp quản lý quy trình thu mua mủ cao su một cách tự động, minh bạch, có thể truy xuất nguồn gốc, giảm thiểu sai sót trong nhập liệu thủ công.
";

			var systemPrompt = $@"Bạn là trợ lý AI thông minh của hệ thống TAS (Traceability Automation System) - hệ thống quản lý thu mua mủ cao su.

📋 VAI TRÒ CỦA BẠN:
- Hỗ trợ người dùng sử dụng hệ thống TAS
- Trả lời câu hỏi về tính năng, cách sử dụng
- Hướng dẫn thao tác khi cần thiết
- Giải thích các thuật ngữ liên quan đến cao su, thu mua mủ
- Giúp phân tích dữ liệu và đưa ra insight hữu ích

🎯 PHONG CÁCH GIAO TIẾP:
- Thân thiện, nhiệt tình, chuyên nghiệp
- Ngắn gọn, súc tích, dễ hiểu
- Sử dụng emoji phù hợp để sinh động
- Ưu tiên tiếng Việt
- Khi không chắc chắn, hãy hỏi lại người dùng

📚 KIẾN THỨC VỀ HỆ THỐNG:
{websiteKnowledge}

💡 LƯU Ý:
- Nếu người dùng muốn thực hiện hành động (nhập liệu, sửa, xóa), hãy khuyến khích họ dùng câu lệnh cụ thể
- Khi người dùng hỏi về dữ liệu thực tế, hãy lưu ý rằng bạn không có quyền truy cập database, chỉ có thể hướng dẫn
- Luôn tích cực và giúp người dùng hoàn thành công việc nhanh nhất

Hãy trả lời câu hỏi của người dùng một cách hữu ích nhất!";

			var requestBody = new
			{
				contents = new[]
				{
					new
					{
						parts = new[]
						{
							new { text = $"{systemPrompt}\n\nNgười dùng hỏi: {request.Message}" }
						}
					}
				},
				generationConfig = new
				{
					temperature = 0.7,
					topK = 40,
					topP = 0.95,
					maxOutputTokens = 1024,
				}
			};

			var jsonContent = JsonSerializer.Serialize(requestBody);
			var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");
			var response = await client.PostAsync(
				$"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}",
				httpContent
			);

			if (!response.IsSuccessStatusCode)
			{
				var error = await response.Content.ReadAsStringAsync();
				throw new Exception($"Gemini API Error: {error}");
			}

			var responseContent = await response.Content.ReadAsStringAsync();
			var jsonDoc = JsonDocument.Parse(responseContent);

			var text = jsonDoc.RootElement
				.GetProperty("candidates")[0]
				.GetProperty("content")
				.GetProperty("parts")[0]
				.GetProperty("text")
				.GetString();

			return text ?? "Xin lỗi, tôi không thể tạo phản hồi lúc này.";
		}

		#endregion
		#region GỌI GEMINI AI

		private async Task<string> CallGeminiAII(ChatRequest request)
		{
			var apiKey = _configuration["Gemini:ApiKey"];
			var client = _httpClientFactory.CreateClient();

			// QUAN TRỌNG: Thông tin về website của bạn
			var websiteKnowledge = @"
🌐 THÔNG TIN VỀ WEBSITE:

Tên website: Cửa hàng điện tử TechShop
Domain: www.techshop.vn

📋 CÁC TÍNH NĂNG CHÍNH:

1. QUẢN LÝ SẢN PHẨM:
   - Xem danh sách sản phẩm
   - Thêm sản phẩm mới
   - Sửa thông tin sản phẩm
   - Xóa sản phẩm
   - Tìm kiếm sản phẩm theo tên, giá

2. QUẢN LÝ KHÁCH HÀNG:
   - Đăng ký tài khoản
   - Đăng nhập
   - Quản lý thông tin cá nhân
   - Lịch sử mua hàng

3. QUẢN LÝ ĐỢN HÀNG:
   - Tạo đơn hàng mới
   - Theo dõi trạng thái đơn hàng
   - Hủy đơn hàng
   - Xem lịch sử đơn hàng

4. THANH TOÁN:
   - Thanh toán qua thẻ tín dụng
   - Chuyển khoản ngân hàng
   - COD (Thanh toán khi nhận hàng)
   - Ví điện tử (MoMo, ZaloPay)

🎯 HƯỚNG DẪN SỬ DỤNG:

Để tạo sản phẩm: Nói 'Tạo sản phẩm tên ... giá ...'
Để sửa sản phẩm: Nói 'Sửa sản phẩm id ... tên ...'
Để xóa sản phẩm: Nói 'Xóa sản phẩm id ...'
Để xem sản phẩm: Nói 'Hiển thị danh sách sản phẩm'

📞 HỖ TRỢ:
- Hotline: 1900 1234
- Email: support@techshop.vn
- Giờ làm việc: 8:00 - 22:00 (Hàng ngày)
";

			var systemPrompt = $@"Bạn là trợ lý AI thông minh của website TechShop.

{websiteKnowledge}

NHIỆM VỤ CỦA BẠN:
• Trả lời các câu hỏi về website một cách chi tiết
• Hướng dẫn người dùng sử dụng các tính năng
• Giải thích cách thực hiện các thao tác
• Luôn thân thiện, chuyên nghiệp
• Trả lời bằng tiếng Việt

QUY TẮC:
• Nếu người dùng muốn thực hiện hành động (tạo, sửa, xóa), hướng dẫn cú pháp chính xác
• Nếu không chắc chắn, hãy hỏi lại để hiểu rõ hơn
• Luôn đề xuất các tính năng liên quan có thể hữu ích";

			var conversationText = new StringBuilder();
			conversationText.AppendLine(systemPrompt);
			conversationText.AppendLine();

			if (request.History != null && request.History.Any())
			{
				foreach (var msg in request.History)
				{
					var speaker = msg.Role == "user" ? "👤 Người dùng" : "🤖 Trợ lý";
					conversationText.AppendLine($"{speaker}: {msg.Content}");
				}
			}

			conversationText.AppendLine($"👤 Người dùng: {request.Message}");
			conversationText.AppendLine("🤖 Trợ lý:");

			var requestBody = new
			{
				contents = new[]
				{
					new
					{
						parts = new[]
						{
							new { text = conversationText.ToString() }
						}
					}
				},
				generationConfig = new
				{
					temperature = 0.7,
					maxOutputTokens = 1000,
					topP = 0.8,
					topK = 40
				}
			};

			var content = new StringContent(
				JsonSerializer.Serialize(requestBody),
				Encoding.UTF8,
				"application/json"
			);

			var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";

			var response = await client.PostAsync(apiUrl, content);
			var responseContent = await response.Content.ReadAsStringAsync();

			if (!response.IsSuccessStatusCode)
			{
				return "❌ Xin lỗi, đã có lỗi khi kết nối với AI.";
			}

			var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(
				responseContent,
				new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
			);

			return geminiResponse?.Candidates
				?.FirstOrDefault()?.Content?.Parts
				?.FirstOrDefault()?.Text
				?.Trim() ?? "Xin lỗi, tôi không thể trả lời lúc này.";
		}

		#endregion
	}

	#region MODELS

	public class ChatRequest
	{
		public string? Message { get; set; }
		public List<ChatMessage>? History { get; set; }
		public WebsiteInfo? WebsiteInfo { get; set; }
	}

	public class ChatMessage
	{
		public string? Role { get; set; }
		public string? Content { get; set; }
	}

	public class WebsiteInfo
	{
		public string? Name { get; set; }
		public List<string>? Features { get; set; }
	}

	public class UserIntent
	{
		public bool IsAction { get; set; } = false;
		public string Action { get; set; } = "";
		public string Entity { get; set; } = "";
		public string OriginalMessage { get; set; } = "";
		public Dictionary<string, string> Data { get; set; } = new Dictionary<string, string>();
	}

	public class GeminiResponse
	{
		public List<Candidate>? Candidates { get; set; }
	}

	public class Candidate
	{
		public Content? Content { get; set; }
	}

	public class Content
	{
		public List<Part>? Parts { get; set; }
	}

	public class Part
	{
		public string? Text { get; set; }
	}

	#endregion
}