using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TAS.AttributeTargets
{
	public class RequireLoginAttribute : Attribute, IAsyncAuthorizationFilter
	{
		public string? Roles { get; }

		public RequireLoginAttribute() { }
		public RequireLoginAttribute(string roles) => Roles = roles;

		public Task OnAuthorizationAsync(AuthorizationFilterContext context)
		{
			// Bỏ qua nếu [AllowAnonymous]
			var endpoint = context.HttpContext.GetEndpoint();
			if (endpoint?.Metadata.GetMetadata<IAllowAnonymous>() != null) return Task.CompletedTask;

			var user = context.HttpContext.User;
			if (user?.Identity?.IsAuthenticated != true)
			{
				HandleUnauthenticated(context);
				return Task.CompletedTask;
			}

			// Kiểm tra Roles nếu có
			if (!string.IsNullOrWhiteSpace(Roles))
			{
				var required = Roles.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
				var ok = required.Any(user.IsInRole);
				if (!ok)
				{
					context.Result = new ForbidResult();
					return Task.CompletedTask;
				}
			}

			return Task.CompletedTask;
		}

		private static void HandleUnauthenticated(AuthorizationFilterContext context)
		{
			var req = context.HttpContext.Request;
			var wantsJson = IsApiOrAjax(req);

			if (wantsJson)
			{
				context.Result = new JsonResult(new { error = "Unauthorized" })
				{
					StatusCode = StatusCodes.Status401Unauthorized
				};
			}
			else
			{
				var returnUrl = Uri.EscapeDataString(req.Path + req.QueryString);
				context.Result = new RedirectToRouteResult(
					new RouteValueDictionary
					{
						["controller"] = "Account",
						["action"] = "Login",
						["returnUrl"] = returnUrl
					});
			}
		}

		private static bool IsApiOrAjax(HttpRequest req)
		{
			// AJAX hoặc client/API
			if (req.Headers.TryGetValue("X-Requested-With", out var xrw) && xrw == "XMLHttpRequest") return true;
			var accept = req.Headers["Accept"].ToString();
			if (!string.IsNullOrEmpty(accept) && accept.Contains("application/json", StringComparison.OrdinalIgnoreCase)) return true;
			// đường dẫn kiểu API
			if (req.Path.HasValue && req.Path.Value!.StartsWith("/api", StringComparison.OrdinalIgnoreCase)) return true;
			return false;
		}
	}
}
