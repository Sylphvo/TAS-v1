using Microsoft.AspNetCore.Mvc;
using TAS.Models;
using TAS.Repository;

namespace TAS.Controllers
{
	public class PDFManagementController : Controller

	{
		private readonly IPdfService _pdfService;

		public PDFManagementController(IPdfService pdfService)
		{
			_pdfService = pdfService;
		}
		[Breadcrumb("key_templatepdf")]
		public IActionResult PDFReview()
		{
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