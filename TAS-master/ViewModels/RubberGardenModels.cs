using System.Data;
using TAS.Models;
using TAS.Repository;
using TAS.TagHelpers;


namespace TAS.ViewModels
{
	public class RubberGardenModels
	{
		private readonly ICurrentUser _userManage;
		private readonly ILogger<RubberGardenModels> _logger;
		ConnectDbHelper dbHelper = new ConnectDbHelper();
		public RubberGardenModels(ICurrentUser userManage, ILogger<RubberGardenModels> logger)
		{
			_userManage = userManage;
			_logger = logger;
		}
		// Model
		public async Task<List<RubberIntakeRequest>> GetRubberFarmAsync()
		{
			var sql = @"
				SELECT 
					rowNo = ROW_NUMBER() OVER(ORDER BY IntakeId ASC),
					intakeId = A.intakeId,
					agentCode = C.AgentCode,
					farmCode = A.FarmCode,
					farmerName = A.farmerName,
					rubberKg = A.rubberKg,
					tscPercent = A.tscPercent,
					drcPercent = A.drcPercent,
					finishedProductKg = A.finishedProductKg,
					centrifugeProductKg = A.centrifugeProductKg,
					status = A.status,
					timeDate_Person = ISNULL(A.UpdatePerson, A.RegisterPerson),
					timeDate = CONVERT(VARCHAR,ISNULL(A.UpdateDate, A.RegisterDate),111) + ' ' + CONVERT(VARCHAR(5),ISNULL(A.UpdateDate, A.RegisterDate), 108)
				FROM [RubberIntake] A
				LEFT JOIN RubberFarm B ON B.FarmCode = A.FarmCode
				LEFT JOIN RubberAgent C ON C.AgentCode = B.AgentCode
			";
			return await dbHelper.QueryAsync<RubberIntakeRequest>(sql);
		}
		public int AddOrUpdateRubber(RubberIntakeRequest rubberIntakeRequest)
		{
			try
			{
				if (rubberIntakeRequest == null)
				{
					throw new ArgumentNullException(nameof(rubberIntakeRequest), "Input data cannot be null.");
				}
				var sql = @"
				IF EXISTS (SELECT 1 FROM RubberIntake WHERE IntakeId = @IntakeId)
				BEGIN
					UPDATE RubberIntake SET
					FarmCode            = @FarmCode,
					FarmerName          = @FarmerName,
					RubberKg            = @RubberKg,
					TSCPercent          = @TSCPercent,
					DRCPercent          = @DRCPercent,
					FinishedProductKg   = @FinishedProductKg,
					CentrifugeProductKg = @CentrifugeProductKg,
					[Status]            = @Status,
					UpdateDate          = GETDATE(),
					UpdatePerson        = @UpdatePerson
					WHERE IntakeId = @IntakeId
					SELECT 0;
				END
				ELSE
				BEGIN
					INSERT INTO RubberIntake
					(FarmCode, FarmerName, RubberKg, TSCPercent, DRCPercent,
						FinishedProductKg, CentrifugeProductKg, [Status],
						RegisterDate, RegisterPerson)
					VALUES
					(@FarmCode, @FarmerName, @RubberKg, @TSCPercent, @DRCPercent,
						@FinishedProductKg, @CentrifugeProductKg, @Status,
						GETDATE(), @RegisterPerson)
					SELECT SCOPE_IDENTITY() AS NewIntakeId;
				END";
				// With this line:
				var lstResult = dbHelper.Execute(sql, new
				{
					FarmCode = rubberIntakeRequest.farmCode,
					FarmerName = rubberIntakeRequest.farmerName,
					RubberKg = rubberIntakeRequest.rubberKg,
					TSCPercent = rubberIntakeRequest.tscPercent,
					DRCPercent = rubberIntakeRequest.drcPercent,
					FinishedProductKg = rubberIntakeRequest.finishedProductKg,   // 4.62m
					CentrifugeProductKg = rubberIntakeRequest.centrifugeProductKg, // 6.93m
					Status = rubberIntakeRequest.status ?? 0,
					UpdatePerson = _userManage.Name,
					RegisterPerson = _userManage.Name,
					IntakeId = rubberIntakeRequest.intakeId
				});
				return lstResult;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in AddOrUpdateRubber method.");
				return 0;
			}
		}
		public int ImportListData(List<RubberIntakeRequest> lstRubberIntakeRequest)
		{
			try
			{
				const string sql = @"
				INSERT INTO RubberIntake
				(FarmCode, FarmerName, RubberKg, TSCPercent, DRCPercent,
					FinishedProductKg, CentrifugeProductKg, Status, RegisterDate, RegisterPerson)
				VALUES
				(@FarmCode, @FarmerName, @RubberKg, @TSCPercent, @DRCPercent,
					@FinishedProductKg, @CentrifugeProductKg, @Status, GETDATE(), @RegisterPerson);";

				dbHelper.Execute(sql,
				lstRubberIntakeRequest.Select(x => new
				{
					FarmCode = x.farmCode,
					FarmerName = x.farmerName,
					RubberKg = x.rubberKg ?? 0m,
					TSCPercent = x.tscPercent ?? 0m,
					DRCPercent = x.drcPercent ?? 0m,
					FinishedProductKg = x.finishedProductKg ?? 0m,
					CentrifugeProductKg = x.centrifugeProductKg ?? 0m,
					Status = 0,
					RegisterPerson = _userManage.Name
				}));

				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ImportListData method.");
				return 0;
			}
		}
		public int AddOrUpdateRubberFull(List<RubberIntakeRequest> lstRubberIntakeRequest)
		{
			try
			{

				const string sql = @"
				UPDATE RubberIntake SET
					FarmCode = @FarmCode,
					FarmerName = @FarmerName,
					RubberKg = @RubberKg,
					TSCPercent = @TSCPercent,
					DRCPercent = @DRCPercent,
					FinishedProductKg = @FinishedProductKg,
					CentrifugeProductKg = @CentrifugeProductKg,
					Status = @Status,
					UpdateDate = GETDATE(),
					UpdatePerson = @UpdatePerson
				WHERE IntakeId = @IntakeId;
				";

				dbHelper.Execute(sql,
				lstRubberIntakeRequest.Select(x => new
				{
					IntakeId = x.intakeId,                  // QUAN TRỌNG
					FarmCode = x.farmCode,
					FarmerName = x.farmerName,
					RubberKg = x.rubberKg ?? 0m,
					TSCPercent = x.tscPercent ?? 0m,
					DRCPercent = x.drcPercent ?? 0m,
					FinishedProductKg = x.finishedProductKg ?? 0m,
					CentrifugeProductKg = x.centrifugeProductKg ?? 0m,
					Status = x.status ?? 0,
					UpdatePerson = _userManage.Name
				}));
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in AddOrUpdateRubberFull method.");
				return 0;
			}
		}
		public int ApproveDataRubber(int intakeId, int status)
		{
			try
			{
				string sql = @"
					UPDATE RubberIntake SET Status = " + status + @" WHERE IntakeId = " + intakeId + @"
				";
				dbHelper.Execute(sql);
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ApproveDataRubber method.");
				return 0;
			}
		}
		public int ApproveAllDataRubber(int status)
		{
			try
			{
				string sql = @"
					UPDATE RubberIntake 
					SET Status = " + status + @", UpdateDate = GETDATE(), UpdatePerson = '" + _userManage.Name + @"'
				";
				dbHelper.Execute(sql);
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ApproveAllDataRubber method.");
				return 0;
			}
		}
		public int DeleteRubber(int intakeId)
		{
			try
			{
				string sql = @"
					DELETE FROM RubberIntake WHERE IntakeId = " + intakeId + @"
				";
				dbHelper.Execute(sql);
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in DeleteRubber method.");
				return 0;
			}
		}
		public int CreateOrder(string OrderName)
		{
			try
			{

				string sql = @"
					DECLARE @OrderCode VARCHAR(50);

					SELECT @OrderCode =
						'ORD' 
						+ FORMAT(GETDATE(), 'ddMMyyyy')
						+ '_' 
						+ RIGHT('000' + CAST(
							ISNULL(
								(
									SELECT MAX(CAST(SUBSTRING(OrderCode, 12, 3) AS INT))
									FROM RubberOrderSummary
									WHERE OrderCode LIKE 'ORD' + FORMAT(GETDATE(), 'ddMMyyyy') + '%'
								)
							, 0) + 1 AS VARCHAR(3))
						  , 3);

					INSERT INTO RubberOrderSummary (OrderCode, OrderName, UpdateDate, UpdatePerson)
					VALUES(@OrderCode, N'" + OrderName + @"', GETDATE(), '" + _userManage.Name + @"')
				";
				dbHelper.Execute(sql);
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in CreateOrder method.");
				return 0;
			}
		}

	}
}
