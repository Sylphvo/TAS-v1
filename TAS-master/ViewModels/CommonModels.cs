using TAS.Helpers;
using TAS.Models;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class CommonModels
	{
		ConnectDbHelper dbHelper;
		private readonly ILogger<CommonModels> _logger;
		public CommonModels(ILogger<CommonModels> logger)
		{
			dbHelper = new ConnectDbHelper();
			_logger = logger;
		}

		// Model
		public List<ComboBox> ComboAgent()
		{
			try
			{
				var sql = @"
					SELECT DISTINCT Value = AgentCode, Name = AgentName FROM RubberAgent WHERE AgentCode IS NOT NULL
				";
				return dbHelper.Query<ComboBox>(sql);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error fetching ComboAgent data.");
				return null!;
			}
		}
		public List<ComboBox> ComboFarmCode()
		{
			try
			{
				string sql = @"
					SELECT DISTINCT Value = FarmCode, Name = FarmerName FROM RubberFarm WHERE FarmCode IS NOT NULL
				";
				return dbHelper.Query<ComboBox>(sql);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error fetching ComboFarmCode data.");
				return null!;
			}
		}
		public List<ComboBox> ComboOrderCode()
		{
			try
			{
				string sql = @"
					SELECT DISTINCT Value = OrderCode, Name = OrderName FROM RubberOrderSummary WHERE OrderCode IS NOT NULL
				";
				return dbHelper.Query<ComboBox>(sql);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error fetching ComboOrderCode data.");
				return null!;
			}
		}
	}
}
