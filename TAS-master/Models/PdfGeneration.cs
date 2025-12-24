namespace TAS.Models
{
	public class PdfGeneration
	{
		// Operator Information
		public string OperatorName { get; set; } = string.Empty;
		public string OperatorAddress { get; set; } = string.Empty;
		public string OperatorCity { get; set; } = string.Empty;
		public string OperatorTel { get; set; } = string.Empty;
		public string OperatorFax { get; set; } = string.Empty;

		// Shipper Information
		public string ShipperName { get; set; } = string.Empty;
		public string ShipperAddress { get; set; } = string.Empty;
		public string ShipperCity { get; set; } = string.Empty;
		public string ShipperCountry { get; set; } = string.Empty;
		public string ShipperTel { get; set; } = string.Empty;
	}
}
