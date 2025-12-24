using TAS.Models;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class InformationGardenModels
	{
		private readonly ICurrentUser _userManage;
		private readonly ILogger<InformationGardenModels> _logger;
		ConnectDbHelper dbHelper = new ConnectDbHelper();
		public InformationGardenModels(ICurrentUser userManage, ILogger<InformationGardenModels> logger)
		{
			_userManage = userManage;
			_logger = logger;
		}
		// Model
		public async Task<List<RubberFarmRequest>> GetRubberFarmAsync()
		{
			var sql = @"
				SELECT 
					rowNo = ROW_NUMBER() OVER(ORDER BY A.FarmId ASC),
					A.FarmId,
					A.FarmCode,
					A.AgentCode,
					A.FarmerName,
					B.AgentName,
					A.FarmAddress,
					B.AgentAddress,
					A.Polygon,
					A.Certificates,
					A.TotalAreaHa,
					A.RubberAreaHa,
					A.TotalExploit,
					A.IsActive,
					UpdateBy = ISNULL(A.UpdatePerson, A.RegisterPerson),
					UpdateTime = CONVERT(VARCHAR,ISNULL(A.UpdateDate, A.RegisterDate),111) + ' ' + CONVERT(VARCHAR(5),ISNULL(A.UpdateDate, A.RegisterDate), 108)
				FROM RubberFarm A
				LEFT JOIN RubberAgent B ON A.AgentCode = B.AgentCode
			";
			return await dbHelper.QueryAsync<RubberFarmRequest>(sql);
		}

		public int ImportPolygon(RubberFarmRequest rubberFarmRequest)
		{
			try
			{
				string sql = @"
					UPDATE RubberFarm SET Polygon = N'" + rubberFarmRequest.Polygon + @"' WHERE FarmId = '" + rubberFarmRequest.FarmId + @"'";
				dbHelper.Execute(sql);
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ImportPolygon method.");
				return 0;
			}
		}
		public int ApproveDataFarm(int FarmId, int status)
		{
			try
			{
				string sql = @"
				UPDATE RubberFarm SET IsActive = " + status + @" WHERE FarmId = " + FarmId + @"";
				dbHelper.Execute(sql);
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ApproveDataFarm method.");
				return 0;
			}
		}
		public int AddOrUpdateRubberFarm(RubberFarmRequest rubberFarmRequest)
		{
			try
			{
				if (rubberFarmRequest == null)
				{
					throw new ArgumentNullException(nameof(rubberFarmRequest), "Input data cannot be null.");
				}
				var sql = @"
				IF EXISTS (SELECT 1 FROM RubberFarm WHERE FarmId = @FarmId)
				BEGIN
					UPDATE RubberFarm SET
					FarmCode        = @FarmCode,
					AgentCode		= @AgentCode,
					FarmerName      = @FarmerName,
					FarmPhone		= @FarmPhone,
					FarmAddress     = @FarmAddress,
					Certificates	= @Certificates,
					TotalAreaHa		= @TotalAreaHa,
					RubberAreaHa    = @RubberAreaHa,
					TotalExploit    = @TotalExploit,
					IsActive        = @IsActive,
					UpdateDate      = GETDATE(),
					UpdatePerson    = @UpdatePerson
					WHERE FarmId = @FarmId
					SELECT 0;
				END
				ELSE
				BEGIN
					INSERT INTO RubberFarm
					(FarmCode, AgentCode, FarmerName, FarmPhone, FarmAddress,
						Certificates, TotalAreaHa, RubberAreaHa,
						TotalExploit, IsActive, RegisterDate, RegisterPerson)
					VALUES
					(@FarmCode, @AgentCode, @FarmerName, @FarmPhone, @FarmAddress,
						@Certificates, @TotalAreaHa, @RubberAreaHa,
						@TotalExploit, @IsActive, GETDATE(), @RegisterPerson)
					SELECT SCOPE_IDENTITY() AS NewFarmId;
				END";
				// With this line:
				var lstResult = dbHelper.Execute(sql, new
				{
					FarmCode = rubberFarmRequest.FarmCode,
					AgentCode = rubberFarmRequest.AgentCode,
					FarmerName = rubberFarmRequest.FarmerName,
					FarmPhone = rubberFarmRequest.FarmPhone,
					FarmAddress = rubberFarmRequest.FarmAddress,
					Certificates = rubberFarmRequest.Certificates,
					TotalAreaHa = rubberFarmRequest.TotalAreaHa,   // 4.62m
					RubberAreaHa = rubberFarmRequest.RubberAreaHa, // 6.93m
					TotalExploit = rubberFarmRequest.TotalExploit, // 6.93m
					IsActive = rubberFarmRequest.IsActive,
					UpdatePerson = _userManage.Name,
					RegisterPerson = _userManage.Name,
					FarmId = rubberFarmRequest.FarmId
				});
				return lstResult;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in AddOrUpdateRubberFarm method.");
				return 0;
			}
		}
	}
}
