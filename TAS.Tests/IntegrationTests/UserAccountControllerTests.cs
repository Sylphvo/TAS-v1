using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Threading.Tasks;
using TAS.Controllers;
using TAS.DTOs;
using TAS.Models;
using TAS.Repository;
using TAS.ViewModels;
using Xunit;

namespace TAS.Tests.IntegrationTests
{
    public class UserAccountControllerTests
    {
        private readonly Mock<UserAccountModels> _mockModels;
        private readonly Mock<CommonModels> _mockCommonModels;
        private readonly UserAccountController _controller;

        public UserAccountControllerTests()
        {
            _mockModels = new Mock<UserAccountModels>(
                Mock.Of<ICurrentUser>(),
                Mock.Of<ILogger<UserAccountModels>>());

            _mockCommonModels = new Mock<CommonModels>();

            //_controller = new UserAccountController(
            //    _mockModels.Object,
            //    _mockCommonModels.Object);
        }

        #region UserAccount Action Tests

        //[Fact]
        //public void UserAccount_ShouldReturnView()
        //{
        //    // Act
        //    var result = _controller.UserAccount();

        //    // Assert
        //    Assert.IsType<ViewResult>(result);
        //}

        #endregion

        #region UserAccounts (Get List) Tests

        //[Fact]
        //public async Task UserAccounts_ShouldReturnJsonResult()
        //{
        //    // Arrange
        //    var mockUsers = new List<UserAccountDto>
        //    {
        //        new UserAccountDto
        //        {
        //            Id = 1,
        //            UserName = "user1",
        //            Email = "user1@test.com",
        //            IsActive = true
        //        },
        //        new UserAccountDto
        //        {
        //            Id = 2,
        //            UserName = "user2",
        //            Email = "user2@test.com",
        //            IsActive = false
        //        }
        //    };

        //    _mockModels.Setup(x => x.GetUserAccountAsync())
        //        .ReturnsAsync(mockUsers);

        //    // Act
        //    var result = await _controller.UserAccounts();

        //    // Assert
        //    var jsonResult = Assert.IsType<JsonResult>(result);
        //    var data = jsonResult.Value as List<UserAccountDto>;
        //    Assert.NotNull(data);
        //    Assert.Equal(2, data.Count);
        //}

        //[Fact]
        //public async Task UserAccounts_ShouldReturnEmptyListWhenNoUsers()
        //{
        //    // Arrange
        //    _mockModels.Setup(x => x.GetUserAccountAsync())
        //        .ReturnsAsync(new List<UserAccountDto>());

        //    // Act
        //    var result = await _controller.UserAccounts();

        //    // Assert
        //    var jsonResult = Assert.IsType<JsonResult>(result);
        //    var data = jsonResult.Value as List<UserAccountDto>;
        //    Assert.NotNull(data);
        //    Assert.Empty(data);
        //}

        #endregion

        #region AddOrUpdate Tests

   //     [Fact]
   //     public void AddOrUpdate_WithNewUser_ShouldReturnSuccess()
   //     {
   //         // Arrange
   //         var newUser = new UserAccountDto
			//{
   //             Id = 0,
   //             UserName = "newuser",
   //             Email = "newuser@test.com",
   //             FirstName = "New",
   //             LastName = "User",
   //             IsActive = true
   //         };

   //         _mockModels.Setup(x => x.AddOrUpdateUserAccount(It.IsAny<UserAccountDto>()))
   //             .Returns(1); // Success

   //         // Act
   //         var result = _controller.AddOrUpdate(newUser);

   //         // Assert
   //         var jsonResult = Assert.IsType<JsonResult>(result);
   //         Assert.Equal(1, jsonResult.Value);
   //     }

   //     [Fact]
   //     public void AddOrUpdate_WithExistingUser_ShouldReturnSuccess()
   //     {
   //         // Arrange
   //         var existingUser = new UserAccountDto
   //         {
   //             Id = 1,
   //             UserName = "existinguser",
   //             Email = "existing@test.com",
   //             FirstName = "Existing",
   //             LastName = "User",
   //             IsActive = true
   //         };

   //         _mockModels.Setup(x => x.AddOrUpdateUserAccount(It.IsAny<UserAccountDto>()))
   //             .Returns(0); // Update returns 0

   //         // Act
   //         var result = _controller.AddOrUpdate(existingUser);

   //         // Assert
   //         var jsonResult = Assert.IsType<JsonResult>(result);
   //         Assert.Equal(0, jsonResult.Value);
   //     }

   //     [Fact]
   //     public void AddOrUpdate_WithInvalidData_ShouldReturnFailure()
   //     {
   //         // Arrange
   //         var invalidUser = new UserAccountDto(); // Missing required fields

   //         _mockModels.Setup(x => x.AddOrUpdateUserAccount(It.IsAny<UserAccountDto>()))
   //             .Returns(0); // Failure

   //         // Act
   //         var result = _controller.AddOrUpdate(invalidUser);

   //         // Assert
   //         var jsonResult = Assert.IsType<JsonResult>(result);
   //         Assert.Equal(0, jsonResult.Value);
   //     }

        #endregion

        #region DeleteUserAccount Tests

        //[Fact]
        //public void DeleteUserAccount_WithValidId_ShouldReturnSuccess()
        //{
        //    // Arrange
        //    int userId = 1;
        //    _mockModels.Setup(x => x.DeleteUserAccount(userId))
        //        .Returns(1); // Success

        //    // Act
        //    var result = _controller.DeleteUserAccount(userId);

        //    // Assert
        //    var jsonResult = Assert.IsType<JsonResult>(result);
        //    Assert.Equal(1, jsonResult.Value);
        //}

        //[Fact]
        //public void DeleteUserAccount_WithInvalidId_ShouldReturnFailure()
        //{
        //    // Arrange
        //    int userId = -1;
        //    _mockModels.Setup(x => x.DeleteUserAccount(userId))
        //        .Returns(0); // Failure

        //    // Act
        //    var result = _controller.DeleteUserAccount(userId);

        //    // Assert
        //    var jsonResult = Assert.IsType<JsonResult>(result);
        //    Assert.Equal(0, jsonResult.Value);
        //}

        //[Fact]
        //public void DeleteUserAccount_ShouldCallModelMethod()
        //{
        //    // Arrange
        //    int userId = 1;
        //    _mockModels.Setup(x => x.DeleteUserAccount(userId))
        //        .Returns(1);

        //    // Act
        //    _controller.DeleteUserAccount(userId);

        //    // Assert
        //    _mockModels.Verify(x => x.DeleteUserAccount(userId), Times.Once);
        //}

        //#endregion

        //#region ApproveDataUserAccount Tests

        //[Fact]
        //public void ApproveDataUserAccount_ActivateUser_ShouldReturnSuccess()
        //{
        //    // Arrange
        //    int userId = 1;
        //    bool status = true;
        //    _mockModels.Setup(x => x.ApproveDataUserAccount(userId, status))
        //        .Returns(1);

        //    // Act
        //    var result = _controller.ApproveDataUserAccount(userId, status);

        //    // Assert
        //    var jsonResult = Assert.IsType<JsonResult>(result);
        //    Assert.Equal(1, jsonResult.Value);
        //}

        //[Fact]
        //public void ApproveDataUserAccount_DeactivateUser_ShouldReturnSuccess()
        //{
        //    // Arrange
        //    int userId = 1;
        //    bool status = false;
        //    _mockModels.Setup(x => x.ApproveDataUserAccount(userId, status))
        //        .Returns(1);

        //    // Act
        //    var result = _controller.ApproveDataUserAccount(userId, status);

        //    // Assert
        //    var jsonResult = Assert.IsType<JsonResult>(result);
        //    Assert.Equal(1, jsonResult.Value);
        //}

        //[Fact]
        //public void ApproveDataUserAccount_ShouldCallModelMethod()
        //{
        //    // Arrange
        //    int userId = 1;
        //    bool status = true;
        //    _mockModels.Setup(x => x.ApproveDataUserAccount(userId, status))
        //        .Returns(1);

        //    // Act
        //    _controller.ApproveDataUserAccount(userId, status);

        //    // Assert
        //    _mockModels.Verify(x => x.ApproveDataUserAccount(userId, status), Times.Once);
        //}

        //#endregion

        //#region ResetPassword Tests

        //[Fact]
        //public void ResetPassword_WithValidPassword_ShouldReturnSuccess()
        //{
        //    // Arrange
        //    int userId = 1;
        //    string newPassword = "NewPassword123!";
        //    _mockModels.Setup(x => x.ResetPassword(userId, newPassword))
        //        .Returns(1);

        //    // Act
        //    var result = _controller.ResetPassword(userId, newPassword);

        //    // Assert
        //    var jsonResult = Assert.IsType<JsonResult>(result);
        //    Assert.Equal(1, jsonResult.Value);
        //}

        //[Fact]
        //public void ResetPassword_WithEmptyPassword_ShouldReturnFailure()
        //{
        //    // Arrange
        //    int userId = 1;
        //    string emptyPassword = "";
        //    _mockModels.Setup(x => x.ResetPassword(userId, emptyPassword))
        //        .Returns(0);

        //    // Act
        //    var result = _controller.ResetPassword(userId, emptyPassword);

        //    // Assert
        //    var jsonResult = Assert.IsType<JsonResult>(result);
        //    Assert.Equal(0, jsonResult.Value);
        //}

        //[Fact]
        //public void ResetPassword_ShouldCallModelMethod()
        //{
        //    // Arrange
        //    int userId = 1;
        //    string newPassword = "NewPassword123!";
        //    _mockModels.Setup(x => x.ResetPassword(userId, newPassword))
        //        .Returns(1);

        //    // Act
        //    _controller.ResetPassword(userId, newPassword);

        //    // Assert
        //    _mockModels.Verify(x => x.ResetPassword(userId, newPassword), Times.Once);
        //}

        #endregion

        #region HTTP Method Tests

        [Fact]
        public void UserAccounts_ShouldHaveHttpPostAttribute()
        {
            // Arrange
            var methodInfo = typeof(UserAccountController)
                .GetMethod("UserAccounts");

            // Act
            var attribute = methodInfo.GetCustomAttributes(
                typeof(HttpPostAttribute), false);

            // Assert
            Assert.NotEmpty(attribute);
        }

        [Fact]
        public void AddOrUpdate_ShouldHaveHttpPostAttribute()
        {
            // Arrange
            var methodInfo = typeof(UserAccountController)
                .GetMethod("AddOrUpdate");
            if (methodInfo != null)
            {
                // Act
                var attribute = methodInfo.GetCustomAttributes(
                    typeof(HttpPostAttribute), false);
                // Assert
                Assert.NotEmpty(attribute);
            }

        }

        #endregion
    }
}
