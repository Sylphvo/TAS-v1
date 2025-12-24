using System.Buffers.Binary;
using System.Security.Cryptography;

namespace TAS.TagHelpers
{
	public static class PasswordHelper
	{
		const int Iter = 100_000, SaltSize = 16, KeySize = 32;

		public static byte[] Hash(string password)
		{
			var salt = RandomNumberGenerator.GetBytes(SaltSize);
			var key = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iter, HashAlgorithmName.SHA256, KeySize);
			var buf = new byte[1 + 4 + SaltSize + KeySize]; // v|iter|salt|key
			buf[0] = 1;
			BinaryPrimitives.WriteInt32LittleEndian(buf.AsSpan(1, 4), Iter);
			Buffer.BlockCopy(salt, 0, buf, 5, SaltSize);
			Buffer.BlockCopy(key, 0, buf, 5 + SaltSize, KeySize);
			return buf;
		}

		public static bool Verify(string password, byte[] stored)
		{
			if (stored is null || stored.Length < 1 + 4 + SaltSize + KeySize) return false;
			int iter = BinaryPrimitives.ReadInt32LittleEndian(stored.AsSpan(1, 4));
			var salt = stored.AsSpan(5, SaltSize).ToArray();
			var key = stored.AsSpan(5 + SaltSize, KeySize).ToArray();
			var test = Rfc2898DeriveBytes.Pbkdf2(password, salt, iter, HashAlgorithmName.SHA256, KeySize);
			return CryptographicOperations.FixedTimeEquals(key, test);
		}
	}
}
