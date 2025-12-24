using System;
using System.Collections.Generic;

namespace TAS.Models.DTOs
{

	// ========================================
	// FARM DTOs
	// ========================================
	public class RubberFarmDto
	{
		public long FarmId { get; set; }
		public string FarmCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string FarmerName { get; set; } = string.Empty;
		public string? FarmPhone { get; set; }
		public string? FarmAddress { get; set; }
		public bool IsActive { get; set; }

		// Navigation
		public RubberAgentDto? Agent { get; set; }
	}

	public class CreateRubberFarmDto
	{
		public string FarmCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string FarmerName { get; set; } = string.Empty;
		public string? FarmPhone { get; set; }
		public string? FarmAddress { get; set; }
	}

}