using TAS.Models;

namespace TAS.Repository
{
	public interface IPdfService
	{
		byte[] GeneratePdf(PdfGeneration data);
	}
}
