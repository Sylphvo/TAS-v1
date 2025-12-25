using System.Security.Claims;

namespace TAS.Repository
{
	// ========================================
	// IMPLEMENTATION
	// ========================================
	public class CurrentUser : ICurrentUser
	{
		private readonly IHttpContextAccessor _httpContextAccessor;

		public CurrentUser(IHttpContextAccessor httpContextAccessor)
		{
			_httpContextAccessor = httpContextAccessor;
		}

		// User ID
		public Guid? UserId
		{
			get
			{
				var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
				if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
				{
					return userId;
				}
				return null;
			}
		}

		// Username
		public string Name
		{
			get
			{
				return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value
					?? _httpContextAccessor.HttpContext?.User?.Identity?.Name
					?? "SYSTEM";
			}
		}

		// Email
		public string Email
		{
			get
			{
				return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value
					?? string.Empty;
			}
		}

		// Full Name
		public string FullName
		{
			get
			{
				return _httpContextAccessor.HttpContext?.User?.FindFirst("FullName")?.Value
					?? Name;
			}
		}

		// Is Authenticated
		public bool IsAuthenticated
		{
			get
			{
				return _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
			}
		}

		// Roles
		public IEnumerable<string> Roles
		{
			get
			{
				return _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role)
					.Select(c => c.Value)
					?? Enumerable.Empty<string>();
			}
		}
	}
}