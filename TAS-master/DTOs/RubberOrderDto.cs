using System;
using System.Collections.Generic;

namespace TAS.DTOs
{
	// ========================================
	// DTOs
	// ========================================
	public class RubberOrderDto
	{
		public long OrderId { get; set; }
		public string OrderCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string AgentName { get; set; } = string.Empty;
		public string? BuyerName { get; set; }
		public string? BuyerCompany { get; set; }
		public DateTime? OrderDate { get; set; }
		public DateTime? ExpectedShipDate { get; set; }
		public DateTime? ShippedAt { get; set; }
		public string? ProductType { get; set; }
		public decimal TotalNetKg { get; set; }
		public byte Status { get; set; }
		public string? Note { get; set; }
		public DateTime RegisterDate { get; set; }
		public string RegisterPerson { get; set; } = string.Empty;
		public DateTime? UpdateDate { get; set; }
		public string? UpdatePerson { get; set; }
	}

	public class RubberOrderRequest
	{
		public long OrderId { get; set; }
		public string AgentCode { get; set; } = string.Empty;
		public string? BuyerName { get; set; }
		public string? BuyerCompany { get; set; }
		public DateTime? OrderDate { get; set; }
		public DateTime? ExpectedShipDate { get; set; }
		public string? ProductType { get; set; }
		public decimal? TotalNetKg { get; set; }
		public string? Note { get; set; }
	}

	public class RubberOrderResult
	{
		public bool Success { get; set; }
		public string Message { get; set; } = string.Empty;
		public long OrderId { get; set; }
	}


	public class PondDto
	{
		public Guid PondId { get; set; }
		public string PondCode { get; set; } = string.Empty;
		public string PondName { get; set; } = string.Empty;
		public decimal CurrentNetKg { get; set; }
	}
	public class RubberOrderResponse
	{
		public long rowNo { get; set; }
		public long OrderId { get; set; }
		public string OrderCode { get; set; } = string.Empty;
		public string AgentCode { get; set; } = string.Empty;
		public string AgentName { get; set; } = string.Empty;
		public string? BuyerName { get; set; }
		public string? BuyerCompany { get; set; }
		public DateTime? OrderDate { get; set; }
		public DateTime? ExpectedShipDate { get; set; }
		public DateTime? ShippedAt { get; set; }
		public string? ProductType { get; set; }
		public decimal TotalNetKg { get; set; }
		public byte Status { get; set; }
		public string? Note { get; set; }
		public DateTime RegisterDate { get; set; }
		public string RegisterPerson { get; set; } = string.Empty;
		public DateTime? UpdateDate { get; set; }
		public string? UpdatePerson { get; set; }
	}
}