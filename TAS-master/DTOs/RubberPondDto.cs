using System;
using System.Collections.Generic;

namespace TAS.Models.DTOs
{
	// ========================================
	// POND DTOs
	// ========================================
	public class RubberPondDto
	{
		public long PondId { get; set; }
		public string PondCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string PondName { get; set; } = string.Empty;
		public decimal CapacityKg { get; set; }
		public decimal DailyCapacityKg { get; set; }
		public decimal CurrentNetKg { get; set; }
		public decimal RemainingCapacityKg => CapacityKg - CurrentNetKg;
		public decimal UsagePercent => CapacityKg > 0
			? Math.Round((CurrentNetKg / CapacityKg) * 100, 2)
			: 0;
		public byte Status { get; set; }
		public string StatusText => Status switch
		{
			1 => "Sẵn sàng",
			2 => "Đang sản xuất",
			3 => "Bảo trì",
			_ => "Không xác định"
		};

		// Navigation
		public RubberAgentDto? Agent { get; set; }
	}

	public class CreateRubberPondDto
	{
		public string PondCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string PondName { get; set; } = string.Empty;
		public decimal CapacityKg { get; set; } = 50000.00m;
		public decimal DailyCapacityKg { get; set; } = 5000.00m;
	}
}