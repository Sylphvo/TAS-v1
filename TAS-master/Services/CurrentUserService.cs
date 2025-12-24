using System.Security.Claims;
using TAS.Repository;

namespace TAS.Services
{
	public sealed class CurrentUserService : ICurrentUser
	{
		private readonly IHttpContextAccessor _acc;
		public CurrentUserService(IHttpContextAccessor acc) => _acc = acc;

		ClaimsPrincipal? U => _acc.HttpContext?.User;

		public string? Id => U?.FindFirstValue(ClaimTypes.NameIdentifier);
		public string? Name => U?.Identity?.Name ?? U?.FindFirstValue(ClaimTypes.Name);
		public string? FullName => U?.FindFirstValue("FullName");
		public bool IsInRole(string role) => U?.IsInRole(role) ?? false;
	}
}
