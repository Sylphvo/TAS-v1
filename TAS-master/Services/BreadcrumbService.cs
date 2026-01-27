using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using System;
using TAS.Resources;
public interface IBreadcrumbService
{
	List<(string title, string url, string titleParent, bool isparent)> GetBreadcrumb(ActionContext ctx);
}
public class BreadcrumbService : IBreadcrumbService
{
	private readonly IStringLocalizer<Language> _localizer;

	public BreadcrumbService(IStringLocalizer<Language> localizer)
	{
		_localizer = localizer;
	}

	public List<(string title, string url, string titleParent, bool isparent)> GetBreadcrumb(ActionContext ctx)
	{
		var action = ctx.ActionDescriptor;
		var attr = action.EndpointMetadata.OfType<BreadcrumbAttribute>().FirstOrDefault();
		var list = new List<(string, string, string, bool)>();

		if (attr != null && attr.IsParent)
		{
			if (attr.TitleParent != "")
			{
				list.Add((attr.TitleParent, "/", "", true));
			}
			else
			{
				list.Add(("key_home", "/", "", true));
			}
		}	
		
		if (attr != null)
		{
			if (!string.IsNullOrEmpty(attr.Url))
			{
				list.Add((attr.Title, attr.Url, "", true));
			}
		}
		return list;
	}
}
