using TAS.Models;
using TAS.Models.DTOs;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class TraceabilityModels
	{
		ConnectDbHelper dbHelper = new ConnectDbHelper();
		public TraceabilityModels()
		{

		}
		// Model
		public async Task<List<RubberOrderDto>> GetTraceabilityAsync(CancellationToken ct = default)
		{
			var sql = @"
				-- Tạo bảng tạm với cấu trúc rõ ràng
				CREATE TABLE #TempOrder (
					OrderId INT,
					ParentId INT NULL,
					SortOrder INT,
					OrderCode NVARCHAR(50) NULL,
					OrderName NVARCHAR(200) NULL,
					AgentCode NVARCHAR(200) NULL,
					AgentName NVARCHAR(200) NULL,
					FarmCode NVARCHAR(200) NULL,
					FarmerName NVARCHAR(200) NULL,
					DatePurchase DATETIME,
					TotalFinishedProductKg DECIMAL(18,2) NULL,
					TotalCentrifugeProductKg DECIMAL(18,2) NULL,
					SortIdList NVARCHAR(200) NULL,
					IsOpenChild bit NULL
				);



				-- Level 1: Đơn hàng
				--INSERT INTO #TempOrder (OrderId, ParentId, SortOrder, OrderCode, OrderName, AgentCode, AgentName, FarmCode, --FarmerName, DatePurchase, TotalFinishedProductKg, TotalCentrifugeProductKg, SortIdList, IsOpenChild)
				--VALUES (1, NULL, 1, 'ORD' + FORMAT(GETDATE(), 'ddMMyyyy'), N'đơn hàng 1', NULL, NULL, NULL, NULL, NULL, --NULL, NULL, 'ORD' + FORMAT(GETDATE(), 'ddMMyyyy'), 1);

				-- Level 2: Đại lý
				INSERT INTO #TempOrder (OrderId, ParentId, SortOrder, OrderCode, OrderName, AgentCode, AgentName, FarmCode, FarmerName, DatePurchase, TotalFinishedProductKg, TotalCentrifugeProductKg, SortIdList, IsOpenChild)
				SELECT 
					99 AS OrderId,
					1 AS ParentId,
					2 AS SortOrder,
					NULL AS OrderCode,
					NULL AS OrderName,
					Agent.AgentCode,
					Agent.AgentName,
					NULL AS FarmCode,
					NULL AS FarmerName,
					DatePurchase = CONVERT(VARCHAR(10), MAX(ISNULL(Intake.UpdateDate, Intake.RegisterDate)), 111),
					SUM(ISNULL(Intake.FinishedProductKg, 0)) AS FinishedProductKg,
					SUM(ISNULL(Intake.CentrifugeProductKg, 0)) AS CentrifugeProductKg,
					'ORD' + FORMAT(GETDATE(), 'ddMMyyyy') + '__' + Agent.AgentCode AS SortList,
					1 AS IsOpenChild
				FROM RubberIntake Intake
				LEFT JOIN RubberFarm Farm ON Farm.FarmCode = Intake.FarmCode
				LEFT JOIN RubberAgent Agent ON Agent.AgentCode = Farm.AgentCode
				WHERE Intake.Status = 1
				GROUP BY Agent.AgentCode, Agent.AgentName
				ORDER BY Agent.AgentCode;

				-- Level 3: Nhà vườn
				INSERT INTO #TempOrder (OrderId, ParentId, SortOrder, OrderCode, OrderName, AgentCode, AgentName, FarmCode, FarmerName, DatePurchase, TotalFinishedProductKg, TotalCentrifugeProductKg, SortIdList, IsOpenChild)
				SELECT 
					ROW_NUMBER() OVER (ORDER BY Farm.FarmId) + 100 AS OrderId,
					2 AS ParentId,
					3 AS SortOrder,
					NULL AS OrderCode,
					NULL AS OrderName,
					Agent.AgentCode,
					NULL AS AgentName,
					Farm.FarmCode,
					Farm.FarmerName,
					DatePurchase = CONVERT(VARCHAR(10), ISNULL(Intake.UpdateDate, Intake.RegisterDate), 111),
					Intake.FinishedProductKg,
					Intake.CentrifugeProductKg,
					'ORD' + FORMAT(GETDATE(), 'ddMMyyyy') + '__' + Agent.AgentCode + '__' + Farm.FarmCode AS SortIdList,
					IsOpenChild = 0
				FROM RubberFarm Farm
				LEFT JOIN RubberIntake Intake ON Farm.FarmCode = Intake.FarmCode
				LEFT JOIN RubberAgent Agent ON Agent.AgentCode = Farm.AgentCode
				WHERE Intake.Status = 1
				
				-- Level 1: Đơn hàng
				INSERT INTO #TempOrder (OrderId, ParentId, SortOrder, OrderCode, OrderName, AgentCode, AgentName, FarmCode, FarmerName, DatePurchase, TotalFinishedProductKg, TotalCentrifugeProductKg, SortIdList, IsOpenChild)
				--VALUES (1, NULL, 1, 'ORD' + FORMAT(GETDATE(), 'ddMMyyyy'), N'đơn hàng 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ORD' + FORMAT(GETDATE(), 'ddMMyyyy'), 1);
				SELECT
					1 AS OrderId,
					NULL AS ParentId,
					1 AS SortOrder,
					'ORD' + FORMAT(GETDATE(), 'ddMMyyyy') AS OrderCode,
					N'đơn hàng 1' AS OrderName,
					NULL AS AgentCode,
					NULL AS AgentName,
					NULL AS FarmCode,
					NULL AS FarmerName,
					NULL AS DatePurchase,
					SUM(ISNULL(TotalFinishedProductKg, 0)) AS TotalFinishedProductKg,
					SUM(ISNULL(TotalCentrifugeProductKg, 0)) AS TotalCentrifugeProductKg,
					'ORD' + FORMAT(GETDATE(), 'ddMMyyyy')  AS SortIdList,
					1 AS IsOpenChild
				FROM #TempOrder
				WHERE SortOrder = 2;



				-- Kết quả
				SELECT OrderId, ParentId, SortOrder, OrderCode, OrderName, AgentCode,  AgentName, FarmCode, FarmerName, DatePurchase = CONVERT(varchar(10), DatePurchase, 120), TotalFinishedProductKg, TotalCentrifugeProductKg, SortIdList, IsOpenChild
				FROM #TempOrder
				ORDER BY OrderCode DESC, AgentCode, CASE WHEN FarmCode IS NULL THEN 0 ELSE 1 END
				DROP TABLE #TempOrder;
			";
			return await dbHelper.QueryAsync<RubberOrderDto>(sql);
		}
		#region Pallet
		public async Task<List<RubberPalletDto>> GetPallets(int orderId)
		{
			var sql = @"
				SELECT 
					ROW_NUMBER() OVER (ORDER BY Pallet.PalletId) + 100 AS rowNo
					, OrderCode = rubOrder.orderCode
					, OrderName = rubOrder.OrderName
					, PalletCode = Pallet.PalletCode
					, WeightKg = Pallet.WeightKg
					, UpdateDate = Pallet.UpdateDate
					, UpdatePerson = Pallet.UpdatePerson
				FROM RubberPallets Pallet
				LEFT JOIN RubberOrderSummary rubOrder ON Pallet.OrderId = rubOrder.OrderId
				WHERE Pallet.OrderId = '" + orderId + @"'
			";
			return await dbHelper.QueryAsync<RubberPalletDto>(sql);
		}
		#endregion
	}
}
