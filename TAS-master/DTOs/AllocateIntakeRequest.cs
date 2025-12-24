using System;
using System.Collections.Generic;

namespace TAS.Models.DTOs
{
	// ========================================
	// ALLOCATION DTOs (Phân bổ)
	// ========================================
	public class AllocateIntakeRequest
	{
		public long PondId { get; set; }
		public long IntakeId { get; set; }
		public decimal AllocateKg { get; set; }
		public DateTime ProductionDate { get; set; }
	}

	public class AutoAllocateRequest
	{
		public DateTime ProductionDate { get; set; }
	}

	public class CreateOrderWithPalletsRequest
	{
		public string OrderCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string? BuyerCompany { get; set; }
		public string? ProductType { get; set; }
		public DateTime OrderDate { get; set; }
		public long PondId { get; set; }
		public decimal AllocatedKg { get; set; }
	}
}