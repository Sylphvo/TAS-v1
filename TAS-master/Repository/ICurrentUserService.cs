namespace TAS.Repository
{
	// ========================================
	// INTERFACE
	// ========================================
	public interface ICurrentUser
	{
		Guid? UserId { get; }
		string Name { get; }
		string Email { get; }
		string FullName { get; }
		bool IsAuthenticated { get; }
		IEnumerable<string> Roles { get; }
	}
}
