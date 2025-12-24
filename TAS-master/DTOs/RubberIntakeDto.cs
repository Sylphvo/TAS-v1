using System;
using System.Collections.Generic;

namespace TAS.Models.DTOs
{
	

	// ========================================
	// INTAKE DTOs
	// ========================================
	public class RubberIntakeDto
	{
		public long IntakeId { get; set; }
		public string? IntakeCode { get; set; }
		public string FarmCode { get; set; } = string.Empty;
		public string FarmerName { get; set; } = string.Empty;
		public decimal RubberKg { get; set; }
		public decimal? TSCPercent { get; set; }
		public decimal FinishedProductKg { get; set; }
		public byte Status { get; set; }
		public string StatusText => Status switch
		{
			1 => "Chưa xử lý",
			2 => "Đã vào hồ",
			3 => "Hoàn thành",
			_ => "Không xác định"
		};
		public DateTime RegisterDate { get; set; }

		// Navigation
		public RubberFarmDto? Farm { get; set; }
	}

	public class CreateRubberIntakeDto
	{
		public string FarmCode { get; set; } = string.Empty;
		public string FarmerName { get; set; } = string.Empty;
		public decimal RubberKg { get; set; }
		public decimal? TSCPercent { get; set; }
		public decimal FinishedProductKg { get; set; }
	}

	
}