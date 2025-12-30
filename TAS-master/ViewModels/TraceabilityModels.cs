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
		// GET TRACEABILITY TABLE DATA
		// ========================================
		public async Task<List<TraceabilityRowDto>> GetTraceabilityTableAsync(bool showAll = false)
		{
			try
			{
				var sql = @"
                    -- Level 1: Orders
                    SELECT 
                        ROW_NUMBER() OVER (ORDER BY o.OrderId) AS OrderId,
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
                    WHERE o.OrderDate >= DATEADD(MONTH, -3, GETDATE()) -- Last 3 months

                    UNION ALL

                    -- Level 2: Agents per Order
                    SELECT 
                        ROW_NUMBER() OVER (ORDER BY o.OrderId, a.AgentCode) + 1000 AS OrderId,
                        ROW_NUMBER() OVER (ORDER BY o2.OrderId) AS ParentId,
                        1 AS SortOrder,
                        CAST(NULL AS NVARCHAR(50)) AS OrderCode,
                        CAST(NULL AS NVARCHAR(255)) AS OrderName,
                        a.AgentCode,
                        a.AgentName,
                        CAST(NULL AS NVARCHAR(50)) AS FarmCode,
                        CAST(NULL AS NVARCHAR(255)) AS FarmerName,
                        MAX(i.RegisterDate) AS DatePurchase,
                        SUM(DISTINCT p.CurrentNetKg) AS TotalFinishedProductKg,
                        CAST(NULL AS DECIMAL(18,2)) AS TotalCentrifugeProductKg,
                        o.OrderCode + '__' + a.AgentCode AS SortList,
                        CAST(1 AS BIT) AS IsOpenChild
                    FROM RubberOrder o
                    INNER JOIN RubberOrderPond op ON op.OrderId = o.OrderId
                    INNER JOIN RubberPond p ON p.PondId = op.PondId
                    INNER JOIN RubberAgent a ON a.AgentCode = p.AgentCode
                    LEFT JOIN RubberPondIntake pi ON pi.PondId = p.PondId
                    LEFT JOIN RubberIntake i ON i.IntakeId = pi.IntakeId
                    INNER JOIN RubberOrder o2 ON o2.OrderCode = o.OrderCode
                    WHERE o.OrderDate >= DATEADD(MONTH, -3, GETDATE())
                    GROUP BY o.OrderId, o.OrderCode, a.AgentCode, a.AgentName

                    UNION ALL

                    -- Level 3: Farms per Agent per Order
                    SELECT 
                        ROW_NUMBER() OVER (ORDER BY o.OrderId, a.AgentCode, f.FarmCode) + 2000 AS OrderId,
                        ROW_NUMBER() OVER (ORDER BY o2.OrderId, a2.AgentCode) + 1000 AS ParentId,
                        2 AS SortOrder,
                        CAST(NULL AS NVARCHAR(50)) AS OrderCode,
                        CAST(NULL AS NVARCHAR(255)) AS OrderName,
                        a.AgentCode,
                        CAST(NULL AS NVARCHAR(255)) AS AgentName,
                        f.FarmCode,
                        f.FarmerName,
                        i.RegisterDate AS DatePurchase,
                        SUM(pi.PouredKg) AS TotalFinishedProductKg,
                        CAST(NULL AS DECIMAL(18,2)) AS TotalCentrifugeProductKg,
                        o.OrderCode + '__' + a.AgentCode + '__' + f.FarmCode AS SortList,
                        CAST(0 AS BIT) AS IsOpenChild
                    FROM RubberOrder o
                    INNER JOIN RubberOrderPond op ON op.OrderId = o.OrderId
                    INNER JOIN RubberPond p ON p.PondId = op.PondId
                    INNER JOIN RubberAgent a ON a.AgentCode = p.AgentCode
                    INNER JOIN RubberPondIntake pi ON pi.PondId = p.PondId
                    INNER JOIN RubberIntake i ON i.IntakeId = pi.IntakeId
                    INNER JOIN RubberFarm f ON f.FarmCode = i.FarmCode
                    CROSS APPLY (
                        SELECT TOP 1 o2.OrderId, a2.AgentCode 
                        FROM RubberOrder o2 
                        INNER JOIN RubberOrderPond op2 ON op2.OrderId = o2.OrderId
                        INNER JOIN RubberPond p2 ON p2.PondId = op2.PondId
                        INNER JOIN RubberAgent a2 ON a2.AgentCode = p2.AgentCode
                        WHERE o2.OrderCode = o.OrderCode AND a2.AgentCode = a.AgentCode
                    ) AS parent
                    WHERE o.OrderDate >= DATEADD(MONTH, -3, GETDATE())
                    GROUP BY o.OrderId, o.OrderCode, a.AgentCode, f.FarmCode, f.FarmerName, i.RegisterDate

                    ORDER BY SortList, SortOrder
                ";

				var results = await _dbHelper.QueryAsync<TraceabilityRowDto>(sql);
				return results.ToList();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetTraceabilityTableAsync");
				throw;
			}
		}

		// ========================================
		// GET FILTERED DATA (BY ORDER CODE)
		// ========================================
		public async Task<List<TraceabilityRowDto>> GetTraceabilityByOrderAsync(string orderCode)
		{
			try
			{
				var sql = @"
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
                        ROW_NUMBER() OVER (ORDER BY a.AgentCode) + 100 AS OrderId,
                        1 AS ParentId,
                        1 AS SortOrder,
                        CAST(NULL AS NVARCHAR(50)) AS OrderCode,
                        CAST(NULL AS NVARCHAR(255)) AS OrderName,
                        a.AgentCode,
                        a.AgentName,
                        CAST(NULL AS NVARCHAR(50)) AS FarmCode,
                        CAST(NULL AS NVARCHAR(255)) AS FarmerName,
                        MAX(i.RegisterDate) AS DatePurchase,
                        SUM(pi.PouredKg) AS TotalFinishedProductKg,
                        CAST(NULL AS DECIMAL(18,2)) AS TotalCentrifugeProductKg,
                        @OrderCode + '__' + a.AgentCode AS SortList,
                        CAST(1 AS BIT) AS IsOpenChild
                    FROM RubberOrder o
                    INNER JOIN RubberOrderPond op ON op.OrderId = o.OrderId
                    INNER JOIN RubberPond p ON p.PondId = op.PondId
                    INNER JOIN RubberAgent a ON a.AgentCode = p.AgentCode
                    LEFT JOIN RubberPondIntake pi ON pi.PondId = p.PondId
                    LEFT JOIN RubberIntake i ON i.IntakeId = pi.IntakeId
                    WHERE o.OrderCode = @OrderCode
                    GROUP BY a.AgentCode, a.AgentName

                    UNION ALL

                    -- Level 3: Farms
                    SELECT 
                        ROW_NUMBER() OVER (ORDER BY a.AgentCode, f.FarmCode, i.RegisterDate) + 200 AS OrderId,
                        ROW_NUMBER() OVER (PARTITION BY a.AgentCode ORDER BY a.AgentCode) + 100 AS ParentId,
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
                        @OrderCode + '__' + a.AgentCode + '__' + f.FarmCode + '__' + CONVERT(VARCHAR, i.IntakeId) AS SortList,
                        CAST(0 AS BIT) AS IsOpenChild
                    FROM RubberOrder o
                    INNER JOIN RubberOrderPond op ON op.OrderId = o.OrderId
                    INNER JOIN RubberPond p ON p.PondId = op.PondId
                    INNER JOIN RubberAgent a ON a.AgentCode = p.AgentCode
                    INNER JOIN RubberPondIntake pi ON pi.PondId = p.PondId
                    INNER JOIN RubberIntake i ON i.IntakeId = pi.IntakeId
                    INNER JOIN RubberFarm f ON f.FarmCode = i.FarmCode
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
