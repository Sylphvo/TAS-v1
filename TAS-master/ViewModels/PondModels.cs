using ClosedXML.Excel;
using Dapper;
using System.Data;
using TAS.DTOs;
using TAS.Repository;
using TAS.TagHelpers;

namespace TAS.ViewModels
{
	public class PondModels
	{
		private readonly ConnectDbHelper _dbHelper;
		private readonly ILogger<PondModels> _logger;

		public PondModels(ConnectDbHelper dbHelper, ILogger<PondModels> logger)
		{
			_dbHelper = dbHelper;
			_logger = logger;
		}

		// ========================================
		// GET ALL PONDS
		// ========================================
		public async Task<List<RubberPondResponse>> GetAllPondsAsync()
		{
			try
			{
				var sql = @"
                    SELECT 
						rowNo = ROW_NUMBER() OVER(ORDER BY p.RegisterDate DESC, p.PondId DESC),
                        p.PondId,
                        p.PondCode,
                        p.AgentCode,
                        a.AgentName,
                        p.PondName,
                        p.CapacityKg,
                        p.DailyCapacityKg,
                        p.CurrentNetKg,
                        p.Status,
                        p.RegisterDate,
                        p.RegisterPerson,
                        p.UpdateDate,
                        p.UpdatePerson,
                        -- Calculate utilization percentage
                        CASE 
                            WHEN p.CapacityKg > 0 THEN (p.CurrentNetKg / p.CapacityKg * 100)
                            ELSE 0
                        END AS UtilizationPercent
                    FROM RubberPond p
                    INNER JOIN RubberAgent a ON a.AgentCode = p.AgentCode
                    ORDER BY p.PondCode DESC
                ";

				var ponds = await _dbHelper.QueryAsync<RubberPondResponse>(sql);
				return ponds.ToList();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAllPondsAsync");
				throw;
			}
		}

		// ========================================
		// GET POND BY ID
		// ========================================
		public async Task<RubberPondDto?> GetPondByIdAsync(long pondId)
		{
			try
			{
				var sql = @"
                    SELECT 
                        p.PondId,
                        p.PondCode,
                        p.AgentCode,
                        a.AgentName,
                        p.PondName,
                        p.CapacityKg,
                        p.DailyCapacityKg,
                        p.CurrentNetKg,
                        p.Status,
                        p.RegisterDate,
                        p.RegisterPerson,
                        p.UpdateDate,
                        p.UpdatePerson,
                        CASE 
                            WHEN p.CapacityKg > 0 THEN (p.CurrentNetKg / p.CapacityKg * 100)
                            ELSE 0
                        END AS UtilizationPercent
                    FROM RubberPond p
                    INNER JOIN RubberAgent a ON a.AgentCode = p.AgentCode
                    WHERE p.PondId = @PondId
                ";

				return await _dbHelper.QueryFirstOrDefaultAsync<RubberPondDto>(sql, new { PondId = pondId });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetPondByIdAsync");
				throw;
			}
		}

		// ========================================
		// CREATE POND
		// ========================================
		public async Task<RubberPondResult> CreatePondAsync(RubberPondRequest request, string createdBy)
		{
			try
			{
				// Generate PondCode
				var pondCode = await GeneratePondCodeAsync();

				var sql = @"
                    INSERT INTO RubberPond 
                    (
                        PondCode, AgentCode, PondName, 
                        CapacityKg, DailyCapacityKg, CurrentNetKg,
                        Status, RegisterDate, RegisterPerson
                    )
                    VALUES 
                    (
                        @PondCode, @AgentCode, @PondName,
                        @CapacityKg, @DailyCapacityKg, @CurrentNetKg,
                        @Status, GETDATE(), @RegisterPerson
                    );
                    SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
                ";

				var pondId = await _dbHelper.QueryFirstOrDefaultAsync<long>(sql, new
				{
					PondCode = pondCode,
					request.AgentCode,
					request.PondName,
					CapacityKg = request.CapacityKg ?? 50000.00m,
					DailyCapacityKg = request.DailyCapacityKg ?? 5000.00m,
					CurrentNetKg = request.CurrentNetKg ?? 0.00m,
					Status = (byte)1, // 1 = Sẵn sàng
					RegisterPerson = createdBy
				});

				return new RubberPondResult
				{
					Success = true,
					Message = "Tạo hồ thành công",
					PondId = pondId
				};
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in CreatePondAsync");
				return new RubberPondResult
				{
					Success = false,
					Message = "Lỗi khi tạo hồ: " + ex.Message
				};
			}
		}

		// ========================================
		// UPDATE POND
		// ========================================
		public async Task<RubberPondResult> UpdatePondAsync(RubberPondRequest request, string updatedBy)
		{
			try
			{
				var sql = @"
                    UPDATE RubberPond
                    SET 
                        AgentCode = @AgentCode,
                        PondName = @PondName,
                        CapacityKg = @CapacityKg,
                        DailyCapacityKg = @DailyCapacityKg,
                        CurrentNetKg = @CurrentNetKg,
                        UpdateDate = GETDATE(),
                        UpdatePerson = @UpdatePerson
                    WHERE PondId = @PondId
                ";

				var affected = await _dbHelper.ExecuteAsync(sql, new
				{
					request.PondId,
					request.AgentCode,
					request.PondName,
					CapacityKg = request.CapacityKg ?? 50000.00m,
					DailyCapacityKg = request.DailyCapacityKg ?? 5000.00m,
					CurrentNetKg = request.CurrentNetKg ?? 0.00m,
					UpdatePerson = updatedBy
				});

				if (affected > 0)
				{
					return new RubberPondResult { Success = true, Message = "Cập nhật thành công" };
				}

				return new RubberPondResult { Success = false, Message = "Không tìm thấy hồ" };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in UpdatePondAsync");
				return new RubberPondResult
				{
					Success = false,
					Message = "Lỗi khi cập nhật: " + ex.Message
				};
			}
		}

		// ========================================
		// DELETE POND (Physical Delete)
		// ========================================
		public async Task<RubberPondResult> DeletePondAsync(long pondId, string deletedBy)
		{
			try
			{
				// Check if pond has PondIntakes
				var checkIntakeSql = "SELECT COUNT(*) FROM RubberPondIntake WHERE PondId = @PondId";
				var intakeCount = await _dbHelper.QueryFirstOrDefaultAsync<int>(checkIntakeSql, new { PondId = pondId });

				if (intakeCount > 0)
				{
					return new RubberPondResult
					{
						Success = false,
						Message = $"Không thể xóa. Hồ có {intakeCount} intake liên quan."
					};
				}

				// Check if pond has OrderPonds
				var checkOrderSql = "SELECT COUNT(*) FROM RubberOrderPond WHERE PondId = @PondId";
				var orderCount = await _dbHelper.QueryFirstOrDefaultAsync<int>(checkOrderSql, new { PondId = pondId });

				if (orderCount > 0)
				{
					return new RubberPondResult
					{
						Success = false,
						Message = $"Không thể xóa. Hồ có {orderCount} order phân bổ liên quan."
					};
				}

				// Check if pond has Pallets
				var checkPalletSql = "SELECT COUNT(*) FROM RubberPallet WHERE PondId = @PondId";
				var palletCount = await _dbHelper.QueryFirstOrDefaultAsync<int>(checkPalletSql, new { PondId = pondId });

				if (palletCount > 0)
				{
					return new RubberPondResult
					{
						Success = false,
						Message = $"Không thể xóa. Hồ có {palletCount} pallet liên quan."
					};
				}

				// Physical delete
				var sql = "DELETE FROM RubberPond WHERE PondId = @PondId";
				var affected = await _dbHelper.ExecuteAsync(sql, new { PondId = pondId });

				if (affected > 0)
				{
					return new RubberPondResult { Success = true, Message = "Xóa thành công" };
				}

				return new RubberPondResult { Success = false, Message = "Không tìm thấy hồ" };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in DeletePondAsync");
				return new RubberPondResult
				{
					Success = false,
					Message = "Lỗi khi xóa: " + ex.Message
				};
			}
		}

		// ========================================
		// UPDATE POND STATUS
		// ========================================
		public async Task<RubberPondResult> UpdatePondStatusAsync(long pondId, int status, string updatedBy)
		{
			try
			{
				var sql = @"
                    UPDATE RubberPond
                    SET 
                        Status = @Status,
                        UpdateDate = GETDATE(),
                        UpdatePerson = @UpdatePerson
                    WHERE PondId = @PondId
                ";

				var affected = await _dbHelper.ExecuteAsync(sql, new
				{
					PondId = pondId,
					Status = status,
					UpdatePerson = updatedBy
				});

				if (affected > 0)
				{
					return new RubberPondResult { Success = true, Message = "Cập nhật trạng thái thành công" };
				}

				return new RubberPondResult { Success = false, Message = "Không tìm thấy hồ" };
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in UpdatePondStatusAsync");
				return new RubberPondResult
				{
					Success = false,
					Message = "Lỗi khi cập nhật trạng thái: " + ex.Message
				};
			}
		}

		// ========================================
		// GET AGENTS
		// ========================================
		public async Task<List<CreateRubberAgentDto>> GetAgentsAsync()
		{
			try
			{
				var sql = @"
                    SELECT 
                        AgentId,
                        AgentCode,
                        AgentName
                    FROM RubberAgent
                    WHERE IsActive = 1
                    ORDER BY AgentName
                ";

				var agents = await _dbHelper.QueryAsync<CreateRubberAgentDto>(sql);
				return agents.ToList();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in GetAgentsAsync");
				throw;
			}
		}

		// ========================================
		// GENERATE POND CODE
		// ========================================
		private async Task<string> GeneratePondCodeAsync()
		{
			try
			{
				var sql = @"
                    SELECT TOP 1 PondCode 
                    FROM RubberPond 
                    WHERE PondCode LIKE 'POND' + FORMAT(GETDATE(), 'yyyyMM') + '%'
                    ORDER BY PondCode DESC
                ";

				var lastCode = await _dbHelper.QueryFirstOrDefaultAsync<string>(sql);

				if (string.IsNullOrEmpty(lastCode))
				{
					return $"POND{DateTime.Now:yyyyMM}0001";
				}

				// Extract number from last code
				var numberPart = lastCode.Substring(10); // PONDyyyyMM0001 -> 0001
				if (int.TryParse(numberPart, out var number))
				{
					return $"POND{DateTime.Now:yyyyMM}{(number + 1):D4}";
				}

				return $"POND{DateTime.Now:yyyyMM}0001";
			}
			catch
			{
				return $"POND{DateTime.Now:yyyyMM}0001";
			}
		}

		// ========================================
		// EXPORT TO EXCEL
		// ========================================
		public async Task<byte[]> ExportToExcelAsync(List<long> pondIds, string exportedBy)
		{
			try
			{
				List<RubberPondResponse> ponds;

				if (pondIds != null && pondIds.Any())
				{
					// Export selected ponds
					var sql = @"
                        SELECT 
                            p.PondCode,
                            a.AgentName,
                            p.PondName,
                            p.CapacityKg,
                            p.DailyCapacityKg,
                            p.CurrentNetKg,
                            p.Status,
                            CASE 
                                WHEN p.CapacityKg > 0 THEN (p.CurrentNetKg / p.CapacityKg * 100)
                                ELSE 0
                            END AS UtilizationPercent
                        FROM RubberPond p
                        INNER JOIN RubberAgent a ON a.AgentCode = p.AgentCode
                        WHERE p.PondId IN @PondIds
                        ORDER BY p.PondCode
                    ";

					ponds = (await _dbHelper.QueryAsync<RubberPondResponse>(sql, new { PondIds = pondIds })).ToList();
				}
				else
				{
					// Export all ponds
					ponds = await GetAllPondsAsync();
				}

				using var workbook = new XLWorkbook();
				var worksheet = workbook.Worksheets.Add("Ponds");

				// Header
				worksheet.Cell(1, 1).Value = "Mã hồ";
				worksheet.Cell(1, 2).Value = "Đại lý";
				worksheet.Cell(1, 3).Value = "Tên hồ";
				worksheet.Cell(1, 4).Value = "Dung tích (kg)";
				worksheet.Cell(1, 5).Value = "Công suất/ngày (kg)";
				worksheet.Cell(1, 6).Value = "Khối lượng hiện tại (kg)";
				worksheet.Cell(1, 7).Value = "Trạng thái";
				worksheet.Cell(1, 8).Value = "Tỷ lệ sử dụng (%)";

				// Style header
				var headerRange = worksheet.Range(1, 1, 1, 8);
				headerRange.Style.Font.Bold = true;
				headerRange.Style.Fill.BackgroundColor = XLColor.LightBlue;
				headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

				// Data
				int row = 2;
				foreach (var pond in ponds)
				{
					worksheet.Cell(row, 1).Value = pond.PondCode;
					worksheet.Cell(row, 2).Value = pond.AgentName;
					worksheet.Cell(row, 3).Value = pond.PondName;
					worksheet.Cell(row, 4).Value = pond.CapacityKg;
					worksheet.Cell(row, 5).Value = pond.DailyCapacityKg;
					worksheet.Cell(row, 6).Value = pond.CurrentNetKg;
					worksheet.Cell(row, 7).Value = GetStatusText(pond.Status);
					worksheet.Cell(row, 8).Value = pond.UtilizationPercent;

					// Format numbers
					worksheet.Cell(row, 4).Style.NumberFormat.Format = "#,##0.00";
					worksheet.Cell(row, 5).Style.NumberFormat.Format = "#,##0.00";
					worksheet.Cell(row, 6).Style.NumberFormat.Format = "#,##0.00";
					worksheet.Cell(row, 8).Style.NumberFormat.Format = "#,##0.00";

					row++;
				}

				// Auto-fit columns
				worksheet.Columns().AdjustToContents();

				using var stream = new MemoryStream();
				workbook.SaveAs(stream);
				return stream.ToArray();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ExportToExcelAsync");
				throw;
			}
		}

		// ========================================
		// HELPER: Get Status Text
		// ========================================
		private string GetStatusText(int status)
		{
			return status switch
			{
				1 => "Sẵn sàng",
				2 => "Đang sản xuất",
				3 => "Bảo trì",
				_ => "Không xác định"
			};
		}
	}

	
}