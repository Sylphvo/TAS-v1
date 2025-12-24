using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;
using TAS.ViewModels;
using TAS.Repository;
using Moq;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using TAS.Models;

namespace TAS.Tests.PerformanceTests
{
    [MemoryDiagnoser]
    [RankColumn]
    public class UserAccountPerformanceTests
    {
        private UserAccountModels? _userAccountModels;
        private List<UserAccountRep>? _testUsers;

        [GlobalSetup]
        public void Setup()
        {
            var mockUserManage = new Mock<ICurrentUser>();
            var mockLogger = new Mock<ILogger<UserAccountModels>>();

            mockUserManage.Setup(x => x.Name).Returns("PerformanceTestUser");

            _userAccountModels = new UserAccountModels(
                mockUserManage.Object,
                mockLogger.Object);

            // Generate test data
            _testUsers = GenerateTestUsers(1000);
        }

        [Benchmark]
        public async Task GetUserAccountAsync_Performance()
        {
            await _userAccountModels!.GetUserAccountAsync();
        }

        [Benchmark]
        public void AddOrUpdateUserAccount_Single()
        {
            var user = new UserAccountRep
            {
                UserName = "perftest_user",
                Email = "perftest@test.com",
                FirstName = "Perf",
                LastName = "Test",
                IsActive = true
            };

            _userAccountModels!.AddOrUpdateUserAccount(user);
        }

        [Benchmark]
        public void AddOrUpdateUserAccount_Batch100()
        {
            for (int i = 0; i < 100; i++)
            {
                _userAccountModels!.AddOrUpdateUserAccount(_testUsers![i]);
            }
        }

        [Benchmark]
        public void DeleteUserAccount_Performance()
        {
            _userAccountModels!.DeleteUserAccount(1);
        }

        [Benchmark]
        public void ApproveDataUserAccount_Performance()
        {
            _userAccountModels!.ApproveDataUserAccount(1, true);
        }

        [Benchmark]
        public void ResetPassword_Performance()
        {
            _userAccountModels!.ResetPassword(1, "NewPassword123!");
        }

        private List<UserAccountRep> GenerateTestUsers(int count)
        {
            var users = new List<UserAccountRep>();

            for (int i = 0; i < count; i++)
            {
                users.Add(new UserAccountRep
                {
                    UserName = $"user_{i}",
                    Email = $"user{i}@test.com",
                    FirstName = $"FirstName{i}",
                    LastName = $"LastName{i}",
                    PhoneNumber = $"012345678{i % 10}",
                    IsActive = i % 2 == 0,
                    EmailConfirmed = i % 3 == 0,
                    PhoneNumberConfirmed = i % 4 == 0,
                    TwoFactorEnabled = i % 5 == 0,
                    LockoutEnabled = true
                });
            }

            return users;
        }

        // // Entry point for running benchmarks
        // public static void Main(string[] args)
        // {
        //     var summary = BenchmarkRunner.Run<UserAccountPerformanceTests>();
        // }
    }
}
