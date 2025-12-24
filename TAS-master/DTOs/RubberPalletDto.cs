using System;
using System.Collections.Generic;

namespace TAS.Models.DTOs
{
	// ========================================
	// PALLET DTOs
	// ========================================
	public class RubberPalletDto
	{
		public long PalletId { get; set; }
		public long OrderId { get; set; }
		public long? PondId { get; set; }
		public string PalletCode { get; set; } = string.Empty;
		public string? PalletName { get; set; }
		public int PalletNo { get; set; }
		public decimal WeightKg { get; set; }
		public decimal StandardWeightKg { get; set; }
		public bool IsStandard => WeightKg == StandardWeightKg;
		public bool IsActive { get; set; }
		public byte Status { get; set; }
		public string StatusText => Status switch
		{
			1 => "Trong kho",
			2 => "Đã xuất",
			3 => "Đã giao",
			_ => "Không xác định"
		};
	}

	public class CreateRubberPalletDto
	{
		public long OrderId { get; set; }
		public long? PondId { get; set; }
		public string PalletCode { get; set; } = string.Empty;
		public int PalletNo { get; set; }
		public decimal WeightKg { get; set; }
	}
}