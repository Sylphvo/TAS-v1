namespace TAS.Repository
{
	public interface ICurrentUser
	{
		string? Id { get; }
		string? Name { get; }
		string? FullName { get; }
		bool IsInRole(string role);
	}
}
