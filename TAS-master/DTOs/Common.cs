namespace TAS.DTOs
{
	public class TotalCommonSystem
	{
		public string? Label { get; set; }
		public string? Color { get; set; }
		public string? Type { get; set; }
		public int Total { get; set; }
	}
	public class CboxCommonSystem
	{
		public string? Text { get; set; }
		public string? Value { get; set; }
		public string? Group { get; set; }
	}
	// 2. Output: Trả về bao gồm dữ liệu và tổng số dòng (để FE chia trang)
	public class PagedResult<T>
	{
		public List<T> Items { get; set; } = new List<T>();
		public int? TotalRecords { get; set; }
	}
}
