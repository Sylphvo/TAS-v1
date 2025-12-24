using System;

[AttributeUsage(AttributeTargets.Method)]
public class BreadcrumbAttribute : Attribute
{
	public string Key_language { get; }
	public string Title { get; }
	public string Parent { get; }

	public BreadcrumbAttribute(string key_language, string title = "", string parent = "")
	{
		Key_language = key_language;
		Title = title;
		Parent = parent;
	}
}