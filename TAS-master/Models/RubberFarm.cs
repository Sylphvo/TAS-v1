using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TAS.Helpers;

namespace TAS.Models
{
	// ========================================
	// FARM DTO - Display/Response
	// ========================================
	public class RubberFarm
	{
		public long FarmId { get; set; }
		public string FarmCode { get; set; } = "";
		public string AgentCode { get; set; } = "";
		public string FarmerName { get; set; } = "";
		public string? FarmPhone { get; set; }
		public string? FarmAddress { get; set; }
		public bool IsActive { get; set; } = true;

		// Farm specific fields
		public string? Certificates { get; set; }
		public decimal? TotalAreaHa { get; set; }
		public decimal? RubberAreaHa { get; set; }
		public decimal? TotalExploit { get; set; }
		public string? Polygon { get; set; } // WKT format for geography

		// Navigation properties
		public string? AgentName { get; set; }
		public string? AgentAddress { get; set; }

		// Audit fields
		public DateTime RegisterDate { get; set; }
		public string? RegisterPerson { get; set; }
		public DateTime? UpdateDate { get; set; }
		public string? UpdatePerson { get; set; }
		// Navigation Properties
		[ForeignKey(nameof(AgentCode))]
		public virtual RubberAgent? Agent { get; set; }

		public virtual ICollection<RubberIntake> Intakes { get; set; } = new List<RubberIntake>();
	}

	// ========================================
	// FARM SEARCH DTO - Filter Parameters
	// ========================================
	public class FarmSearchDto
	{
		public string? SearchKeyword { get; set; }
		public string? FarmCode { get; set; }
		public string? FarmerName { get; set; }
		public string? AgentCode { get; set; }
		public string? Certificates { get; set; }
		public decimal? TotalAreaHa { get; set; }
		public decimal? RubberAreaHa { get; set; }
		public decimal? TotalExploit { get; set; }
		public bool? IsActive { get; set; }
		public DateTime? FromDate { get; set; }
		public DateTime? ToDate { get; set; }

		// Pagination
		public int PageNumber { get; set; } = 1;
		public int PageSize { get; set; } = 100;

		// Sorting
		public string SortColumn { get; set; } = "RegisterDate";
		public string SortOrder { get; set; } = "desc";
	}

	// ========================================
	// CREATE FARM DTO - For POST
	// ========================================
	public class CreateFarmDto
	{
		[Required(ErrorMessage = "Mã nhà vườn không được để trống")]
		[StringLength(50, ErrorMessage = "Mã nhà vườn không được vượt quá 50 ký tự")]
		public string FarmCode { get; set; } = "";

		[Required(ErrorMessage = "Mã đại lý không được để trống")]
		[StringLength(50, ErrorMessage = "Mã đại lý không được vượt quá 50 ký tự")]
		public string AgentCode { get; set; } = "";

		[Required(ErrorMessage = "Tên chủ vườn không được để trống")]
		[StringLength(200, ErrorMessage = "Tên chủ vườn không được vượt quá 200 ký tự")]
		public string FarmerName { get; set; } = "";

		[Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
		[StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
		public string? FarmPhone { get; set; }

		[StringLength(500, ErrorMessage = "Địa chỉ không được vượt quá 500 ký tự")]
		public string? FarmAddress { get; set; }

		public bool IsActive { get; set; } = true;

		// Farm specific fields
		[StringLength(200, ErrorMessage = "Chứng chỉ không được vượt quá 200 ký tự")]
		public string? Certificates { get; set; }

		[Range(0, 10000, ErrorMessage = "Diện tích phải từ 0 đến 10,000 ha")]
		public decimal? TotalAreaHa { get; set; }

		[Range(0, 10000, ErrorMessage = "Diện tích mủ phải từ 0 đến 10,000 ha")]
		public decimal? RubberAreaHa { get; set; }

		[Range(0, 1000000, ErrorMessage = "Sản lượng khai thác phải từ 0 đến 1,000,000 kg")]
		public decimal? TotalExploit { get; set; }

		public string? Polygon { get; set; } // WKT format
	}

	// ========================================
	// UPDATE FARM DTO - For PUT
	// ========================================
	public class UpdateFarmDto
	{
		[Required]
		public long FarmId { get; set; }

		[Required(ErrorMessage = "Mã nhà vườn không được để trống")]
		[StringLength(50, ErrorMessage = "Mã nhà vườn không được vượt quá 50 ký tự")]
		public string FarmCode { get; set; } = "";

		[Required(ErrorMessage = "Mã đại lý không được để trống")]
		[StringLength(50, ErrorMessage = "Mã đại lý không được vượt quá 50 ký tự")]
		public string AgentCode { get; set; } = "";

		[Required(ErrorMessage = "Tên chủ vườn không được để trống")]
		[StringLength(200, ErrorMessage = "Tên chủ vườn không được vượt quá 200 ký tự")]
		public string FarmerName { get; set; } = "";

		[Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
		[StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
		public string? FarmPhone { get; set; }

		[StringLength(500, ErrorMessage = "Địa chỉ không được vượt quá 500 ký tự")]
		public string? FarmAddress { get; set; }

		public bool IsActive { get; set; } = true;

		// Farm specific fields
		[StringLength(200, ErrorMessage = "Chứng chỉ không được vượt quá 200 ký tự")]
		public string? Certificates { get; set; }

		[Range(0, 10000, ErrorMessage = "Diện tích phải từ 0 đến 10,000 ha")]
		public decimal? TotalAreaHa { get; set; }

		[Range(0, 10000, ErrorMessage = "Diện tích mủ phải từ 0 đến 10,000 ha")]
		public decimal? RubberAreaHa { get; set; }

		[Range(0, 1000000, ErrorMessage = "Sản lượng khai thác phải từ 0 đến 1,000,000 kg")]
		public decimal? TotalExploit { get; set; }

		public string? Polygon { get; set; }
	}

	// ========================================
	// FARM RESPONSE - Generic API Response
	// ========================================
	public class FarmResponse<T>
	{
		public bool Success { get; set; }
		public string Message { get; set; } = "";
		public T? Data { get; set; }
		public int TotalRecords { get; set; }
	}

	// ========================================
	// BULK DELETE DTO
	// ========================================
	public class BulkDeleteFarmDto
	{
		[Required]
		public List<long> FarmIds { get; set; } = new();
	}

	// ========================================
	// APPROVE/UNAPPROVE DTO
	// ========================================
	public class ApproveFarmDto
	{
		[Required]
		public long FarmId { get; set; }

		[Required]
		public bool IsActive { get; set; }
	}

	// ========================================
	// IMPORT POLYGON DTO
	// ========================================
	public class ImportPolygonDto
	{
		[Required]
		public long FarmId { get; set; }

		[Required]
		public string Polygon { get; set; } = "";
	}
	/// <summary>
	/// For dropdown lists
	/// </summary>
	public class FarmDropdownDto
	{
		public long FarmId { get; set; }
		public string FarmCode { get; set; } = "";
		public string FarmerName { get; set; } = "";
		public string AgentCode { get; set; } = "";
	}

	/// <summary>
	/// Farm statistics
	/// </summary>
	public class FarmStatisticsDto
	{
		public int TotalFarms { get; set; }
		public int ActiveFarms { get; set; }
		public int InactiveFarms { get; set; }
		public int NewFarmsThisMonth { get; set; }
		public decimal TotalAreaHa { get; set; }
		public decimal TotalRubberAreaHa { get; set; }
		public decimal TotalExploitKg { get; set; }
		public int TotalAgents { get; set; }
	}
	/// <summary>
	/// Table result with pagination
	/// </summary>
	public class FarmTableResult
	{
		public List<RubberFarm> Data { get; set; } = new();
		public int TotalRecords { get; set; }
		public int PageNumber { get; set; }
		public int PageSize { get; set; }
		public int TotalPages { get; set; }
	}
}
