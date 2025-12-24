using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace TAS.TagHelpers
{
	public class ConnectDbHelper
	{
		private readonly string _connectionString;
		public ConnectDbHelper()
		{
			IConfiguration cfg = new ConfigurationBuilder()
				.AddJsonFile("appsettings.json")
				.Build();
			_connectionString = cfg.GetConnectionString("DefaultConnection")!;
		}

		public ConnectDbHelper(string connectionString)
		{
			_connectionString = connectionString;
		}

		// Query trả về danh sách
		public async Task<List<T>> QueryAsync<T>(string sql, object? param = null)
		{
			await using var conn = new SqlConnection(_connectionString);
			var result = await conn.QueryAsync<T>(sql, param);
			return result.ToList();
		}

		// Query trả về 1 record
		public async Task<T?> QueryFirstOrDefaultAsync<T>(string sql, object? param = null)
		{
			await using var conn = new SqlConnection(_connectionString);
			return await conn.QueryFirstOrDefaultAsync<T>(sql, param);
		}

		// Execute (INSERT, UPDATE, DELETE)
		public int Execute(string sql, object? param = null)
		{
			using var conn = new SqlConnection(_connectionString);
			return conn.Execute(sql, param);
		}

		// Query trả về chuỗi
		public string QueryString(string sql, object? param = null, int? timeout = null)
		{
			using var conn = new SqlConnection(_connectionString);
			var s = conn.ExecuteScalar<string?>(new CommandDefinition(
				sql, param, commandType: CommandType.Text, commandTimeout: timeout));
			return s ?? string.Empty;
		}

		// Query trả về scalar value (COUNT, SUM, etc.)
		public async Task<T> ExecuteScalarAsync<T>(string sql, object? param = null)
		{
			await using var conn = new SqlConnection(_connectionString);

			object? result = await conn.ExecuteScalarAsync(sql, param);

			if (result is null || result is DBNull)
				throw new InvalidOperationException("ExecuteScalar returned NULL.");

			return (T)Convert.ChangeType(result, typeof(T));
		}


		// Query với transaction
		public async Task<bool> ExecuteTransactionAsync(Func<SqlConnection, SqlTransaction, Task> action)
		{
			await using var conn = new SqlConnection(_connectionString);
			await conn.OpenAsync();
			await using var transaction = conn.BeginTransaction();

			try
			{
				await action(conn, transaction);
				await transaction.CommitAsync();
				return true;
			}
			catch
			{
				await transaction.RollbackAsync();
				throw;
			}
		}
		// Query trả về danh sách không bất đồng bộ
		public List<T> Query<T>(string sql, object? param = null)
		{
			using var conn = new SqlConnection(_connectionString);
			var result = conn.Query<T>(sql, param);
			return result.ToList();
		}

	}
}
