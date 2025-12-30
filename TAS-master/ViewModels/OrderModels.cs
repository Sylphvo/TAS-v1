using ClosedXML.Excel;
using Dapper;
using System.Data;
using TAS.DTOs;
using TAS.Models.DTOs;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class OrderModels
	{
		private readonly ConnectDbHelper _dbHelper;
		private readonly ILogger<OrderModels> _logger;

		public OrderModels(ConnectDbHelper dbHelper, ILogger<OrderModels> logger)
		{
			_dbHelper = dbHelper;
			_logger = logger;
		}

		// ========================================
		// GET ALL ORDERS
		// ========================================
		public async Task<List<RubberOrderResponse>> GetAllOrdersAsync()
		{
			try
			{
				var sql = @"
                    SELECT 
						rowNo = ROW_NUMBER() OVER(ORDER BY o.RegisterDate DESC, o.OrderId DESC),
                        o.OrderId,
                        o.OrderCode,
                        o.AgentCode,
                        a.AgentName,
                        o.BuyerName,
                        o.BuyerCompany,
                        o.OrderDate,
                        o.ExpectedShipDate,
                        o.ShippedAt,
                        o.ProductType,
                        o.TotalNetKg,
                        o.Status,
                        o.Note,
                        o.RegisterDate,
                        o.RegisterPerson,
                        o.UpdateDate,
                        o.UpdatePerson
                    FROM RubberOrder o
                    INNER JOIN RubberAgent a ON a.AgentCode = o.AgentCode
                    ORDER BY o.OrderDate DESC, o.OrderId DESC
                ";

				var orders = await _dbHelper.QueryAsync<RubberOrderResponse>(sql);
				return orders.ToList();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAllOrdersAsync");
				throw;
			}
		}

		// ========================================
		// GET ORDER BY ID
		// ========================================
		public async Task<RubberOrderDto?> GetOrderByIdAsync(long orderId)
		{
			try
			{
				var sql = @"
                    SELECT 
                        o.OrderId,
                        o.OrderCode,
                        o.AgentCode,
                        a.AgentName,
                        o.BuyerName,
                        o.BuyerCompany,
                        o.OrderDate,
                        o.ExpectedShipDate,
                        o.ShippedAt,
                        o.ProductType,
                        o.TotalNetKg,
                        o.Status,
                        o.Note,
                        o.RegisterDate,
                        o.RegisterPerson,
                        o.UpdateDate,
                        o.UpdatePerson
                    FROM RubberOrder o
                    INNER JOIN RubberAgent a ON a.AgentCode = o.AgentCode
                    WHERE o.OrderId = @OrderId
                ";

				return await _dbHelper.QueryFirstOrDefaultAsync<RubberOrderDto>(sql, new { OrderId = orderId });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetOrderByIdAsync");
				throw;
			}
		}

		// ========================================
		// CREATE ORDER
		// ========================================
		public async Task<RubberOrderResult> CreateOrderAsync(RubberOrderRequest request, string createdBy)
		{
			try
			{
				// Generate OrderCode
				var orderCode = await GenerateOrderCodeAsync();

				var sql = @"
                    INSERT INTO RubberOrder 
                    (
                        OrderCode, AgentCode, BuyerName, BuyerCompany,
                        OrderDate, ExpectedShipDate, ProductType, 
                        TotalNetKg, Status, Note,
                        RegisterDate, RegisterPerson
                    )
                    VALUES 
                    (
                        @OrderCode, @AgentCode, @BuyerName, @BuyerCompany,
                        @OrderDate, @ExpectedShipDate, @ProductType,
                        @TotalNetKg, @Status, @Note,
                        GETDATE(), @RegisterPerson
                    );
                    SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
                ";

				var orderId = await _dbHelper.QueryFirstOrDefaultAsync<long>(sql, new
				{
					OrderCode = orderCode,
					request.AgentCode,
					request.BuyerName,
					request.BuyerCompany,
					request.OrderDate,
					request.ExpectedShipDate,
					request.ProductType,
					TotalNetKg = request.TotalNetKg ?? 0,
					Status = (byte)1, // 1 = Mới
					request.Note,
					RegisterPerson = createdBy
				});

				return new RubberOrderResult
				{
					Success = true,
					Message = "Tạo đơn hàng thành công",
					OrderId = orderId
				};
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in CreateOrderAsync");
				return new RubberOrderResult
				{
					Success = false,
					Message = "Lỗi khi tạo đơn hàng: " + ex.Message
				};
			}
		}

		// ========================================
		// UPDATE ORDER
		// ========================================
		public async Task<RubberOrderResult> UpdateOrderAsync(RubberOrderRequest request, string updatedBy)
		{
			try
			{
				var sql = @"
                    UPDATE RubberOrder
                    SET 
                        AgentCode = @AgentCode,
                        BuyerName = @BuyerName,
                        BuyerCompany = @BuyerCompany,
                        OrderDate = @OrderDate,
                        ExpectedShipDate = @ExpectedShipDate,
                        ProductType = @ProductType,
                        TotalNetKg = @TotalNetKg,
                        Note = @Note,
                        UpdateDate = GETDATE(),
                        UpdatePerson = @UpdatePerson
                    WHERE OrderId = @OrderId
                ";

				var affected = await _dbHelper.ExecuteAsync(sql, new
				{
					request.OrderId,
					request.AgentCode,
					request.BuyerName,
					request.BuyerCompany,
					request.OrderDate,
					request.ExpectedShipDate,
					request.ProductType,
					TotalNetKg = request.TotalNetKg ?? 0,
					request.Note,
					UpdatePerson = updatedBy
				});

				if (affected > 0)
				{
					return new RubberOrderResult { Success = true, Message = "Cập nhật thành công" };
				}

				return new RubberOrderResult { Success = false, Message = "Không tìm thấy đơn hàng" };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in UpdateOrderAsync");
				return new RubberOrderResult
				{
					Success = false,
					Message = "Lỗi khi cập nhật: " + ex.Message
				};
			}
		}

		// ========================================
		// DELETE ORDER (Physical Delete)
		// ========================================
		public async Task<RubberOrderResult> DeleteOrderAsync(long orderId, string deletedBy)
		{
			try
			{
				// Check if order has pallets
				var checkSql = "SELECT COUNT(*) FROM RubberPallet WHERE OrderId = @OrderId";
				var palletCount = await _dbHelper.QueryFirstOrDefaultAsync<int>(checkSql, new { OrderId = orderId });

				if (palletCount > 0)
				{
					return new RubberOrderResult
					{
						Success = false,
						Message = $"Không thể xóa. Đơn hàng có {palletCount} pallet liên quan."
					};
				}

				// Check if order has OrderPonds
				var checkPondSql = "SELECT COUNT(*) FROM RubberOrderPond WHERE OrderId = @OrderId";
				var pondCount = await _dbHelper.QueryFirstOrDefaultAsync<int>(checkPondSql, new { OrderId = orderId });

				if (pondCount > 0)
				{
					return new RubberOrderResult
					{
						Success = false,
						Message = $"Không thể xóa. Đơn hàng có {pondCount} hồ phân bổ liên quan."
					};
				}

				// Physical delete
				var sql = "DELETE FROM RubberOrder WHERE OrderId = @OrderId";
				var affected = await _dbHelper.ExecuteAsync(sql, new { OrderId = orderId });

				if (affected > 0)
				{
					return new RubberOrderResult { Success = true, Message = "Xóa thành công" };
				}

				return new RubberOrderResult { Success = false, Message = "Không tìm thấy đơn hàng" };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in DeleteOrderAsync");
				return new RubberOrderResult
				{
					Success = false,
					Message = "Lỗi khi xóa: " + ex.Message
				};
			}
		}

		// ========================================
		// UPDATE ORDER STATUS
		// ========================================
		public async Task<RubberOrderResult> UpdateOrderStatusAsync(long orderId, byte status, string updatedBy)
		{
			try
			{
				var sql = @"
                    UPDATE RubberOrder
                    SET 
                        Status = @Status,
                        UpdateDate = GETDATE(),
                        UpdatePerson = @UpdatePerson
                    WHERE OrderId = @OrderId
                ";

				var affected = await _dbHelper.ExecuteAsync(sql, new
				{
					OrderId = orderId,
					Status = status,
					UpdatePerson = updatedBy
				});

				if (affected > 0)
				{
					return new RubberOrderResult { Success = true, Message = "Cập nhật trạng thái thành công" };
				}

				return new RubberOrderResult { Success = false, Message = "Không tìm thấy đơn hàng" };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in UpdateOrderStatusAsync");
				return new RubberOrderResult
				{
					Success = false,
					Message = "Lỗi khi cập nhật trạng thái: " + ex.Message
				};
			}
		}

		// ========================================
		// MARK SHIPPED
		// ========================================
		public async Task<RubberOrderResult> MarkShippedAsync(long orderId, string updatedBy)
		{
			try
			{
				var sql = @"
                    UPDATE RubberOrder
                    SET 
                        ShippedAt = GETDATE(),
                        Status = 3,
                        UpdateDate = GETDATE(),
                        UpdatePerson = @UpdatePerson
                    WHERE OrderId = @OrderId
                ";

				var affected = await _dbHelper.ExecuteAsync(sql, new
				{
					OrderId = orderId,
					UpdatePerson = updatedBy
				});

				if (affected > 0)
				{
					return new RubberOrderResult { Success = true, Message = "Đánh dấu đã xuất hàng thành công" };
				}

				return new RubberOrderResult { Success = false, Message = "Không tìm thấy đơn hàng" };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in MarkShippedAsync");
				return new RubberOrderResult
				{
					Success = false,
					Message = "Lỗi khi đánh dấu xuất hàng: " + ex.Message
				};
			}
		}

		// ========================================
		// GET AGENTS
		// ========================================
		public async Task<List<RubberAgentDto>> GetAgentsAsync()
		{
			try
			{
				var sql = @"
                    SELECT 
                        AgentId,
                        AgentCode,
                        AgentName
                    FROM RubberAgent
                    WHERE IsActive = 1
                    ORDER BY AgentName
                ";

				var agents = await _dbHelper.QueryAsync<RubberAgentDto>(sql);
				return agents.ToList();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAgentsAsync");
				throw;
			}
		}

		// ========================================
		// GENERATE ORDER CODE
		// ========================================
		private async Task<string> GenerateOrderCodeAsync()
		{
			try
			{
				var sql = @"
                    SELECT TOP 1 OrderCode 
                    FROM RubberOrder 
                    WHERE OrderCode LIKE 'ORD' + FORMAT(GETDATE(), 'yyyyMM') + '%'
                    ORDER BY OrderCode DESC
                ";

				var lastCode = await _dbHelper.QueryFirstOrDefaultAsync<string>(sql);

				if (string.IsNullOrEmpty(lastCode))
				{
					return $"ORD{DateTime.Now:yyyyMM}0001";
				}

				// Extract number from last code
				var numberPart = lastCode.Substring(9); // ORDyyyyMM0001 -> 0001
				if (int.TryParse(numberPart, out var number))
				{
					return $"ORD{DateTime.Now:yyyyMM}{(number + 1):D4}";
				}

				return $"ORD{DateTime.Now:yyyyMM}0001";
			}
			catch
			{
				return $"ORD{DateTime.Now:yyyyMM}0001";
			}
		}

		// ========================================
		// EXPORT TO EXCEL
		// ========================================
		public async Task<byte[]> ExportToExcelAsync(List<long> orderIds, string exportedBy)
		{
			try
			{
				List<RubberOrderResponse> orders;

				if (orderIds != null && orderIds.Any())
				{
					// Export selected orders
					var sql = @"
                        SELECT 
                            o.OrderId,
                            o.OrderCode,
                            a.AgentName,
                            o.BuyerName,
                            o.BuyerCompany,
                            o.OrderDate,
                            o.ExpectedShipDate,
                            o.ShippedAt,
                            o.ProductType,
                            o.TotalNetKg,
                            o.Status,
                            o.Note
                        FROM RubberOrder o
                        INNER JOIN RubberAgent a ON a.AgentCode = o.AgentCode
                        WHERE o.OrderId IN @OrderIds
                        ORDER BY o.OrderDate DESC
                    ";

					orders = (await _dbHelper.QueryAsync<RubberOrderResponse>(sql, new { OrderIds = orderIds })).ToList();
				}
				else
				{
					// Export all orders
					orders = await GetAllOrdersAsync();
				}

				using var workbook = new XLWorkbook();
				var worksheet = workbook.Worksheets.Add("Orders");

				// Header
				worksheet.Cell(1, 1).Value = "Mã đơn hàng";
				worksheet.Cell(1, 2).Value = "Đại lý";
				worksheet.Cell(1, 3).Value = "Người mua";
				worksheet.Cell(1, 4).Value = "Công ty";
				worksheet.Cell(1, 5).Value = "Ngày đặt";
				worksheet.Cell(1, 6).Value = "Ngày dự kiến xuất";
				worksheet.Cell(1, 7).Value = "Ngày xuất thực tế";
				worksheet.Cell(1, 8).Value = "Loại sản phẩm";
				worksheet.Cell(1, 9).Value = "Tổng Net (kg)";
				worksheet.Cell(1, 10).Value = "Trạng thái";
				worksheet.Cell(1, 11).Value = "Ghi chú";

				// Style header
				var headerRange = worksheet.Range(1, 1, 1, 11);
				headerRange.Style.Font.Bold = true;
				headerRange.Style.Fill.BackgroundColor = XLColor.LightBlue;
				headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

				// Data
				int row = 2;
				foreach (var order in orders)
				{
					worksheet.Cell(row, 1).Value = order.OrderCode;
					worksheet.Cell(row, 2).Value = order.AgentName;
					worksheet.Cell(row, 3).Value = order.BuyerName;
					worksheet.Cell(row, 4).Value = order.BuyerCompany;
					worksheet.Cell(row, 5).Value = order.OrderDate?.ToString("dd/MM/yyyy") ?? "";
					worksheet.Cell(row, 6).Value = order.ExpectedShipDate?.ToString("dd/MM/yyyy") ?? "";
					worksheet.Cell(row, 7).Value = order.ShippedAt?.ToString("dd/MM/yyyy HH:mm") ?? "";
					worksheet.Cell(row, 8).Value = order.ProductType;
					worksheet.Cell(row, 9).Value = order.TotalNetKg;
					worksheet.Cell(row, 10).Value = GetStatusText(order.Status);
					worksheet.Cell(row, 11).Value = order.Note;
					row++;
				}

				// Auto-fit columns
				worksheet.Columns().AdjustToContents();

				using var stream = new MemoryStream();
				workbook.SaveAs(stream);
				return stream.ToArray();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ExportToExcelAsync");
				throw;
			}
		}

		// ========================================
		// HELPER: Get Status Text
		// ========================================
		private string GetStatusText(byte status)
		{
			return status switch
			{
				1 => "Mới",
				2 => "Đang xử lý",
				3 => "Hoàn thành",
				4 => "Hủy",
				_ => "Không xác định"
			};
		}
	}
}