using MVPStudioReactOnboarding.Models;

namespace MVPStudioReactOnboarding.Dto
{
    public class SaleDto
    {
        public int Id { get; set; }
     //   public decimal? SaleAmount { get; set; }
        public String ProductName { get; set; } = string.Empty;

        public int ProductId { get; set; }

        public int CustomerId { get; set; }

        public int StoreId { get; set; }

        public String CustomerName { get; set; } = string.Empty;

        public String StoreName { get; set; } = string.Empty;

        public DateTime? DateSold { get; set; }

        public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();
        public virtual ICollection<Store> Stores { get; set; } = new List<Store>();
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    }
}
