using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using TAS.DTOs;
using TAS.Models;

namespace TAS.Data
{
	public class AppClaimsFactory : UserClaimsPrincipalFactory<UserAccountDto, IdentityRole>
	{
		public AppClaimsFactory(UserManager<UserAccountDto> um, RoleManager<IdentityRole> rm, IOptions<IdentityOptions> opt)
			: base(um, rm, opt) { }

		protected override async Task<ClaimsIdentity> GenerateClaimsAsync(UserAccountDto user)
		{
			var id = await base.GenerateClaimsAsync(user);
			id.AddClaim(new Claim(ClaimTypes.GivenName, user.FirstName ?? ""));
			id.AddClaim(new Claim(ClaimTypes.Surname, user.LastName ?? ""));
			id.AddClaim(new Claim("FullName", $"{user.FirstName} {user.LastName}".Trim()));
			return id;
		}
	}
}
