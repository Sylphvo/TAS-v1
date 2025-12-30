using System;
using System.Collections.Generic;

namespace TAS.DTOs
{
	// ========================================
	// TRACEABILITY DTOs (Truy xuất nguồn gốc)
	// ========================================
	public class PalletTraceabilityDto
	{
		public string PalletCode { get; set; } = string.Empty;
		public decimal PalletWeightKg { get; set; }

		// Cấp 1: Đơn hàng
		public string OrderCode { get; set; } = string.Empty;
		public string? BuyerCompany { get; set; }

		// Cấp 2: Hồ
		public string PondCode { get; set; } = string.Empty;
		public string PondName { get; set; } = string.Empty;

		// Cấp 3: Đại lý
		public string AgentCode { get; set; } = string.Empty;
		public string AgentName { get; set; } = string.Empty;

		// Cấp 4: Nhà vườn
		public List<FarmIntakeDto> Sources { get; set; } = new();
	}

	public class FarmIntakeDto
	{
		public string FarmCode { get; set; } = string.Empty;
		public string FarmerName { get; set; } = string.Empty;
		public decimal PouredKg { get; set; }
		public DateTime IntakeDate { get; set; }
		public decimal? TSCPercent { get; set; }
	}

	public class OrderTraceabilityDto
	{
		public string OrderCode { get; set; } = string.Empty;
		public string? BuyerCompany { get; set; }
		public decimal TotalNetKg { get; set; }
		public int TotalPallets { get; set; }

		public List<OrderPondDetailDto> PondDetails { get; set; } = new();
	}

	public class OrderPondDetailDto
	{
		public string PondCode { get; set; } = string.Empty;
		public string PondName { get; set; } = string.Empty;
		public decimal AllocatedKg { get; set; }

		public List<PondSourceDto> Sources { get; set; } = new();
	}

	public class PondSourceDto
	{
		public string AgentCode { get; set; } = string.Empty;
		public string AgentName { get; set; } = string.Empty;
		public string FarmCode { get; set; } = string.Empty;
		public string FarmerName { get; set; } = string.Empty;
		public decimal TotalKg { get; set; }
		public DateTime EarliestIntakeDate { get; set; }
		public DateTime LatestIntakeDate { get; set; }
	}
	public class TraceabilityRowDto
	{
		public int OrderId { get; set; }
		public int? ParentId { get; set; }
		public int SortOrder { get; set; }
		public string? OrderCode { get; set; }
		public string? OrderName { get; set; }
		public string? AgentCode { get; set; }
		public string? AgentName { get; set; }
		public string? FarmCode { get; set; }
		public string? FarmerName { get; set; }
		public DateTime? DatePurchase { get; set; }
		public decimal? TotalFinishedProductKg { get; set; }
		public decimal? TotalCentrifugeProductKg { get; set; }
		public string SortList { get; set; } = string.Empty;
		public bool IsOpenChild { get; set; }
	}
}