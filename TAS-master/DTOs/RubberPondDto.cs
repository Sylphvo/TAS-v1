using System;
using System.Collections.Generic;

namespace TAS.DTOs
{
	// ========================================
	// DTOs
	// ========================================
	public class RubberPondDto
	{
		public long PondId { get; set; }
		public string PondCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string AgentName { get; set; } = string.Empty;
		public string PondName { get; set; } = string.Empty;
		public decimal CapacityKg { get; set; }
		public decimal DailyCapacityKg { get; set; }
		public decimal CurrentNetKg { get; set; }
		public int Status { get; set; }
		public DateTime RegisterDate { get; set; }
		public string RegisterPerson { get; set; } = string.Empty;
		public DateTime? UpdateDate { get; set; }
		public string? UpdatePerson { get; set; }
		public decimal UtilizationPercent { get; set; }
	}

	public class RubberPondRequest
	{
		public long PondId { get; set; }
		public string AgentCode { get; set; } = string.Empty;
		public string PondName { get; set; } = string.Empty;
		public decimal? CapacityKg { get; set; }
		public decimal? DailyCapacityKg { get; set; }
		public decimal? CurrentNetKg { get; set; }
	}

	public class RubberPondResult
	{
		public bool Success { get; set; }
		public string Message { get; set; } = string.Empty;
		public long PondId { get; set; }
	}
	public class UpdateRubberPondResult
	{
		public long PondId { get; set; }
		public int Status { get; set; }
	}
	public class RubberPondResponse
	{

		public int rowNo { get; set; }
		public long PondId { get; set; }
		public string PondCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string AgentName { get; set; } = string.Empty;
		public string PondName { get; set; } = string.Empty;
		public decimal CapacityKg { get; set; }
		public decimal DailyCapacityKg { get; set; }
		public decimal CurrentNetKg { get; set; }
		public int Status { get; set; }
		public DateTime RegisterDate { get; set; }
		public string RegisterPerson { get; set; } = string.Empty;
		public DateTime? UpdateDate { get; set; }
		public string? UpdatePerson { get; set; }
		public decimal UtilizationPercent { get; set; }
	}
}