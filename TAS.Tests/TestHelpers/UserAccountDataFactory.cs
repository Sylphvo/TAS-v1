using Bogus;
using TAS.Repository;
using System;
using System.Collections.Generic;
using TAS.Models;
using TAS.DTOs;

namespace TAS.Tests.TestHelpers
{
    public class UserAccountRepDataFactory
    {
        private readonly Faker<UserAccountDto> _userFaker;

        public UserAccountRepDataFactory()
        {
            _userFaker = new Faker<UserAccountDto>()
                .RuleFor(u => u.Id, f => f.Random.Int(1, 10000))
                .RuleFor(u => u.UserName, f => f.Internet.UserName())
                .RuleFor(u => u.Email, f => f.Internet.Email())
                .RuleFor(u => u.FirstName, f => f.Name.FirstName())
                .RuleFor(u => u.LastName, f => f.Name.LastName())
                .RuleFor(u => u.PhoneNumber, f => f.Phone.PhoneNumber("0#########"))
                .RuleFor(u => u.IsActive, f => f.Random.Bool())
                .RuleFor(u => u.EmailConfirmed, f => f.Random.Bool())
                .RuleFor(u => u.PhoneNumberConfirmed, f => f.Random.Bool())
                .RuleFor(u => u.TwoFactorEnabled, f => f.Random.Bool())
                .RuleFor(u => u.LockoutEnabled, f => f.Random.Bool())
                .RuleFor(u => u.AccessFailedCount, f => f.Random.Int(0, 5))
                .RuleFor(u => u.CreatedAtUtc, f => f.Date.Past(1))
                .RuleFor(u => u.CreatedBy, f => f.Name.FullName())
                .RuleFor(u => u.UpdatedAtUtc, f => f.Date.Recent(30))
                .RuleFor(u => u.UpdatedBy, f => f.Name.FullName())
                .RuleFor(u => u.NormalizedUserName, (f, u) => u.UserName?.ToUpper())
                .RuleFor(u => u.NormalizedEmail, (f, u) => u.Email?.ToUpper())
                .RuleFor(u => u.PasswordHash, f => f.Random.Hash())
                .RuleFor(u => u.SecurityStamp, f => Guid.NewGuid().ToString())
                .RuleFor(u => u.ConcurrencyStamp, f => Guid.NewGuid().ToString());
        }

        /// <summary>
        /// Generate a single random user
        /// </summary>
        public UserAccountDto GenerateUser()
        {
            return _userFaker.Generate();
        }

        /// <summary>
        /// Generate multiple random users
        /// </summary>
        public List<UserAccountDto> GenerateUsers(int count)
        {
            return _userFaker.Generate(count);
        }

        /// <summary>
        /// Generate a user with specific properties
        /// </summary>
        public UserAccountDto GenerateActiveUser()
        {
            var user = _userFaker.Generate();
            user.IsActive = true;
            user.EmailConfirmed = true;
            user.LockoutEnabled = false;
            return user;
        }

        /// <summary>
        /// Generate an inactive user
        /// </summary>
        public UserAccountDto GenerateInactiveUser()
        {
            var user = _userFaker.Generate();
            user.IsActive = false;
            return user;
        }

        /// <summary>
        /// Generate a user with 2FA enabled
        /// </summary>
        public UserAccountDto GenerateUserWith2FA()
        {
            var user = _userFaker.Generate();
            user.TwoFactorEnabled = true;
            user.EmailConfirmed = true;
            user.PhoneNumberConfirmed = true;
            return user;
        }

        /// <summary>
        /// Generate a locked out user
        /// </summary>
        public UserAccountDto GenerateLockedOutUser()
        {
            var user = _userFaker.Generate();
            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.UtcNow.AddHours(1);
            user.AccessFailedCount = 5;
            return user;
        }

        /// <summary>
        /// Generate a new user (Id = 0)
        /// </summary>
        public UserAccountDto GenerateNewUser()
        {
            var user = _userFaker.Generate();
            user.Id = 0;
            user.CreatedAtUtc = DateTime.UtcNow;
            user.UpdatedAtUtc = DateTime.UtcNow;
            user.CreatedBy = DateTime.UtcNow.ToString("system");
            user.UpdatedBy = DateTime.UtcNow.ToString("system"); ;
            return user;
        }

        /// <summary>
        /// Generate an admin user
        /// </summary>
        public UserAccountDto GenerateAdminUser()
        {
            var user = _userFaker.Generate();
            user.UserName = "admin";
            user.Email = "admin@example.com";
            user.IsActive = true;
            user.EmailConfirmed = true;
            user.TwoFactorEnabled = true;
            user.LockoutEnabled = false;
            return user;
        }

        /// <summary>
        /// Generate a test user with specific username
        /// </summary>
        public UserAccountDto GenerateUserWithUsername(string username)
        {
            var user = _userFaker.Generate();
            user.UserName = username;
            user.NormalizedUserName = username.ToUpper();
            return user;
        }

        /// <summary>
        /// Generate a test user with specific email
        /// </summary>
        public UserAccountDto GenerateUserWithEmail(string email)
        {
            var user = _userFaker.Generate();
            user.Email = email;
            user.NormalizedEmail = email.ToUpper();
            return user;
        }

        /// <summary>
        /// Generate users for Vietnamese names
        /// </summary>
        public UserAccountDto GenerateVietnameseUser()
        {
            var user = _userFaker.Generate();

            var vietnameseFirstNames = new[] { "An", "Bình", "Châu", "Dũng", "Hà", "Khoa", "Linh", "Minh", "Nam", "Phong" };
            var vietnameseLastNames = new[] { "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ" };

            var random = new Random();
            user.FirstName = vietnameseFirstNames[random.Next(vietnameseFirstNames.Length)];
            user.LastName = vietnameseLastNames[random.Next(vietnameseLastNames.Length)];

            return user;
        }

        /// <summary>
        /// Generate a user for testing validation
        /// </summary>
        public UserAccountDto GenerateInvalidUser()
        {
            return new UserAccountDto
            {
                Id = 0,
                UserName = "", // Invalid - empty
                Email = "invalid-email", // Invalid format
                PhoneNumber = "abc123", // Invalid format
                IsActive = true
            };
        }
    }

    /// <summary>
    /// Extension methods for UserAccountRep testing
    /// </summary>
    public static class UserAccountRepExtensions
    {
        public static UserAccountDto WithId(this UserAccountDto user, int id)
        {
            user.Id = id;
            return user;
        }

        public static UserAccountDto WithUserName(this UserAccountDto user, string username)
        {
            user.UserName = username;
            user.NormalizedUserName = username.ToUpper();
            return user;
        }

        public static UserAccountDto WithEmail(this UserAccountDto user, string email)
        {
            user.Email = email;
            user.NormalizedEmail = email.ToUpper();
            return user;
        }

        public static UserAccountDto AsActive(this UserAccountDto user)
        {
            user.IsActive = true;
            return user;
        }

        public static UserAccountDto AsInactive(this UserAccountDto user)
        {
            user.IsActive = false;
            return user;
        }

        public static UserAccountDto WithEmailConfirmed(this UserAccountDto user, bool confirmed = true)
        {
            user.EmailConfirmed = confirmed;
            return user;
        }

        public static UserAccountDto With2FA(this UserAccountDto user, bool enabled = true)
        {
            user.TwoFactorEnabled = enabled;
            return user;
        }
    }
}
