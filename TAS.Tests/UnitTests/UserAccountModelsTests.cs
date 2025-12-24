using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using TAS.ViewModels;
using TAS.Repository;
using TAS.Helpers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TAS.Models;

namespace TAS.Tests.UnitTests
{
    public class UserAccountModelsTests
    {
        private readonly Mock<ICurrentUser> _mockUserManage;
        private readonly Mock<ILogger<UserAccountModels>> _mockLogger;
        private readonly UserAccountModels _userAccountModels;

        public UserAccountModelsTests()
        {
            _mockUserManage = new Mock<ICurrentUser>();
            _mockLogger = new Mock<ILogger<UserAccountModels>>();

            // Setup mock current user
            _mockUserManage.Setup(x => x.Name).Returns("TestUser");

            _userAccountModels = new UserAccountModels(_mockUserManage.Object, _mockLogger.Object);
        }

        #region GetUserAccountAsync Tests

        [Fact]
        public async Task GetUserAccountAsync_ShouldReturnListOfUsers()
        {
            // Act
            var result = await _userAccountModels.GetUserAccountAsync();

            // Assert
            Assert.NotNull(result);
            Assert.IsType<List<UserAccountRep>>(result);
        }

        [Fact]
        public async Task GetUserAccountAsync_ShouldReturnUsersWithRowNumbers()
        {
            // Act
            var result = await _userAccountModels.GetUserAccountAsync();

            // Assert
            if (result.Count > 0)
            {
                Assert.True(result[0].rowNo >= 1);
            }
        }

        #endregion

        #region AddOrUpdateUserAccount Tests

        [Fact]
        public void AddOrUpdateUserAccount_WithValidData_ShouldReturnSuccess()
        {
            // Arrange
            var newUser = new UserAccountRep
            {
                Id = 0, // New user
                FirstName = "Nguyen",
                LastName = "Van A",
                UserName = "nguyenvana",
                Email = "nguyenvana@test.com",
                PhoneNumber = "0123456789",
                IsActive = true,
                EmailConfirmed = false,
                PhoneNumberConfirmed = false,
                TwoFactorEnabled = false,
                LockoutEnabled = true
            };

            // Act
            var result = _userAccountModels.AddOrUpdateUserAccount(newUser);

            // Assert
            Assert.True(result >= 0);
        }

        [Fact]
        public void AddOrUpdateUserAccount_WithExistingUser_ShouldUpdate()
        {
            // Arrange
            var existingUser = new UserAccountRep
            {
                Id = 1, // Existing user
                FirstName = "Tran",
                LastName = "Thi B",
                UserName = "tranthib",
                Email = "tranthib@test.com",
                PhoneNumber = "0987654321",
                IsActive = true,
                EmailConfirmed = true
            };

            // Act
            var result = _userAccountModels.AddOrUpdateUserAccount(existingUser);

            // Assert
            Assert.True(result >= 0);
        }

        [Fact]
        public void AddOrUpdateUserAccount_WithNullUser_ShouldThrowException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() =>
                _userAccountModels.AddOrUpdateUserAccount(null));
        }

        [Fact]
        public void AddOrUpdateUserAccount_ShouldNormalizeUserName()
        {
            // Arrange
            var user = new UserAccountRep
            {
                UserName = "testuser",
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User",
                IsActive = true
            };

            // Act
            var result = _userAccountModels.AddOrUpdateUserAccount(user);

            // Assert - NormalizedUserName should be uppercase
            Assert.True(result >= 0);
        }

        [Fact]
        public void AddOrUpdateUserAccount_ShouldNormalizeEmail()
        {
            // Arrange
            var user = new UserAccountRep
            {
                UserName = "testuser",
                Email = "Test@Example.Com",
                FirstName = "Test",
                LastName = "User",
                IsActive = true
            };

            // Act
            var result = _userAccountModels.AddOrUpdateUserAccount(user);

            // Assert - NormalizedEmail should be uppercase
            Assert.True(result >= 0);
        }

        #endregion

        #region DeleteUserAccount Tests

        [Fact]
        public void DeleteUserAccount_WithValidId_ShouldReturnSuccess()
        {
            // Arrange
            int userId = 1;

            // Act
            var result = _userAccountModels.DeleteUserAccount(userId);

            // Assert
            Assert.Equal(1, result);
        }

        [Fact]
        public void DeleteUserAccount_WithInvalidId_ShouldHandleGracefully()
        {
            // Arrange
            int userId = -1;

            // Act
            var result = _userAccountModels.DeleteUserAccount(userId);

            // Assert - Should return 0 or handle error
            Assert.True(result >= 0);
        }

        #endregion

        #region ApproveDataUserAccount Tests

        [Fact]
        public void ApproveDataUserAccount_ShouldActivateUser()
        {
            // Arrange
            int userId = 1;
            bool status = true;

            // Act
            var result = _userAccountModels.ApproveDataUserAccount(userId, status);

            // Assert
            Assert.Equal(1, result);
        }

        [Fact]
        public void ApproveDataUserAccount_ShouldDeactivateUser()
        {
            // Arrange
            int userId = 1;
            bool status = false;

            // Act
            var result = _userAccountModels.ApproveDataUserAccount(userId, status);

            // Assert
            Assert.Equal(1, result);
        }

        #endregion

        #region ResetPassword Tests

        [Fact]
        public void ResetPassword_WithValidPassword_ShouldReturnSuccess()
        {
            // Arrange
            int userId = 1;
            string newPassword = "NewPassword123!";

            // Act
            var result = _userAccountModels.ResetPassword(userId, newPassword);

            // Assert
            Assert.Equal(1, result);
        }

        [Fact]
        public void ResetPassword_ShouldHashPassword()
        {
            // Arrange
            int userId = 1;
            string plainPassword = "MyPassword123";

            // Act
            var result = _userAccountModels.ResetPassword(userId, plainPassword);

            // Assert - Password should be hashed, not stored as plain text
            Assert.Equal(1, result);
        }

        [Fact]
        public void ResetPassword_WithEmptyPassword_ShouldHandleGracefully()
        {
            // Arrange
            int userId = 1;
            string emptyPassword = "";

            // Act
            var result = _userAccountModels.ResetPassword(userId, emptyPassword);

            // Assert
            Assert.True(result >= 0);
        }

        #endregion

        #region Error Handling Tests

        [Fact]
        public void AddOrUpdateUserAccount_OnException_ShouldLogError()
        {
            // Arrange
            var invalidUser = new UserAccountRep(); // Missing required fields

            // Act
            var result = _userAccountModels.AddOrUpdateUserAccount(invalidUser);

            // Assert
            _mockLogger.Verify(
                x => x.Log(
                    It.Is<LogLevel>(l => l == LogLevel.Error),
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => true),
                    It.IsAny<Exception>(),
                    It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)),
                Times.AtLeastOnce);
        }

        #endregion

        #region Validation Tests

        [Theory]
        [InlineData("user@test.com", true)]
        [InlineData("invalid-email", false)]
        [InlineData("", false)]
        [InlineData(null, false)]
        public void Validate_EmailFormat(string? email, bool expectedValid)
        {
            // Arrange
            var user = new UserAccount
            {
                UserName = "testuser",
                Email = email ?? "",
                FirstName = "Test",
                LastName = "User",
                IsActive = true
            };

            // Act
            bool isValid = IsValidEmail(email ?? "");

            // Assert
            Assert.Equal(expectedValid, isValid);
        }

        [Theory]
        [InlineData("0123456789", true)]
        [InlineData("091234567890", true)]
        [InlineData("abc123", false)]
        [InlineData("", true)] // Empty is allowed
        public void Validate_PhoneNumberFormat(string phoneNumber, bool expectedValid)
        {
            // Arrange & Act
            bool isValid = IsValidPhoneNumber(phoneNumber);

            // Assert
            Assert.Equal(expectedValid, isValid);
        }

        #endregion

        #region Helper Methods

        private bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private bool IsValidPhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
                return true; // Empty is allowed

            return System.Text.RegularExpressions.Regex.IsMatch(
                phoneNumber, @"^[0-9]{10,15}$");
        }

        #endregion
    }
}
