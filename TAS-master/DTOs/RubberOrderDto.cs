using System;
using System.Collections.Generic;

namespace TAS.Models.DTOs
{
	// ========================================
	// ORDER DTOs
	// ========================================
	public class RubberOrderDto
	{
		public long OrderId { get; set; }
		public string OrderCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string? BuyerName { get; set; }
		public string? BuyerCompany { get; set; }
		public DateTime OrderDate { get; set; }
		public DateTime? ExpectedShipDate { get; set; }
		public DateTime? ShippedAt { get; set; }
		public string? ProductType { get; set; }
		public decimal TotalNetKg { get; set; }
		public byte Status { get; set; }
		public string StatusText => Status switch
		{
			1 => "Mới",
			2 => "Đang xử lý",
			3 => "Hoàn thành",
			4 => "Hủy",
			_ => "Không xác định"
		};
		public string? Note { get; set; }

		// Navigation
		public RubberAgentDto? Agent { get; set; }
		public List<RubberPalletDto>? Pallets { get; set; }
	}

	public class CreateRubberOrderDto
	{
		public string OrderCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string? BuyerCompany { get; set; }
		public string? ProductType { get; set; }
		public DateTime OrderDate { get; set; }
		public DateTime? ExpectedShipDate { get; set; }
	}
}