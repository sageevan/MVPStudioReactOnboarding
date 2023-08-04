namespace MVPStudioReactOnboarding.Dto
{
    public class SaleDto
    {
        public int Id { get; set; }

        public String ProductName { get; set; } = string.Empty;

        public String CustomerName { get; set; } = string.Empty;

        public String StoreName { get; set; } = string.Empty;

        public DateTime? DateSold { get; set; }
    }
}
