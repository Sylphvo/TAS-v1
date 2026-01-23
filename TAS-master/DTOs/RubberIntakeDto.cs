using System;
using System.Collections.Generic;
using TAS.DTOs;

namespace TAS.DTOs
{
	

	// ========================================
	// INTAKE DTOs
	// ========================================
	public class RubberIntakeDto
	{
		public long intakeId { get; set; }
		public string? intakeCode { get; set; }
		public string? agentCode { get; set; }
		public string? agentName { get; set; }
		public string farmCode { get; set; } = string.Empty;
		public string farmerName { get; set; } = string.Empty;
		public decimal rubberKg { get; set; }
		public decimal? tscPercent { get; set; }
		public decimal? drcPercent { get; set; }
		public decimal? finishedProductKg { get; set; }
		public decimal? centrifugeProductKg { get; set; }
		public byte status { get; set; }
		public string statusText => status switch
		{
			1 => "Chưa xử lý",
			2 => "Đã vào hồ",
			3 => "Hoàn thành",
			_ => "Không xác định"
		};
		public DateTime registerDate { get; set; }

		// Navigation
		public RubberFarmDto? farm { get; set; }
	}

	public class CreateRubberIntakeDto
	{
		public string? agentCode { get; set; }
		public string? agentName { get; set; }
		public string farmCode { get; set; } = string.Empty;
		public string farmerName { get; set; } = string.Empty;
		public decimal rubberKg { get; set; }
		public decimal? tscPercent { get; set; }
		public decimal? drcPercent { get; set; }
		public decimal? finishedProductKg { get; set; }
		public decimal? centrifugeProductKg { get; set; }
	}

	// ========================================
	// REQUEST/RESPONSE MODELS
	// ========================================
	public class RubberIntakeRequest
	{
		public long intakeId { get; set; }
		public string? intakeCode { get; set; }
		public string? agentCode { get; set; }
		public string? agentName { get; set; }
		public string? farmCode { get; set; }
		public string? farmerName { get; set; }
		public decimal? rubberKg { get; set; }
		public decimal? tscPercent { get; set; }
		public decimal? drcPercent { get; set; }
		public decimal? finishedProductKg { get; set; }
		public decimal? centrifugeProductKg { get; set; }
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
		public decimal? drcPercent { get; set; }
		public decimal? finishedProductKg { get; set; }
		public decimal? centrifugeProductKg { get; set; }
		public int status { get; set; }
		public string? statusText { get; set; }
		public string? timeDate_Person { get; set; }
		public DateTime registerDate { get; set; }
		public string? timeDate { get; set; }
	}
}