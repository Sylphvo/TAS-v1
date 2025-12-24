using Microsoft.AspNetCore.Mvc;
using TAS.Helpers;
using TAS.ViewModels;
using TAS.Repository;
using TAS.Models;

namespace TAS.Controllers
{
	public class UserAccountController : Controller
	{
		private readonly UserAccountModels models;
		private readonly CommonModels _common;
		
		public UserAccountController(UserAccountModels _models, CommonModels common)
		{
			models = _models;
			_common = common;
		}
		
		[Breadcrumb("key_useraccountinfo")]
		public IActionResult UserAccount()
		{
			return View();
		}
		
		#region handle Data
		[HttpPost]
		public async Task<IActionResult> UserAccounts()
		{
			var lstData = await models.GetUserAccountAsync();
			return new JsonResult(lstData);
		}
		
		[HttpPost]
		public JsonResult AddOrUpdate([FromBody] UserAccountRep userAccount)
		{
			int result = models.AddOrUpdateUserAccount(userAccount);
			return Json(result);
		}

		[HttpPost]
		public JsonResult DeleteUserAccount(int userId)
		{
			return Json(models.DeleteUserAccount(userId));
		}

		[HttpPost]
		public JsonResult ApproveDataUserAccount(int userId, bool status)
		{
			return Json(models.ApproveDataUserAccount(userId, status));
		}

		[HttpPost]
		public JsonResult ResetPassword(int userId, string newPassword)
		{
			return Json(models.ResetPassword(userId, newPassword));
		}
		#endregion
	}
}
