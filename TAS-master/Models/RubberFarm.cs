using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TAS.Models
{
	[Table("RubberFarm")]
	public class RubberFarmDb
	{
		[Key]
		public long FarmId { get; set; }
		public string? FarmCode { get; set; }//mã nhà vườn 
		public string? AgentCode { get; set; }// mã đại lý liên kết

		// Chủ hộ
		public string? FarmerName { get; set; }
		public string? FarmPhone { get; set; }
		public string? FarmAddress { get; set; }
		public string? Certificates { get; set; }// 

		public decimal? TotalAreaHa { get; set; }//Tổng diện tích (ha)
		public decimal? RubberAreaHa { get; set; }//Diện tích (ha)
		public decimal? TotalExploit { get; set; }//Tổng Khai thác (kg)

		public bool IsActive { get; set; } = true;// trạng thái đại lý 

		public DateTime RegisterDate { get; set; }//thời gian tạo
		public string? RegisterPerson { get; set; }//người tạo 
		public DateTime? UpdateDate { get; set; }//thời gian cập nhật
		public string? UpdatePerson { get; set; }//người cập nhật
		public string? Polygon { get; set; } //vị tri trí bản đồ dạng polygon

	}
	[Table("RubberType")] //loại mũ
	public class RubberType
	{
		[Key]
		public long TypeId { get; set; }
		public string? TypeCode { get; set; }//mã nhà vườn 
		public string? TypeName { get; set; }// mã đại lý liên kết
		public DateTime? UpdateDate { get; set; }//thời gian cập nhật
		public string? UpdatePerson { get; set; }//người cập nhật
	}
	// Request Model
	public class RubberFarmRequest
	{
		public long RowNo { get; set; }
		public long FarmId { get; set; }
		public string? FarmCode { get; set; }//mã nhà vườn 
		public string? AgentCode { get; set; }// mã đại lý liên kết
		public string? AgentName { get; set; }// tên đại lý

		// Chủ hộ
		public string? FarmerName { get; set; }
		public string? FarmPhone { get; set; }
		public string? FarmAddress { get; set; }
		public string? AgentAddress { get; set; }
		public string? Certificates { get; set; }// 

		public decimal? TotalAreaHa { get; set; }//Tổng diện tích (ha)
		public decimal? RubberAreaHa { get; set; }//Diện tích (ha)
		public decimal? TotalExploit { get; set; }//Tổng Khai thác (kg)
		public string? Polygon { get; set; }//người tạo 

		public int IsActive { get; set; }// trạng thái nhà vườn
		public string? UpdateBy { get; set; }//người tạo 
		public string? UpdateTime { get; set; }//người tạo 

		public DateTime registerDate { get; set; }//thời gian tạo
		public string? registerPerson { get; set; }//người tạo 
		public DateTime? updateDate { get; set; }//thời gian cập nhật
		public string? updatePerson { get; set; }//người cập nhật
	}
}
