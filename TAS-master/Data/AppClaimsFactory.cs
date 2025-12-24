using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using TAS.Models;

namespace TAS.Data
{
	public class AppClaimsFactory : UserClaimsPrincipalFactory<UserAccount, IdentityRole>
	{
		public AppClaimsFactory(UserManager<UserAccount> um, RoleManager<IdentityRole> rm, IOptions<IdentityOptions> opt)
			: base(um, rm, opt) { }

		protected override async Task<ClaimsIdentity> GenerateClaimsAsync(UserAccount user)
		{
			var id = await base.GenerateClaimsAsync(user);
			id.AddClaim(new Claim(ClaimTypes.GivenName, user.FirstName ?? ""));
			id.AddClaim(new Claim(ClaimTypes.Surname, user.LastName ?? ""));
			id.AddClaim(new Claim("FullName", $"{user.FirstName} {user.LastName}".Trim()));
			return id;
		}
	}
}
