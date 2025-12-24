using TAS.Models;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
    public class PondModels
    {
        private readonly ICurrentUser _userManage;
        private readonly ILogger<PondModels> _logger;
        ConnectDbHelper dbHelper = new ConnectDbHelper();

        public PondModels(ICurrentUser userManage, ILogger<PondModels> logger)
        {
            _userManage = userManage;
            _logger = logger;
        }

        #region Get Data

        // Lấy tất cả hồ/bồn
        public async Task<List<RubberPondDb>> GetRubberPondAsync()
        {
            var sql = @"
			SELECT 
				rowNo = ROW_NUMBER() OVER(ORDER BY PondId DESC),
				PondId,
				PondCode,
				AgentCode,
				PondName,
				Location,
				CapacityKg,
				CurrentNetKg,
				Status,
				LastCleanedAt = CONVERT(VARCHAR, LastCleanedAt, 111),
				Note,
				RegisterPerson,
				RegisterDate = CONVERT(VARCHAR, RegisterDate, 111) + ' ' + CONVERT(VARCHAR(5), RegisterDate, 108),
				UpdatePerson = ISNULL(UpdatePerson, RegisterPerson),
				UpdateDate = CONVERT(VARCHAR, ISNULL(UpdateDate, RegisterDate), 111) + ' ' + CONVERT(VARCHAR(5), ISNULL(UpdateDate, RegisterDate), 108)
			FROM RubberPond
			ORDER BY PondId DESC
			";
            return await dbHelper.QueryAsync<RubberPondDb>(sql);
        }

        // Lấy hồ/bồn theo ID
        public async Task<RubberPondDb> GetRubberPondByIdAsync(long pondId)
        {
            var sql = @"
			SELECT 
				PondId,
				PondCode,
				AgentCode,
				PondName,
				Location,
				CapacityKg,
				CurrentNetKg,
				Status,
				LastCleanedAt,
				Note,
				RegisterPerson,
				RegisterDate,
				UpdatePerson,
				UpdateDate
			FROM RubberPond
			WHERE PondId = @PondId
			";
            var result = await dbHelper.QueryAsync<RubberPondDb>(sql, new { PondId = pondId });
            return result.FirstOrDefault()!;
        }

        // Lấy hồ/bồn theo mã đại lý
        public async Task<List<RubberPondDb>> GetRubberPondsByAgentAsync(string agentCode)
        {
            var sql = @"
			SELECT 
				rowNo = ROW_NUMBER() OVER(ORDER BY PondId DESC),
				PondId,
				PondCode,
				AgentCode,
				PondName,
				Location,
				CapacityKg,
				CurrentNetKg,
				Status,
				LastCleanedAt = CONVERT(VARCHAR, LastCleanedAt, 111),
				Note,
				UpdatePerson = ISNULL(UpdatePerson, RegisterPerson),
				UpdateDate = CONVERT(VARCHAR, ISNULL(UpdateDate, RegisterDate), 111) + ' ' + CONVERT(VARCHAR(5), ISNULL(UpdateDate, RegisterDate), 108)
			FROM RubberPond
			WHERE AgentCode = @AgentCode
			ORDER BY PondId DESC
			";
            return await dbHelper.QueryAsync<RubberPondDb>(sql, new { AgentCode = agentCode });
        }

        // Lấy hồ/bồn theo trạng thái
        public async Task<List<RubberPondDb>> GetRubberPondsByStatusAsync(int status)
        {
            var sql = @"
			SELECT 
				rowNo = ROW_NUMBER() OVER(ORDER BY PondId DESC),
				PondId,
				PondCode,
				AgentCode,
				PondName,
				Location,
				CapacityKg,
				CurrentNetKg,
				Status,
				LastCleanedAt = CONVERT(VARCHAR, LastCleanedAt, 111),
				Note,
				UpdatePerson = ISNULL(UpdatePerson, RegisterPerson),
				UpdateDate = CONVERT(VARCHAR, ISNULL(UpdateDate, RegisterDate), 111) + ' ' + CONVERT(VARCHAR(5), ISNULL(UpdateDate, RegisterDate), 108)
			FROM RubberPond
			WHERE Status = @Status
			ORDER BY PondId DESC
			";
            return await dbHelper.QueryAsync<RubberPondDb>(sql, new { Status = status });
        }

        // Lấy các hồ/bồn đang hoạt động
        public async Task<List<RubberPondDb>> GetActivePondsAsync()
        {
            var sql = @"
			SELECT 
				rowNo = ROW_NUMBER() OVER(ORDER BY PondId DESC),
				PondId,
				PondCode,
				AgentCode,
				PondName,
				Location,
				CapacityKg,
				CurrentNetKg,
				Status,
				LastCleanedAt = CONVERT(VARCHAR, LastCleanedAt, 111),
				Note,
				UpdatePerson = ISNULL(UpdatePerson, RegisterPerson),
				UpdateDate = CONVERT(VARCHAR, ISNULL(UpdateDate, RegisterDate), 111) + ' ' + CONVERT(VARCHAR(5), ISNULL(UpdateDate, RegisterDate), 108)
			FROM RubberPond
			WHERE Status = 1
			ORDER BY PondId DESC
			";
            return await dbHelper.QueryAsync<RubberPondDb>(sql);
        }

        #endregion

        #region Add/Update Data

        // Thêm hoặc cập nhật hồ/bồn
        public int AddOrUpdateRubberPond(RubberPondDb rubberPond)
        {
            try
            {
                if (rubberPond == null)
                {
                    throw new ArgumentNullException(nameof(rubberPond), "Input data cannot be null.");
                }

                var sql = @"
				IF EXISTS (SELECT TOP 1 PondId FROM RubberPond WHERE PondId = @PondId)
				BEGIN
					UPDATE RubberPond SET
						PondCode = @PondCode,
						AgentCode = @AgentCode,
						PondName = @PondName,
						Location = @Location,
						CapacityKg = @CapacityKg,
						CurrentNetKg = @CurrentNetKg,
						Status = @Status,
						LastCleanedAt = @LastCleanedAt,
						Note = @Note,
						UpdateDate = GETDATE(),
						UpdatePerson = @UpdatePerson
					WHERE PondId = @PondId
					SELECT 0;
				END
				ELSE
				BEGIN
					INSERT INTO RubberPond
					(PondCode, AgentCode, PondName, Location, CapacityKg, CurrentNetKg,
						Status, LastCleanedAt, Note, RegisterDate, RegisterPerson)
					VALUES
					(@PondCode, @AgentCode, @PondName, @Location, @CapacityKg, @CurrentNetKg,
						@Status, @LastCleanedAt, @Note, GETDATE(), @UpdatePerson)
					SELECT SCOPE_IDENTITY() AS NewPondId;
				END";

                var lstResult = dbHelper.Execute(sql, new
                {
                    PondId = rubberPond.PondId,
                    PondCode = rubberPond.PondCode,
                    AgentCode = rubberPond.AgentCode,
                    PondName = rubberPond.PondName,
                    Location = rubberPond.Location,
                    CapacityKg = rubberPond.CapacityKg,
                    CurrentNetKg = rubberPond.CurrentNetKg,
                    Status = rubberPond.Status,
                    LastCleanedAt = rubberPond.LastCleanedAt,
                    Note = rubberPond.Note,
                    UpdatePerson = _userManage.Name
                });
                return lstResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddOrUpdateRubberPond method.");
                return 0;
            }
        }

        // Thêm hoặc cập nhật nhiều hồ/bồn
        public int AddOrUpdateRubberPondFull(List<RubberPondDb> rubberPonds)
        {
            try
            {
                if (rubberPonds == null || !rubberPonds.Any())
                {
                    throw new ArgumentNullException(nameof(rubberPonds), "Input data cannot be null or empty.");
                }

                int successCount = 0;
                foreach (var pond in rubberPonds)
                {
                    var result = AddOrUpdateRubberPond(pond);
                    if (result > 0)
                        successCount++;
                }
                return successCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddOrUpdateRubberPondFull method.");
                return 0;
            }
        }

        // Import danh sách hồ/bồn
        public int ImportRubberPonds(List<RubberPondDb> rubberPonds)
        {
            try
            {
                if (rubberPonds == null || !rubberPonds.Any())
                {
                    throw new ArgumentNullException(nameof(rubberPonds), "Import data cannot be null or empty.");
                }

                int successCount = 0;
                foreach (var pond in rubberPonds)
                {
                    var result = AddOrUpdateRubberPond(pond);
                    if (result > 0)
                        successCount++;
                }
                return successCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ImportRubberPonds method.");
                return 0;
            }
        }

        #endregion

        #region Delete Data

        // Xóa hồ/bồn
        public int DeleteRubberPond(long pondId)
        {
            try
            {
                string sql = @"
					DELETE FROM RubberPond WHERE PondId = @PondId
				";
                dbHelper.Execute(sql, new { PondId = pondId });
                return 1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteRubberPond method.");
                return 0;
            }
        }

        #endregion

        #region Approve/Update Status

        // Phê duyệt hồ/bồn
        public int ApproveRubberPond(long pondId, int status)
        {
            try
            {
                string sql = @"
					UPDATE RubberPond 
					SET 
						Status = @Status,
						UpdateDate = GETDATE(),
						UpdatePerson = @UpdatePerson
					WHERE PondId = @PondId
				";
                dbHelper.Execute(sql, new
                {
                    PondId = pondId,
                    Status = status,
                    UpdatePerson = _userManage.Name
                });
                return 1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ApproveRubberPond method.");
                return 0;
            }
        }

        // Phê duyệt tất cả hồ/bồn
        public int ApproveAllRubberPonds(int status)
        {
            try
            {
                string sql = @"
					UPDATE RubberPond 
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
                _logger.LogError(ex, "Error in ApproveAllRubberPonds method.");
                return 0;
            }
        }

        // Cập nhật trạng thái hồ/bồn
        public int UpdatePondStatus(long pondId, int status)
        {
            try
            {
                string sql = @"
					UPDATE RubberPond 
					SET 
						Status = @Status,
						UpdateDate = GETDATE(),
						UpdatePerson = @UpdatePerson
					WHERE PondId = @PondId
				";

                dbHelper.Execute(sql, new
                {
                    PondId = pondId,
                    Status = status,
                    UpdatePerson = _userManage.Name
                });
                return 1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdatePondStatus method.");
                return 0;
            }
        }

        #endregion

        #region Inventory Management

        // Cập nhật tồn kho hồ/bồn
        public int UpdatePondInventory(long pondId, decimal currentNetKg)
        {
            try
            {
                string sql = @"
					UPDATE RubberPond 
					SET 
						CurrentNetKg = @CurrentNetKg,
						UpdateDate = GETDATE(),
						UpdatePerson = @UpdatePerson
					WHERE PondId = @PondId
				";

                dbHelper.Execute(sql, new
                {
                    PondId = pondId,
                    CurrentNetKg = currentNetKg,
                    UpdatePerson = _userManage.Name
                });
                return 1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdatePondInventory method.");
                return 0;
            }
        }

        // Vệ sinh hồ/bồn
        public int CleanPond(long pondId)
        {
            try
            {
                string sql = @"
					UPDATE RubberPond 
					SET 
						Status = 3,
						LastCleanedAt = GETDATE(),
						UpdateDate = GETDATE(),
						UpdatePerson = @UpdatePerson
					WHERE PondId = @PondId
				";

                dbHelper.Execute(sql, new
                {
                    PondId = pondId,
                    UpdatePerson = _userManage.Name
                });
                return 1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CleanPond method.");
                return 0;
            }
        }

        #endregion

        #region Utility Methods

        // Tự động tạo mã hồ/bồn
        public async Task<string> GeneratePondCodeAsync()
        {
            try
            {
                var sql = @"
					SELECT TOP 1 PondCode 
					FROM RubberPond 
					WHERE PondCode LIKE 'POND%' 
					ORDER BY PondId DESC
				";
                var lastPondCode = await dbHelper.QueryFirstOrDefaultAsync<string>(sql);

                if (string.IsNullOrEmpty(lastPondCode))
                {
                    return "POND00001";
                }

                // Lấy số thứ tự từ mã cuối cùng
                var numberPart = lastPondCode.Substring(4);
                if (int.TryParse(numberPart, out int lastNumber))
                {
                    int newNumber = lastNumber + 1;
                    return $"POND{newNumber:D5}";
                }

                return "POND00001";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GeneratePondCodeAsync method.");
                return "POND00001";
            }
        }

        // Kiểm tra mã hồ/bồn đã tồn tại
        public async Task<bool> IsPondCodeExistsAsync(string pondCode)
        {
            try
            {
                var sql = @"
					SELECT COUNT(*) 
					FROM RubberPond 
					WHERE PondCode = @PondCode
				";
                var count = await dbHelper.QueryFirstOrDefaultAsync<int>(sql, new { PondCode = pondCode });
                return count > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in IsPondCodeExistsAsync method.");
                return false;
            }
        }

        // Kiểm tra sức chứa còn lại
        public async Task<decimal> GetRemainingCapacityAsync(long pondId)
        {
            try
            {
                var sql = @"
					SELECT (CapacityKg - ISNULL(CurrentNetKg, 0)) AS RemainingCapacity
					FROM RubberPond 
					WHERE PondId = @PondId
				";
                var remaining = await dbHelper.QueryFirstOrDefaultAsync<decimal>(sql, new { PondId = pondId });
                return remaining;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetRemainingCapacityAsync method.");
                return 0;
            }
        }

        #endregion
    }
}