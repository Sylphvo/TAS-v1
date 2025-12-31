using Dapper;
using System.Data;
using TAS.DTOs;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class TraceabilityModels
	{
		private readonly ConnectDbHelper _dbHelper;
		private readonly ILogger<TraceabilityModels> _logger;

		public TraceabilityModels(ConnectDbHelper dbHelper, ILogger<TraceabilityModels> logger)
		{
			_dbHelper = dbHelper;
			_logger = logger;
		}

		// ========================================
		// GET TRACEABILITY TABLE DATA - V2 FIXED
		// ========================================
		public async Task<List<TraceabilityRowDto>> GetTableDataAsync(bool showAll = false)
		{
			try
			{
				var sql = @"
                    WITH OrdersWithRowNum AS (
                        SELECT 
                            ROW_NUMBER() OVER (ORDER BY o.OrderId) AS RowNum,
                            o.OrderId,
                            o.OrderCode,
                            o.BuyerCompany,
                            o.OrderDate,
                            SUM(p.CurrentNetKg) AS TotalNetKg
                        FROM RubberOrder o
                        LEFT JOIN RubberOrderPond op ON op.OrderId = o.OrderId
                        LEFT JOIN RubberPond p ON p.PondId = op.PondId
                        WHERE o.OrderDate >= DATEADD(MONTH, -3, GETDATE())
                        GROUP BY o.OrderId, o.OrderCode, o.BuyerCompany, o.OrderDate
                    ),
                    PondsWithRowNum AS (
                        SELECT 
                            ROW_NUMBER() OVER (ORDER BY o.OrderCode, p.PondCode) AS RowNum,
                            o.OrderCode,
                            p.PondId,
                            p.PondCode,
                            p.PondName,
                            SUM(p.CurrentNetKg) AS TotalNetKg
                        FROM RubberOrder o
                        INNER JOIN RubberOrderPond op ON op.OrderId = o.OrderId
                        INNER JOIN RubberPond p ON p.PondId = op.PondId
                        WHERE o.OrderDate >= DATEADD(MONTH, -3, GETDATE())
                        GROUP BY o.OrderCode, p.PondId, p.PondCode, p.PondName
                    ),
                    AgentsWithRowNum AS (
                        SELECT 
                            ROW_NUMBER() OVER (ORDER BY o.OrderCode, p.PondCode, a.AgentCode) AS RowNum,
                            o.OrderCode,
                            p.PondCode,
                            a.AgentCode,
                            a.AgentName,
                            -- Calculate total from RubberPondIntake
                            SUM(pi.PouredKg) AS TotalKg
                        FROM RubberOrder o
                        INNER JOIN RubberOrderPond op ON op.OrderId = o.OrderId
                        INNER JOIN RubberPond p ON p.PondId = op.PondId
                        INNER JOIN RubberAgent a ON a.AgentCode = p.AgentCode
                        LEFT JOIN RubberPondIntake pi ON pi.PondId = p.PondId
                        WHERE o.OrderDate >= DATEADD(MONTH, -3, GETDATE())
                        GROUP BY o.OrderCode, p.PondCode, a.AgentCode, a.AgentName
                    )

                    -- Level 1: Orders
                    SELECT 
                        ow.RowNum AS OrderId,
                        CAST(NULL AS INT) AS ParentId,
                        1 AS SortOrder,
                        ow.OrderCode,
                        ow.BuyerCompany AS OrderName,
                        CAST(NULL AS NVARCHAR(50)) AS PondCode,
                        CAST(NULL AS NVARCHAR(200)) AS PondName,
                        CAST(NULL AS NVARCHAR(50)) AS AgentCode,
                        CAST(NULL AS NVARCHAR(200)) AS AgentName,
                        CAST(NULL AS NVARCHAR(50)) AS FarmCode,
                        CAST(NULL AS NVARCHAR(200)) AS FarmerName,
                        ow.TotalNetKg AS TotalFinishedProductKg,
                        0.00 AS TotalCentrifugeProductKg,
                        ow.OrderDate AS DatePurchase,
                        ow.OrderCode AS SortList,
                        0 AS IsOpenChild
                    FROM OrdersWithRowNum ow

                    UNION ALL

                    -- Level 2: Ponds
                    SELECT 
                        pw.RowNum + 1000 AS OrderId,
                        ow.RowNum AS ParentId,
                        2 AS SortOrder,
                        CAST(NULL AS NVARCHAR(50)) AS OrderCode,
                        CAST(NULL AS NVARCHAR(200)) AS OrderName,
                        pw.PondCode,
                        pw.PondName,
                        CAST(NULL AS NVARCHAR(50)) AS AgentCode,
                        CAST(NULL AS NVARCHAR(200)) AS AgentName,
                        CAST(NULL AS NVARCHAR(50)) AS FarmCode,
                        CAST(NULL AS NVARCHAR(200)) AS FarmerName,
                        pw.TotalNetKg AS TotalFinishedProductKg,
                        0.00 AS TotalCentrifugeProductKg,
                        CAST(NULL AS DATETIME) AS DatePurchase,
                        ow.OrderCode + '__' + pw.PondCode AS SortList,
                        0 AS IsOpenChild
                    FROM PondsWithRowNum pw
                    INNER JOIN OrdersWithRowNum ow ON ow.OrderCode = pw.OrderCode

                    UNION ALL

                    -- Level 3: Agents
                    SELECT 
                        aw.RowNum + 2000 AS OrderId,
                        pw.RowNum + 1000 AS ParentId,
                        3 AS SortOrder,
                        CAST(NULL AS NVARCHAR(50)) AS OrderCode,
                        CAST(NULL AS NVARCHAR(200)) AS OrderName,
                        CAST(NULL AS NVARCHAR(50)) AS PondCode,
                        CAST(NULL AS NVARCHAR(200)) AS PondName,
                        aw.AgentCode,
                        aw.AgentName,
                        CAST(NULL AS NVARCHAR(50)) AS FarmCode,
                        CAST(NULL AS NVARCHAR(200)) AS FarmerName,
                        aw.TotalKg AS TotalFinishedProductKg,
                        0.00 AS TotalCentrifugeProductKg,
                        CAST(NULL AS DATETIME) AS DatePurchase,
                        ow.OrderCode + '__' + aw.PondCode + '__' + aw.AgentCode AS SortList,
                        0 AS IsOpenChild
                    FROM AgentsWithRowNum aw
                    INNER JOIN OrdersWithRowNum ow ON ow.OrderCode = aw.OrderCode
                    INNER JOIN PondsWithRowNum pw ON pw.OrderCode = aw.OrderCode AND pw.PondCode = aw.PondCode

                    UNION ALL

                    -- Level 4: Farms (Intakes) - FIXED JOIN
                    SELECT 
                        ROW_NUMBER() OVER (ORDER BY o.OrderCode, p.PondCode, a.AgentCode, intake.FarmCode, pi.PondIntakeId) + 3000 AS OrderId,
                        aw.RowNum + 2000 AS ParentId,
                        4 AS SortOrder,
                        CAST(NULL AS NVARCHAR(50)) AS OrderCode,
                        CAST(NULL AS NVARCHAR(200)) AS OrderName,
                        CAST(NULL AS NVARCHAR(50)) AS PondCode,
                        CAST(NULL AS NVARCHAR(200)) AS PondName,
                        CAST(NULL AS NVARCHAR(50)) AS AgentCode,
                        CAST(NULL AS NVARCHAR(200)) AS AgentName,
                        intake.FarmCode,
                        f.FarmerName AS FarmerName,
                        pi.PouredKg AS TotalFinishedProductKg,
                        intake.FinishedProductKg AS TotalCentrifugeProductKg,
                        CAST(intake.RegisterDate AS DATETIME) AS DatePurchase,
                        o.OrderCode + '__' + p.PondCode + '__' + a.AgentCode + '__' + intake.FarmCode + '__' + CAST(pi.PondIntakeId AS NVARCHAR(10)) AS SortList,
                        0 AS IsOpenChild
                    FROM RubberOrder o
                    INNER JOIN RubberOrderPond op ON op.OrderId = o.OrderId
                    INNER JOIN RubberPond p ON p.PondId = op.PondId
                    INNER JOIN RubberAgent a ON a.AgentCode = p.AgentCode
                    -- FIX: Join RubberPondIntake → RubberIntake → RubberFarm
                    INNER JOIN RubberPondIntake pi ON pi.PondId = p.PondId
                    INNER JOIN RubberIntake intake ON intake.IntakeId = pi.IntakeId
                    INNER JOIN RubberFarm f ON f.FarmCode = intake.FarmCode
                    INNER JOIN AgentsWithRowNum aw ON aw.OrderCode = o.OrderCode 
                        AND aw.PondCode = p.PondCode 
                        AND aw.AgentCode = a.AgentCode
                    WHERE o.OrderDate >= DATEADD(MONTH, -3, GETDATE())

                    ORDER BY SortList;
                ";

				var results = await _dbHelper.QueryAsync<TraceabilityRowDto>(sql);
				return results.ToList();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetTableDataAsync");
				throw;
			}
		}

		// ========================================
		// GET BY ORDER CODE - SIMPLIFIED
		// ========================================
		public async Task<List<TraceabilityRowDto>> GetTraceabilityByOrderAsync(string orderCode)
		{
			try
			{
				var sql = @"
                    WITH AgentsWithRowNum AS (
                        SELECT 
                            ROW_NUMBER() OVER (ORDER BY a.AgentCode) AS RowNum,
                            a.AgentCode,
                            a.AgentName,
                            MAX(i.RegisterDate) AS DatePurchase,
                            SUM(pi.PouredKg) AS TotalKg
                        FROM RubberOrder o
                        INNER JOIN RubberOrderPond op ON op.OrderId = o.OrderId
                        INNER JOIN RubberPond p ON p.PondId = op.PondId
                        INNER JOIN RubberAgent a ON a.AgentCode = p.AgentCode
                        LEFT JOIN RubberPondIntake pi ON pi.PondId = p.PondId
                        LEFT JOIN RubberIntake i ON i.IntakeId = pi.IntakeId
                        WHERE o.OrderCode = @OrderCode
                        GROUP BY a.AgentCode, a.AgentName
                    )
                    -- Level 1: Order
                    SELECT 
                        1 AS OrderId,
                        CAST(NULL AS INT) AS ParentId,
                        1 AS SortOrder,
                        o.OrderCode,
                        o.BuyerCompany AS OrderName,
                        CAST(NULL AS NVARCHAR(50)) AS AgentCode,
                        CAST(NULL AS NVARCHAR(255)) AS AgentName,
                        CAST(NULL AS NVARCHAR(50)) AS FarmCode,
                        CAST(NULL AS NVARCHAR(255)) AS FarmerName,
                        CAST(NULL AS DATETIME) AS DatePurchase,
                        o.TotalNetKg AS TotalFinishedProductKg,
                        CAST(NULL AS DECIMAL(18,2)) AS TotalCentrifugeProductKg,
                        o.OrderCode AS SortList,
                        CAST(1 AS BIT) AS IsOpenChild
                    FROM RubberOrder o
                    WHERE o.OrderCode = @OrderCode

                    UNION ALL

                    -- Level 2: Agents
                    SELECT 
                        aw.RowNum + 100 AS OrderId,
                        1 AS ParentId,
                        1 AS SortOrder,
                        CAST(NULL AS NVARCHAR(50)) AS OrderCode,
                        CAST(NULL AS NVARCHAR(255)) AS OrderName,
                        aw.AgentCode,
                        aw.AgentName,
                        CAST(NULL AS NVARCHAR(50)) AS FarmCode,
                        CAST(NULL AS NVARCHAR(255)) AS FarmerName,
                        aw.DatePurchase,
                        aw.TotalKg AS TotalFinishedProductKg,
                        CAST(NULL AS DECIMAL(18,2)) AS TotalCentrifugeProductKg,
                        @OrderCode + '__' + aw.AgentCode AS SortList,
                        CAST(1 AS BIT) AS IsOpenChild
                    FROM AgentsWithRowNum aw

                    UNION ALL

                    -- Level 3: Farms
                    SELECT 
                        ROW_NUMBER() OVER (ORDER BY a.AgentCode, f.FarmCode, i.IntakeId) + 200 AS OrderId,
                        aw.RowNum + 100 AS ParentId,
                        2 AS SortOrder,
                        CAST(NULL AS NVARCHAR(50)) AS OrderCode,
                        CAST(NULL AS NVARCHAR(255)) AS OrderName,
                        a.AgentCode,
                        CAST(NULL AS NVARCHAR(255)) AS AgentName,
                        f.FarmCode,
                        f.FarmerName,
                        i.RegisterDate AS DatePurchase,
                        pi.PouredKg AS TotalFinishedProductKg,
                        CAST(NULL AS DECIMAL(18,2)) AS TotalCentrifugeProductKg,
                        @OrderCode + '__' + a.AgentCode + '__' + f.FarmCode + '__' + CAST(i.IntakeId AS NVARCHAR) AS SortList,
                        CAST(0 AS BIT) AS IsOpenChild
                    FROM RubberOrder o
                    INNER JOIN RubberOrderPond op ON op.OrderId = o.OrderId
                    INNER JOIN RubberPond p ON p.PondId = op.PondId
                    INNER JOIN RubberAgent a ON a.AgentCode = p.AgentCode
                    INNER JOIN RubberPondIntake pi ON pi.PondId = p.PondId
                    INNER JOIN RubberIntake i ON i.IntakeId = pi.IntakeId
                    INNER JOIN RubberFarm f ON f.FarmCode = i.FarmCode
                    INNER JOIN AgentsWithRowNum aw ON aw.AgentCode = a.AgentCode
                    WHERE o.OrderCode = @OrderCode

                    ORDER BY SortList, SortOrder
                ";

				var results = await _dbHelper.QueryAsync<TraceabilityRowDto>(sql, new { OrderCode = orderCode });
				return results.ToList();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetTraceabilityByOrderAsync");
				throw;
			}
		}
	}
}
