using System;
using System.Collections.Generic;

namespace TAS.Models.DTOs
{
	// ========================================
	// STATISTICS DTOs
	// ========================================
	public class PondStatisticsDto
	{
		public string PondCode { get; set; } = string.Empty;
		public string PondName { get; set; } = string.Empty;
		public decimal DailyCapacityKg { get; set; }
		public decimal CurrentNetKg { get; set; }
		public decimal UsagePercent { get; set; }
		public int IntakeCount { get; set; }
		public int PalletCount { get; set; }
	}

	public class AgentStatisticsDto
	{
		public string AgentCode { get; set; } = string.Empty;
		public string AgentName { get; set; } = string.Empty;
		public int TotalFarms { get; set; }
		public int TotalIntakes { get; set; }
		public decimal TotalRubberKg { get; set; }
		public decimal TotalFinishedKg { get; set; }
		public decimal AvgTSCPercent { get; set; }
	}
}