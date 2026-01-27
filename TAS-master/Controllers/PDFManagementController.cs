using Microsoft.AspNetCore.Mvc;
using TAS.Models;
using TAS.Repository;
using TAS.Resources;
using TAS.ViewModels;
using static Azure.Core.HttpHeader;

namespace TAS.Controllers
{
	public class PDFManagementController : Controller

	{
		private readonly IPdfService _pdfService;
		private readonly CommonModels _common;

		public PDFManagementController(IPdfService pdfService, CommonModels common)
		{
			_pdfService = pdfService;
			_common = common;
		}
		[Breadcrumb(nameof(Language.key_templatepdf), "#", nameof(Language.key_setting), true)]
		public IActionResult PDFReview()
		{
			ViewData["Title"] = _common.GetValueByKey("key_templatepdf");
			return View();
		}
		[HttpPost]
		public IActionResult GeneratePdf([FromBody] PdfGeneration data)
		{
			try
			{
				var pdfBytes = _pdfService.GeneratePdf(data);
				return File(pdfBytes, "application/pdf", "DueDiligence.pdf");
			}
			catch (Exception ex)
			{
				return BadRequest(new { error = ex.Message });
			}
		}

		[HttpPost]
		public IActionResult PreviewPdf([FromBody] PdfGeneration data)
		{
			try
			{
				var pdfBytes = _pdfService.GeneratePdf(data);
				return File(pdfBytes, "application/pdf");
			}
			catch (Exception ex)
			{
				return BadRequest(new { error = ex.Message });
			}
		}
	}
}