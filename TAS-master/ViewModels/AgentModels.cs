using TAS.Helpers;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class AgentModels
	{
		private readonly ICurrentUser _userManage;
		private readonly ILogger<AgentModels> _logger;
		ConnectDbHelper dbHelper = new ConnectDbHelper();
		public AgentModels(ICurrentUser userManage, ILogger<AgentModels> logger)
		{
			_userManage = userManage;
			_logger = logger;
		}
		// Model
		public async Task<List<RubberAgent>> GetRubberAgentAsync()
		{
			var sql = @"
				SELECT 
					rowNo = ROW_NUMBER() OVER(ORDER BY AgentId ASC),
					AgentCode,
					AgentName,
					OwnerName,
					AgentAddress,
					TaxCode,
					IsActive,
					UpdatePerson = ISNULL(UpdatePerson, RegisterPerson),
					UpdateDate = CONVERT(VARCHAR,ISNULL(UpdateDate, RegisterDate),111) + ' ' + CONVERT(VARCHAR(5),ISNULL(UpdateDate, RegisterDate), 108)
				FROM RubberAgent
				";
			return await dbHelper.QueryAsync<RubberAgent>(sql);
		}
		public int AddOrUpdateRubberAgent(RubberAgent rubberAgent)
		{
			try
			{
				if (rubberAgent == null)
				{
					throw new ArgumentNullException(nameof(rubberAgent), "Input data cannot be null.");
				}
				var sql = @"
					IF EXISTS (SELECT TOP 1 AgentId FROM RubberAgent WHERE AgentId = @AgentId)
					BEGIN
						UPDATE RubberAgent SET
						AgentCode       = @AgentCode,
						AgentName		= @AgentName,
						OwnerName		= @OwnerName,
						AgentAddress		= @AgentAddress,
						TaxCode			= @TaxCode,
						IsActive        = @IsActive,
						UpdateDate      = GETDATE(),
						UpdatePerson    = @UpdatePerson
						WHERE AgentId = @AgentId
						SELECT 0;
					END
					ELSE
					BEGIN
						INSERT INTO RubberAgent
						(AgentCode, AgentName, OwnerName, AgentAddress, TaxCode,
							IsActive, RegisterDate, RegisterPerson)
						VALUES
						(@AgentCode, @AgentName, @OwnerName, @AgentAddress, @TaxCode,
							@IsActive, GETDATE(), @UpdatePerson)
						SELECT SCOPE_IDENTITY() AS NewAgentId;
					END";
				// With this line:
				var lstResult = dbHelper.Execute(sql, new
				{
					AgentCode = rubberAgent.AgentCode,
					AgentName = rubberAgent.AgentName,
					OwnerName = rubberAgent.OwnerName,
					AgentAddress = rubberAgent.AgentAddress,
					TaxCode = rubberAgent.TaxCode,
					IsActive = rubberAgent.IsActive,
					UpdatePerson = _userManage.Name,
					AgentId = rubberAgent.AgentId
				});
				return lstResult;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in AddOrUpdateRubberAgent method.");
				return 0;
			}
		}

		public int DeleteRubberAgent(int agentId)
		{
			try
			{
				string sql = @"
						DELETE FROM RubberAgent WHERE AgentId = " + agentId + @"
					";
				dbHelper.Execute(sql);
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in DeleteRubberAgent method.");
				return 0;
			}
		}

		public int ApproveDataRubberAgent(int agentId, int status)
		{
			try
			{
				string sql = @"
						UPDATE RubberAgent SET IsActive = " + status + @" WHERE AgentId = " + agentId + @"
					";
				dbHelper.Execute(sql);
				return 1;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ApproveDataRubberAgent method.");
				return 0;
			}
		}
	}
}
