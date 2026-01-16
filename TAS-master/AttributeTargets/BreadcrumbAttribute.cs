using System;

[AttributeUsage(AttributeTargets.Method)]
public class BreadcrumbAttribute : Attribute
{
	public string Title { get; }
	public bool IsParent { get; }
	public string Url { get; }

	/// <summary>
	/// tạo breadcrumb trên đầu trang
	/// </summary>
	/// <param name="title">key từ khóa</param>
	/// <param name="isparent">tiêu đề trang</param>
	/// <param name="url">cấp cha</param>
	public BreadcrumbAttribute(string title, string url = "", bool isparent = true)
	{
		Title = title;
		Url = url;
		IsParent = isparent;
	}
}