using System.ComponentModel.DataAnnotations;

namespace TAS.DTOs
{
	// ========================================
	// AGENT DTO - Display/Response
	// ========================================
	public class RubberAgentDto
	{
		public int AgentId { get; set; }
		public string AgentCode { get; set; } = "";
		public string AgentName { get; set; } = "";
		public string? AgentPhone { get; set; }
		public string? AgentAddress { get; set; }
		public bool IsActive { get; set; } = true;
		public DateTime RegisterDate { get; set; }
		public string? RegisterPerson { get; set; }
		public DateTime? UpdateDate { get; set; }
		public string? UpdatePerson { get; set; }
		public string? Polygon { get; set; } // WKT format for geography
	}

	// ========================================
	// AGENT SEARCH DTO - Filter Parameters
	// ========================================
	public class AgentSearchDto
	{
		public int AgentId { get; set; }
		public string AgentCode { get; set; } = "";
		public string AgentName { get; set; } = "";
		public string? AgentPhone { get; set; }
		public string? AgentAddress { get; set; }
		public bool IsActive { get; set; } = true;
		public DateTime RegisterDate { get; set; }
		public string? RegisterPerson { get; set; }
		public DateTime? UpdateDate { get; set; }
		public string? UpdatePerson { get; set; }
		public string? SearchKeyword { get; set; }

		// Pagination
		public int PageNumber { get; set; } = 1;
		public int PageSize { get; set; } = 100;

		// Sorting
		public string SortColumn { get; set; } = "RegisterDate";
		public string SortOrder { get; set; } = "desc";
	}

	// ========================================
	// CREATE AGENT DTO - For POST
	// ========================================
	public class CreateAgentDto
	{
		[Required(ErrorMessage = "Mã đại lý không được để trống")]
		[StringLength(50, ErrorMessage = "Mã đại lý không được vượt quá 50 ký tự")]
		public string AgentCode { get; set; } = "";

		[Required(ErrorMessage = "Tên đại lý không được để trống")]
		[StringLength(200, ErrorMessage = "Tên đại lý không được vượt quá 200 ký tự")]
		public string AgentName { get; set; } = "";

		[Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
		[StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
		public string? AgentPhone { get; set; }

		[StringLength(500, ErrorMessage = "Địa chỉ không được vượt quá 500 ký tự")]
		public string? AgentAddress { get; set; }

		public bool IsActive { get; set; } = true;

		public string? Polygon { get; set; } // WKT format
	}

	// ========================================
	// UPDATE AGENT DTO - For PUT
	// ========================================
	public class UpdateAgentDto
	{
		[Required]
		public int AgentId { get; set; }

		[Required(ErrorMessage = "Mã đại lý không được để trống")]
		[StringLength(50, ErrorMessage = "Mã đại lý không được vượt quá 50 ký tự")]
		public string AgentCode { get; set; } = "";

		[Required(ErrorMessage = "Tên đại lý không được để trống")]
		[StringLength(200, ErrorMessage = "Tên đại lý không được vượt quá 200 ký tự")]
		public string AgentName { get; set; } = "";

		[Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
		[StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
		public string? AgentPhone { get; set; }

		[StringLength(500, ErrorMessage = "Địa chỉ không được vượt quá 500 ký tự")]
		public string? AgentAddress { get; set; }

		public bool IsActive { get; set; } = true;

		public string? Polygon { get; set; }
	}

	// ========================================
	// AGENT RESPONSE - Generic API Response
	// ========================================
	public class AgentResponse<T>
	{
		public bool Success { get; set; }
		public string Message { get; set; } = "";
		public T? Data { get; set; }
		public int TotalRecords { get; set; }
	}

	// ========================================
	// BULK DELETE DTO
	// ========================================
	public class BulkDeleteAgentDto
	{
		[Required]
		public List<int> AgentIds { get; set; } = new();
	}
	// ========================================
	// ADDITIONAL DTOs
	// ========================================

	/// <summary>
	/// Table result with pagination
	/// </summary>
	public class AgentTableResult
	{
		public List<AgentSearchDto> Data { get; set; } = new();
		public int TotalRecords { get; set; }
		public int PageNumber { get; set; }
		public int PageSize { get; set; }
		public int TotalPages { get; set; }
	}

	/// <summary>
	/// For dropdown lists
	/// </summary>
	public class AgentDropdownDto
	{
		public int AgentId { get; set; }
		public string AgentCode { get; set; } = "";
		public string AgentName { get; set; } = "";
	}	

	/// <summary>
	/// Agent with pond count
	/// </summary>
	public class AgentWithPondCountDto
	{
		public int AgentId { get; set; }
		public string AgentCode { get; set; } = "";
		public string AgentName { get; set; } = "";
		public string? AgentPhone { get; set; }
		public string? AgentAddress { get; set; }
		public bool IsActive { get; set; }
		public int PondCount { get; set; }
		public decimal TotalNetKg { get; set; }
	}
}