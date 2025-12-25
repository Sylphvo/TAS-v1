using TAS.Helpers;
using TAS.Models;
using TAS.Models.DTOs;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
    public class OrderModels
    {
        private readonly ICurrentUser _userManage;
        private readonly ILogger<OrderModels> _logger;
        ConnectDbHelper dbHelper = new ConnectDbHelper();

        public OrderModels(ICurrentUser userManage, ILogger<OrderModels> logger)
        {
            _userManage = userManage;
            _logger = logger;
        }

        #region Get Data

        // Lấy tất cả đơn hàng
        public async Task<List<RubberOrderDto>> GetRubberOrderAsync()
        {
            var sql = @"
			SELECT 
				rowNo = ROW_NUMBER() OVER(ORDER BY OrderId DESC),
				OrderId,
				OrderCode,
				AgentCode,
				OrderDate = CONVERT(VARCHAR, OrderDate, 111),
				ExpectedShipDate = CONVERT(VARCHAR, ExpectedShipDate, 111),
				ShippedAt = CONVERT(VARCHAR, ShippedAt, 111),
				BuyerName,
				BuyerCompany,
				ContractNo,
				Destination,
				DeliveryAddress,
				ProductType,
				TargetTSC,
				TargetDRC,
				TotalNetKg,
				UnitPrice,
				Status,
				Note,
				RegisterPerson,
				RegisterDate = CONVERT(VARCHAR, RegisterDate, 111) + ' ' + CONVERT(VARCHAR(5), RegisterDate, 108),
				UpdatePerson = ISNULL(UpdatePerson, RegisterPerson),
				UpdateDate = CONVERT(VARCHAR, ISNULL(UpdateDate, RegisterDate), 111) + ' ' + CONVERT(VARCHAR(5), ISNULL(UpdateDate, RegisterDate), 108)
			FROM RubberOrder
			ORDER BY OrderId DESC
			";
            return await dbHelper.QueryAsync<RubberOrderDto>(sql);
        }

        // Lấy đơn hàng theo ID
        public async Task<RubberOrderDto> GetRubberOrderByIdAsync(long orderId)
        {
            try
            {
                var sql = @"
                    SELECT 
                        OrderId,
                        OrderCode,
                        AgentCode,
                        OrderDate,
                        ExpectedShipDate,
                        ShippedAt,
                        BuyerName,
                        BuyerCompany,
                        ContractNo,
                        Destination,
                        DeliveryAddress,
                        ProductType,
                        TargetTSC,
                        TargetDRC,
                        TotalNetKg,
                        UnitPrice,
                        Status,
                        Note,
                        RegisterPerson,
                        RegisterDate,
                        UpdatePerson,
                        UpdateDate
                    FROM RubberOrder
                    WHERE OrderId = @OrderId
                ";
                var result = await dbHelper.QueryAsync<RubberOrderDto>(sql, new { OrderId = orderId });
                return result.FirstOrDefault()!;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching RubberOrder by ID: {OrderId}", orderId);
                return null!;
            }

        }

        // Lấy đơn hàng theo mã đại lý
        public async Task<List<RubberOrderDto>> GetRubberOrdersByAgentAsync(string agentCode)
        {
            var sql = @"
			SELECT 
				rowNo = ROW_NUMBER() OVER(ORDER BY OrderId DESC),
				OrderId,
				OrderCode,
				AgentCode,
				OrderDate = CONVERT(VARCHAR, OrderDate, 111),
				ExpectedShipDate = CONVERT(VARCHAR, ExpectedShipDate, 111),
				ShippedAt = CONVERT(VARCHAR, ShippedAt, 111),
				BuyerName,
				BuyerCompany,
				ContractNo,
				Destination,
				DeliveryAddress,
				ProductType,
				TargetTSC,
				TargetDRC,
				TotalNetKg,
				UnitPrice,
				Status,
				Note,
				UpdatePerson = ISNULL(UpdatePerson, RegisterPerson),
				UpdateDate = CONVERT(VARCHAR, ISNULL(UpdateDate, RegisterDate), 111) + ' ' + CONVERT(VARCHAR(5), ISNULL(UpdateDate, RegisterDate), 108)
			FROM RubberOrder
			WHERE AgentCode = @AgentCode
			ORDER BY OrderId DESC
			";
            return await dbHelper.QueryAsync<RubberOrderDto>(sql, new { AgentCode = agentCode });
        }

        // Lấy đơn hàng theo trạng thái
        public async Task<List<RubberOrderDto>> GetRubberOrdersByStatusAsync(int status)
        {
            var sql = @"
			SELECT 
				rowNo = ROW_NUMBER() OVER(ORDER BY OrderId DESC),
				OrderId,
				OrderCode,
				AgentCode,
				OrderDate = CONVERT(VARCHAR, OrderDate, 111),
				ExpectedShipDate = CONVERT(VARCHAR, ExpectedShipDate, 111),
				ShippedAt = CONVERT(VARCHAR, ShippedAt, 111),
				BuyerName,
				BuyerCompany,
				ContractNo,
				Destination,
				DeliveryAddress,
				ProductType,
				TargetTSC,
				TargetDRC,
				TotalNetKg,
				UnitPrice,
				Status,
				Note,
				UpdatePerson = ISNULL(UpdatePerson, RegisterPerson),
				UpdateDate = CONVERT(VARCHAR, ISNULL(UpdateDate, RegisterDate), 111) + ' ' + CONVERT(VARCHAR(5), ISNULL(UpdateDate, RegisterDate), 108)
			FROM RubberOrder
			WHERE Status = @Status
			ORDER BY OrderId DESC
			";
            return await dbHelper.QueryAsync<RubberOrderDto>(sql, new { Status = status });
        }

        // Lấy đơn hàng theo khoảng thời gian
        public async Task<List<RubberOrderDto>> GetRubberOrdersByDateRangeAsync(DateTime fromDate, DateTime toDate)
        {
            var sql = @"
			SELECT 
				rowNo = ROW_NUMBER() OVER(ORDER BY OrderId DESC),
				OrderId,
				OrderCode,
				AgentCode,
				OrderDate = CONVERT(VARCHAR, OrderDate, 111),
				ExpectedShipDate = CONVERT(VARCHAR, ExpectedShipDate, 111),
				ShippedAt = CONVERT(VARCHAR, ShippedAt, 111),
				BuyerName,
				BuyerCompany,
				ContractNo,
				Destination,
				DeliveryAddress,
				ProductType,
				TargetTSC,
				TargetDRC,
				TotalNetKg,
				UnitPrice,
				Status,
				Note,
				UpdatePerson = ISNULL(UpdatePerson, RegisterPerson),
				UpdateDate = CONVERT(VARCHAR, ISNULL(UpdateDate, RegisterDate), 111) + ' ' + CONVERT(VARCHAR(5), ISNULL(UpdateDate, RegisterDate), 108)
			FROM RubberOrder
			WHERE OrderDate BETWEEN @FromDate AND @ToDate
			ORDER BY OrderId DESC
			";
            return await dbHelper.QueryAsync<RubberOrderDto>(sql, new { FromDate = fromDate, ToDate = toDate });
        }

        #endregion

        #region Add/Update Data

        // Thêm hoặc cập nhật đơn hàng
        public int AddOrUpdateRubberOrder(RubberOrderDto rubberOrder)
        {
            try
            {
                if (rubberOrder == null)
                {
                    throw new ArgumentNullException(nameof(rubberOrder), "Input data cannot be null.");
                }

                var sql = @"
				IF EXISTS (SELECT TOP 1 OrderId FROM RubberOrder WHERE OrderId = @OrderId)
				BEGIN
					UPDATE RubberOrder SET
						OrderCode = @OrderCode,
						AgentCode = @AgentCode,
						OrderDate = @OrderDate,
						ExpectedShipDate = @ExpectedShipDate,
						ShippedAt = @ShippedAt,
						BuyerName = @BuyerName,
						BuyerCompany = @BuyerCompany,
						ContractNo = @ContractNo,
						Destination = @Destination,
						DeliveryAddress = @DeliveryAddress,
						ProductType = @ProductType,
						TargetTSC = @TargetTSC,
						TargetDRC = @TargetDRC,
						TotalNetKg = @TotalNetKg,
						UnitPrice = @UnitPrice,
						Status = @Status,
						Note = @Note,
						UpdateDate = GETDATE(),
						UpdatePerson = @UpdatePerson
					WHERE OrderId = @OrderId
					SELECT 0;
				END
				ELSE
				BEGIN
					INSERT INTO RubberOrder
					(OrderCode, AgentCode, OrderDate, ExpectedShipDate, ShippedAt,
						BuyerName, BuyerCompany, ContractNo, Destination, DeliveryAddress,
						ProductType, TargetTSC, TargetDRC, TotalNetKg, UnitPrice,
						Status, Note, RegisterDate, RegisterPerson)
					VALUES
					(@OrderCode, @AgentCode, @OrderDate, @ExpectedShipDate, @ShippedAt,
						@BuyerName, @BuyerCompany, @ContractNo, @Destination, @DeliveryAddress,
						@ProductType, @TargetTSC, @TargetDRC, @TotalNetKg, @UnitPrice,
						@Status, @Note, GETDATE(), @UpdatePerson)
					SELECT SCOPE_IDENTITY() AS NewOrderId;
				END";

                var lstResult = dbHelper.Execute(sql, new
                {
                    OrderId = rubberOrder.OrderId,
                    OrderCode = rubberOrder.OrderCode,
                    AgentCode = rubberOrder.AgentCode,
                    OrderDate = rubberOrder.OrderDate,
                    ExpectedShipDate = rubberOrder.ExpectedShipDate,
                    ShippedAt = rubberOrder.ShippedAt,
                    BuyerName = rubberOrder.BuyerName,
                    BuyerCompany = rubberOrder.BuyerCompany,
                    //ContractNo = rubberOrder.ContractNo,
                    //Destination = rubberOrder.Destination,
                    //DeliveryAddress = rubberOrder.DeliveryAddress,
                    ProductType = rubberOrder.ProductType,
                    //TargetTSC = rubberOrder.TargetTSC,
                    //TargetDRC = rubberOrder.TargetDRC,
                    TotalNetKg = rubberOrder.TotalNetKg,
                    //UnitPrice = rubberOrder.UnitPrice,
                    Status = rubberOrder.Status,
                    Note = rubberOrder.Note,
                    UpdatePerson = _userManage.Name
                });
                return lstResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding/updating RubberOrder with ID: {OrderId}", rubberOrder?.OrderId);
                return 0;
            }
        }

        // Thêm hoặc cập nhật nhiều đơn hàng
        public int AddOrUpdateRubberOrderFull(List<RubberOrderDto> rubberOrders)
        {
            try
            {
                if (rubberOrders == null || !rubberOrders.Any())
                {
                    throw new ArgumentNullException(nameof(rubberOrders), "Input data cannot be null or empty.");
                }

                int successCount = 0;
                foreach (var order in rubberOrders)
                {
                    var result = AddOrUpdateRubberOrder(order);
                    if (result > 0)
                        successCount++;
                }
                return successCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding/updating multiple RubberOrders.");
                return 0;
            }
        }

        // Import danh sách đơn hàng
        public int ImportRubberOrders(List<RubberOrderDto> rubberOrders)
        {
            try
            {
                if (rubberOrders == null || !rubberOrders.Any())
                {
                    throw new ArgumentNullException(nameof(rubberOrders), "Import data cannot be null or empty.");
                }

                int successCount = 0;
                foreach (var order in rubberOrders)
                {
                    var result = AddOrUpdateRubberOrder(order);
                    if (result > 0)
                        successCount++;
                }
                return successCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing RubberOrders.");
                return 0;
            }
        }

        #endregion

        #region Delete Data

        // Xóa đơn hàng
        public int DeleteRubberOrder(long orderId)
        {
            try
            {
                string sql = @"
					DELETE FROM RubberOrder WHERE OrderId = @OrderId
				";
                dbHelper.Execute(sql, new { OrderId = orderId });
                return 1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting RubberOrder with ID: {OrderId}", orderId);
                return 0;
            }
        }

        #endregion

        #region Approve/Update Status

        // Phê duyệt đơn hàng
        public int ApproveRubberOrder(long orderId, int status)
        {
            try
            {
                string sql = @"
					UPDATE RubberOrder 
					SET 
						Status = @Status,
						UpdateDate = GETDATE(),
						UpdatePerson = @UpdatePerson
					WHERE OrderId = @OrderId
				";
                dbHelper.Execute(sql, new
                {
                    OrderId = orderId,
                    Status = status,
                    UpdatePerson = _userManage.Name
                });
                return 1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving RubberOrder with ID: {OrderId}", orderId);
                return 0;
            }
        }

        // Phê duyệt tất cả đơn hàng
        public int ApproveAllRubberOrders(int status)
        {
            try
            {
                string sql = @"
					UPDATE RubberOrder 
					SET 
						Status = @Status,
						UpdateDate = GETDATE(),
						UpdatePerson = @UpdatePerson
					WHERE Status = 0
				";
                dbHelper.Execute(sql, new
                {
                    Status = status,
                    UpdatePerson = _userManage.Name
                });
                return 1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving all RubberOrders.");
                return 0;
            }
        }

        // Cập nhật trạng thái đơn hàng
        public int UpdateOrderStatus(long orderId, int status)
        {
            try
            {
                string sql = @"
					UPDATE RubberOrder 
					SET 
						Status = @Status,
						UpdateDate = GETDATE(),
						UpdatePerson = @UpdatePerson
				";

                // Nếu trạng thái là "Đã giao hàng", cập nhật ngày giao
                if (status == 3)
                {
                    sql += ", ShippedAt = GETDATE()";
                }

                sql += " WHERE OrderId = @OrderId";

                dbHelper.Execute(sql, new
                {
                    OrderId = orderId,
                    Status = status,
                    UpdatePerson = _userManage.Name
                });
                return 1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for RubberOrder with ID: {OrderId}", orderId);
                return 0;
            }
        }

        #endregion

        #region Utility Methods

        // Tự động tạo mã đơn hàng
        public async Task<string> GenerateOrderCodeAsync()
        {
            try
            {
                var sql = @"
					SELECT TOP 1 OrderCode 
					FROM RubberOrder 
					WHERE OrderCode LIKE 'ORD%' 
					ORDER BY OrderId DESC
				";
                var lastOrderCode = await dbHelper.QueryFirstOrDefaultAsync<string>(sql);

                if (string.IsNullOrEmpty(lastOrderCode))
                {
                    return "ORD00001";
                }

                // Lấy số thứ tự từ mã cuối cùng
                var numberPart = lastOrderCode.Substring(3);
                if (int.TryParse(numberPart, out int lastNumber))
                {
                    int newNumber = lastNumber + 1;
                    return $"ORD{newNumber:D5}";
                }

                return "ORD00001";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating new order code.");
                return "ORD00001";
            }
        }

        // Kiểm tra mã đơn hàng đã tồn tại
        public async Task<bool> IsOrderCodeExistsAsync(string orderCode)
        {
            try
            {
                var sql = @"
					SELECT COUNT(*) 
					FROM RubberOrder 
					WHERE OrderCode = @OrderCode
				";
                var count = await dbHelper.QueryFirstOrDefaultAsync<int>(sql, new { OrderCode = orderCode });
                return count > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if order code exists: {OrderCode}", orderCode);
                return false;
            }
        }

        #endregion
    }
}