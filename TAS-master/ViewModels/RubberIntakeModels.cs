using Dapper;
using System.Data;
using TAS.Models;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class RubberIntakeModels
	{
		private readonly ICurrentUser _userManage;
		private readonly ILogger<RubberIntakeModels> _logger;
		private readonly ConnectDbHelper _dbHelper;

		public RubberIntakeModels(
			ICurrentUser userManage,
			ILogger<RubberIntakeModels> logger,
			ConnectDbHelper dbHelper)
		{
			_userManage = userManage;
			_logger = logger;
			_dbHelper = dbHelper;
		}

		// ========================================
		// Lấy danh sách FULL với filters
		// ========================================
		public async Task<List<RubberIntakeResponse>> GetAllIntakesAsync(
			string? agentCode = null,
			string? farmCode = null,
			string? orderCode = null,
			int? status = null)
		{
			try
			{
				string strQuery = string.Empty;
				if (agentCode != null || agentCode != "*") {
					strQuery += " AND (@AgentCode IS NULL OR a.AgentCode = @AgentCode) ";
				}
				if (farmCode != null || farmCode != "*") {
					strQuery += " AND (@FarmCode IS NULL OR i.FarmCode = @FarmCode) ";
				}
				if (status != null) {
					strQuery += " AND (@Status IS NULL OR i.Status = @Status) ";
				}

				var sql = @"
                    SELECT 
                        rowNo = ROW_NUMBER() OVER(ORDER BY i.RegisterDate DESC, i.IntakeId DESC),
                        intakeId = i.IntakeId,
                        intakeCode = i.IntakeCode,
                        agentCode = a.AgentCode,
                        agentName = a.AgentName,
                        farmCode = i.FarmCode,
                        farmerName = i.FarmerName,
                        rubberKg = i.RubberKg,
                        tscPercent = i.TSCPercent,
                        finishedProductKg = i.FinishedProductKg,
                        status = i.Status,
                        statusText = CASE i.Status
                            WHEN 0 THEN N'Chưa duyệt'
                            WHEN 1 THEN N'Chờ xử lý'
                            WHEN 2 THEN N'Đã vào hồ'
                            WHEN 3 THEN N'Hoàn thành'
                            ELSE N'Không xác định'
                        END,
                        timeDate_Person = ISNULL(i.UpdatePerson, i.RegisterPerson),
                        registerDate = i.RegisterDate,
                        timeDate = FORMAT(ISNULL(i.UpdateDate, i.RegisterDate), 'dd/MM/yyyy HH:mm')
                    FROM RubberIntake i
                    INNER JOIN RubberFarm f ON f.FarmCode = i.FarmCode
                    INNER JOIN RubberAgent a ON a.AgentCode = f.AgentCode
                    WHERE 1=1
                        " + strQuery + @"

                    ORDER BY i.RegisterDate DESC, i.IntakeId DESC
                ";

				return await _dbHelper.QueryAsync<RubberIntakeResponse>(sql, new
				{
					AgentCode = agentCode,
					FarmCode = farmCode,
					Status = status
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAllIntakesAsync");
				throw;
			}
		}

		// ========================================
		// Lấy 1 record theo ID
		// ========================================
		public async Task<RubberIntakeResponse?> GetIntakeByIdAsync(long intakeId)
		{
			try
			{
				var sql = @"
                    SELECT 
                        intakeId = i.IntakeId,
                        intakeCode = i.IntakeCode,
                        agentCode = a.AgentCode,
                        agentName = a.AgentName,
                        farmCode = i.FarmCode,
                        farmerName = i.FarmerName,
                        rubberKg = i.RubberKg,
                        tscPercent = i.TSCPercent,
                        finishedProductKg = i.FinishedProductKg,
                        status = i.Status,
                        registerDate = i.RegisterDate
                    FROM RubberIntake i
                    INNER JOIN RubberFarm f ON f.FarmCode = i.FarmCode
                    INNER JOIN RubberAgent a ON a.AgentCode = f.AgentCode
                    WHERE i.IntakeId = @IntakeId
                ";

				var result = await _dbHelper.QueryAsync<RubberIntakeResponse>(sql, new { IntakeId = intakeId });
				return result.FirstOrDefault();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetIntakeByIdAsync");
				throw;
			}
		}

		// ========================================
		// Thêm/Sửa 1 record
		// ========================================
		public int AddOrUpdateIntake(RubberIntakeRequest request)
		{
			try
			{
				if (request == null)
					throw new ArgumentNullException(nameof(request));

				// Validate
				if (string.IsNullOrWhiteSpace(request.farmCode))
					throw new ArgumentException("Mã nhà vườn không được để trống");

				var sql = @"
                    IF EXISTS (SELECT 1 FROM RubberIntake WHERE IntakeId = @IntakeId)
                    BEGIN
                        -- Update
                        UPDATE RubberIntake SET
                            FarmCode = @FarmCode,
                            FarmerName = @FarmerName,
                            RubberKg = @RubberKg,
                            TSCPercent = @TSCPercent,
                            FinishedProductKg = @FinishedProductKg,
                            Status = @Status,
                            UpdateDate = SYSDATETIME(),
                            UpdatePerson = @UpdatePerson
                        WHERE IntakeId = @IntakeId;
                        
                        SELECT @IntakeId;
                    END
                    ELSE
                    BEGIN
                        -- Insert
                        INSERT INTO RubberIntake (
                            IntakeCode, FarmCode, FarmerName, RubberKg, TSCPercent,
                            FinishedProductKg, Status, RegisterDate, RegisterPerson
                        )
                        VALUES (
                            @IntakeCode, @FarmCode, @FarmerName, @RubberKg, @TSCPercent,
                            @FinishedProductKg, @Status, SYSDATETIME(), @RegisterPerson
                        );
                        
                        SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
                    END
                ";

				// Generate IntakeCode nếu là Insert
				var intakeCode = request.intakeId > 0
					? request.intakeCode
					: $"INT_{DateTime.Now:yyyyMMdd}_{Guid.NewGuid().ToString()[..8].ToUpper()}";

				var result = _dbHelper.QueryFirstOrDefault<int>(sql, new
				{
					IntakeId = request.intakeId,
					IntakeCode = intakeCode,
					FarmCode = request.farmCode,
					FarmerName = request.farmerName,
					RubberKg = request.rubberKg ?? 0m,
					TSCPercent = request.tscPercent ?? 0m,
					FinishedProductKg = request.finishedProductKg ?? 0m,
					Status = request.status ?? 0,
					UpdatePerson = _userManage.Name,
					RegisterPerson = _userManage.Name
				});

				return result;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in AddOrUpdateIntake");
				throw;
			}
		}

		// ========================================
		// Lưu nhiều records (Bulk Update)
		// ========================================
		public int SaveAllIntakes(List<RubberIntakeRequest> lstIntakes)
		{
			try
			{
				var sql = @"
                    UPDATE RubberIntake SET
                        FarmCode = @FarmCode,
                        FarmerName = @FarmerName,
                        RubberKg = @RubberKg,
                        TSCPercent = @TSCPercent,
                        FinishedProductKg = @FinishedProductKg,
                        Status = @Status,
                        UpdateDate = SYSDATETIME(),
                        UpdatePerson = @UpdatePerson
                    WHERE IntakeId = @IntakeId;
                ";

				var affected = _dbHelper.Execute(sql,
					lstIntakes.Select(x => new
					{
						IntakeId = x.intakeId,
						FarmCode = x.farmCode,
						FarmerName = x.farmerName,
						RubberKg = x.rubberKg ?? 0m,
						TSCPercent = x.tscPercent ?? 0m,
						FinishedProductKg = x.finishedProductKg ?? 0m,
						Status = x.status ?? 0,
						UpdatePerson = _userManage.Name
					})
				);

				return affected;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in SaveAllIntakes");
				throw;
			}
		}

		// ========================================
		// Xóa 1 record
		// ========================================
		public int DeleteIntake(long intakeId)
		{
			try
			{
				// Check if used in pond
				var checkSql = @"
                    SELECT COUNT(*) 
                    FROM RubberPondIntake 
                    WHERE IntakeId = @IntakeId
                ";
				var usedInPond = _dbHelper.QueryFirstOrDefault<int>(checkSql, new { IntakeId = intakeId });

				if (usedInPond > 0)
					throw new InvalidOperationException("Không thể xóa. Dữ liệu đã được sử dụng trong hồ sản xuất.");

				var sql = "DELETE FROM RubberIntake WHERE IntakeId = @IntakeId";
				return _dbHelper.Execute(sql, new { IntakeId = intakeId });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in DeleteIntake");
				throw;
			}
		}

		// ========================================
		// Xóa nhiều records
		// ========================================
		public int DeleteMultipleIntakes(List<long> intakeIds)
		{
			try
			{
				var sql = @"
                    DELETE FROM RubberIntake 
                    WHERE IntakeId IN @IntakeIds
                    AND NOT EXISTS (
                        SELECT 1 FROM RubberPondIntake 
                        WHERE IntakeId = RubberIntake.IntakeId
                    )
                ";

				return _dbHelper.Execute(sql, new { IntakeIds = intakeIds });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in DeleteMultipleIntakes");
				throw;
			}
		}

		// ========================================
		// Import từ Excel
		// ========================================
		public int ImportFromExcel(List<RubberIntakeRequest> lstImport)
		{
			try
			{
				var sql = @"
                    INSERT INTO RubberIntake (
                        IntakeCode, FarmCode, FarmerName, RubberKg, TSCPercent,
                        FinishedProductKg, Status, RegisterDate, RegisterPerson
                    )
                    VALUES (
                        @IntakeCode, @FarmCode, @FarmerName, @RubberKg, @TSCPercent,
                        @FinishedProductKg, 0, SYSDATETIME(), @RegisterPerson
                    );
                ";

				var counter = 1;
				var affected = _dbHelper.Execute(sql,
					lstImport.Select(x => new
					{
						IntakeCode = $"INT_{DateTime.Now:yyyyMMdd}_IMP{counter++:D4}",
						FarmCode = x.farmCode,
						FarmerName = x.farmerName,
						RubberKg = x.rubberKg ?? 0m,
						TSCPercent = x.tscPercent ?? 0m,
						FinishedProductKg = x.finishedProductKg ?? 0m,
						RegisterPerson = _userManage.Name
					})
				);

				return affected;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ImportFromExcel");
				throw;
			}
		}

		// ========================================
		// Duyệt 1 record
		// ========================================
		public int ApproveIntake(long intakeId, int status)
		{
			try
			{
				var sql = @"
                    UPDATE RubberIntake 
                    SET Status = @Status,
                        UpdateDate = SYSDATETIME(),
                        UpdatePerson = @UpdatePerson
                    WHERE IntakeId = @IntakeId
                ";

				return _dbHelper.Execute(sql, new
				{
					IntakeId = intakeId,
					Status = status,
					UpdatePerson = _userManage.Name
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ApproveIntake");
				throw;
			}
		}

		// ========================================
		// Duyệt tất cả
		// ========================================
		public int ApproveAllIntakes(int status)
		{
			try
			{
				var sql = @"
                    UPDATE RubberIntake 
                    SET Status = @Status,
                        UpdateDate = SYSDATETIME(),
                        UpdatePerson = @UpdatePerson
                    WHERE Status = 0
                ";

				return _dbHelper.Execute(sql, new
				{
					Status = status,
					UpdatePerson = _userManage.Name
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ApproveAllIntakes");
				throw;
			}
		}

		// ========================================
		// Tạo đơn hàng mới
		// ========================================
		public int CreateOrder(string orderName)
		{
			try
			{
				var sql = @"
                    DECLARE @OrderCode NVARCHAR(50);
                    DECLARE @AgentCode NVARCHAR(50) = 'AG001'; -- Default agent

                    -- Generate OrderCode: ORD__YYYYMMDD__AG001__001
                    SELECT @OrderCode =
                        'ORD__' 
                        + FORMAT(SYSDATETIME(), 'yyyyMMdd')
                        + '__' + @AgentCode + '__'
                        + FORMAT(
                            ISNULL(
                                (
                                    SELECT MAX(CAST(RIGHT(OrderCode, 3) AS INT))
                                    FROM RubberOrder
                                    WHERE OrderCode LIKE 'ORD__' + FORMAT(SYSDATETIME(), 'yyyyMMdd') + '%'
                                )
                            , 0) + 1
                        , '000');

                    INSERT INTO RubberOrder (
                        OrderCode, AgentCode, BuyerCompany, OrderDate, 
                        Status, RegisterDate, RegisterPerson
                    )
                    VALUES (
                        @OrderCode, @AgentCode, @OrderName, CAST(SYSDATETIME() AS DATE),
                        1, SYSDATETIME(), @RegisterPerson
                    );
                ";

				return _dbHelper.Execute(sql, new
				{
					OrderName = orderName,
					RegisterPerson = _userManage.Name
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in CreateOrder");
				throw;
			}
		}
	}

	// ========================================
	// REQUEST/RESPONSE MODELS
	// ========================================
	public class RubberIntakeRequest
	{
		public long intakeId { get; set; }
		public string? intakeCode { get; set; }
		public string? farmCode { get; set; }
		public string? farmerName { get; set; }
		public decimal? rubberKg { get; set; }
		public decimal? tscPercent { get; set; }
		public decimal? finishedProductKg { get; set; }
		public int? status { get; set; }
	}

	public class RubberIntakeResponse
	{
		public long rowNo { get; set; }
		public long intakeId { get; set; }
		public string? intakeCode { get; set; }
		public string? agentCode { get; set; }
		public string? agentName { get; set; }
		public string? farmCode { get; set; }
		public string? farmerName { get; set; }
		public decimal rubberKg { get; set; }
		public decimal? tscPercent { get; set; }
		public decimal finishedProductKg { get; set; }
		public int status { get; set; }
		public string? statusText { get; set; }
		public string? timeDate_Person { get; set; }
		public DateTime registerDate { get; set; }
		public string? timeDate { get; set; }
	}
}