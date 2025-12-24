using iText.Kernel.Colors;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Borders;
using iText.Layout.Element;
using iText.Layout.Properties;
using TAS.Models;
using TAS.Repository;

namespace TAS.Services
{
	public class PdfService : IPdfService
	{

		public byte[] GeneratePdf(PdfGeneration data)
		{
			using var memoryStream = new MemoryStream();
			var writer = new PdfWriter(memoryStream);
			var pdf = new PdfDocument(writer);
			var document = new Document(pdf);

			// Title
			var title = new Paragraph("Due Diligence Statement")
				.SetTextAlignment(TextAlignment.CENTER)
				.SetFontSize(24)
				//.SetBold()
				.SetMarginBottom(30);
			document.Add(title);

			// Create table with 2 columns
			var table = new Table(2);
			table.SetWidth(UnitValue.CreatePercentValue(100));

			// Header cells
			var operatorHeader = new Cell()
				.Add(new Paragraph("Operator").SetFontSize(16))
				.SetBackgroundColor(ColorConstants.LIGHT_GRAY)
				.SetTextAlignment(TextAlignment.LEFT)
				.SetPadding(10)
				.SetBorder(new SolidBorder(ColorConstants.BLACK, 1));

			var shipperHeader = new Cell()
				.Add(new Paragraph("Shipper").SetFontSize(16))
				.SetBackgroundColor(ColorConstants.LIGHT_GRAY)
				.SetTextAlignment(TextAlignment.LEFT)
				.SetPadding(10)
				.SetBorder(new SolidBorder(ColorConstants.BLACK, 1));

			table.AddCell(operatorHeader);
			table.AddCell(shipperHeader);

			// Operator Content
			var operatorContent = new Paragraph()
				.SetFontSize(10)
				.SetMargin(0);

			operatorContent.Add(new Text(data.OperatorName + "\n"));
			operatorContent.Add(new Text(data.OperatorAddress + "\n"));
			operatorContent.Add(new Text(data.OperatorCity + "\n"));
			operatorContent.Add(new Text("TEL: " + data.OperatorTel + "\n"));
			operatorContent.Add(new Text("FAX: " + data.OperatorFax));

			var operatorCell = new Cell()
				.Add(operatorContent)
				.SetPadding(15)
				.SetBorder(new SolidBorder(ColorConstants.BLACK, 1))
				.SetVerticalAlignment(VerticalAlignment.TOP);

			// Shipper Content
			var shipperContent = new Paragraph()
				.SetFontSize(10)
				.SetMargin(0);

			shipperContent.Add(new Text(data.ShipperName + "\n"));
			shipperContent.Add(new Text(data.ShipperAddress + "\n"));
			shipperContent.Add(new Text(data.ShipperCity + "\n"));
			shipperContent.Add(new Text(data.ShipperCountry + "\n"));
			shipperContent.Add(new Text("Tel: " + data.ShipperTel));

			var shipperCell = new Cell()
				.Add(shipperContent)
				.SetPadding(15)
				.SetBorder(new SolidBorder(ColorConstants.BLACK, 1))
				.SetVerticalAlignment(VerticalAlignment.TOP);

			table.AddCell(operatorCell);
			table.AddCell(shipperCell);

			document.Add(table);
			document.Close();

			return memoryStream.ToArray();
		}
	}
}
