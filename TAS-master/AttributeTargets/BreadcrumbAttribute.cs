using System;

[AttributeUsage(AttributeTargets.Method)]
public class BreadcrumbAttribute : Attribute
{
	public string Key_language { get; }
	public string Title { get; }
	public string Parent { get; }

	/// <summary>
	/// tạo breadcrumb trên đầu trang
	/// </summary>
	/// <param name="key_language">key từ khóa</param>
	/// <param name="title">tiêu đề trang</param>
	/// <param name="parent">cấp cha</param>
	public BreadcrumbAttribute(string key_language, string title = "", string parent = "")
	{
		Key_language = key_language;
		Title = title;
		Parent = parent;
	}
}