using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using TAS.Resources;
public interface IBreadcrumbService
{
	List<(string Key_language, string Title, string Url)> GetBreadcrumb(ActionContext ctx);
}
public class BreadcrumbService : IBreadcrumbService
{
	private readonly IStringLocalizer<Language> _localizer;

	public BreadcrumbService(IStringLocalizer<Language> localizer)
	{
		_localizer = localizer;
	}

	public List<(string Key_language, string Title, string Url)> GetBreadcrumb(ActionContext ctx)
	{
		var action = ctx.ActionDescriptor;

		var attr = action.EndpointMetadata
						.OfType<BreadcrumbAttribute>()
						.FirstOrDefault();

		var list = new List<(string, string, string)>();
		
		// 1) Luôn có Home
		list.Add(("key_home", "", "/"));

		if (attr != null)
		{
			if (!string.IsNullOrEmpty(attr.Parent))
			{
				list.Add((attr.Parent, "", "#"));
			}

			list.Add((attr.Key_language, attr.Title, ctx.HttpContext.Request.Path));
		}

		return list;
	}
}
