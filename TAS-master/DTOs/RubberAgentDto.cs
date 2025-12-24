using System;
using System.Collections.Generic;

namespace TAS.Models.DTOs
{
	// ========================================
	// AGENT DTOs
	// ========================================
	public class RubberAgentDto
	{
		public long AgentId { get; set; }
		public string AgentCode { get; set; } = string.Empty;
		public string AgentName { get; set; } = string.Empty;
		public string? OwnerName { get; set; }
		public string? AgentPhone { get; set; }
		public string? AgentAddress { get; set; }
		public bool IsActive { get; set; }
	}

	public class CreateRubberAgentDto
	{
		public string AgentCode { get; set; } = string.Empty;
		public string AgentName { get; set; } = string.Empty;
		public string? OwnerName { get; set; }
		public string? AgentPhone { get; set; }
		public string? AgentAddress { get; set; }
	}

}