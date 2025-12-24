using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TAS.Helpers
{

	// Model đại lý
	[Table("RubberAgent")]
	public class RubberAgent
	{
		[Key]
		public long AgentId { get; set; } //Khóa định danh đại lý
		public string? AgentCode { get; set; } //Khóa định danh đại lý
		public string? AgentName { get; set; } //Tên đại lý
		public string? OwnerName { get; set; } //Chủ sở hữu/Người đại diện
		public string? TaxCode { get; set; } // Mã số thuế
		public string? AgentAddress { get; set; } // Địa chỉ đại lý 

		public int IsActive { get; set; }// trạng thái đại lý 
		public DateTime RegisterDate { get; set; }//thời gian tạo
		public string? RegisterPerson { get; set; }//người tạo 
		public DateTime? UpdateDate { get; set; }//thời gian cập nhật
		public string? UpdatePerson { get; set; }//người cập nhật
	}
	public class RubberAgentRequest
	{
		public long agentId { get; set; } //Khóa định danh đại lý
		public string? agentCode { get; set; } //Khóa định danh đại lý
		public string? agentName { get; set; } //Tên đại lý
		public string? ownerName { get; set; } //Chủ sở hữu/Người đại diện
		public string? taxCode { get; set; } // Mã số thuế
		public string? agentAddress { get; set; } // Địa chỉ đại lý 

		public int isActive { get; set; }// trạng thái đại lý 
		public DateTime registerDate { get; set; }//thời gian tạo
		public string? registerPerson { get; set; }//người tạo 
		public DateTime? updateDate { get; set; }//thời gian cập nhật
		public string? updatePerson { get; set; }//người cập nhật
	}
}
