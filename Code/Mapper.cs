using MVPStudioReactOnboarding.Models;
using MVPStudioReactOnboarding.Dto;

namespace MVPStudioReactOnboarding.Code
{
    public static class Mapper
    {

        public static Dto.SaleDto MapSaleDto(Models.Sale Sale)
        {
            var sale = new Dto.SaleDto();
            if (Sale != null)
            {
                sale = new Dto.SaleDto
                {
                    SaleAmount = Sale?.Product.Price,
                    Id = Sale.Id,
                    CustomerName = Sale?.Customer.Name,
                    ProductName = Sale.Product.Name,
                    StoreName = Sale.Store.Name,
                    DateSold = Sale.DateSold,
                };
            }
            return sale;
        }
        public static Models.Sale MapSale(SaleDto Sale)
        {
            var sale = new Models.Sale();
            if (Sale != null)
            {
                sale.Customer.Name = Sale.CustomerName;
                sale.Product.Name = Sale.ProductName;
                sale.Store.Name= Sale.StoreName;
                sale.DateSold = Sale.DateSold;
                sale.Product.Price = Sale.SaleAmount;
             }
            return sale;
        }
        public static Models.Customer MapCustomer(CustomerDto Customer)
        {
            var customer = new Models.Customer();
            if (Customer != null)
            {
                customer.Id = Customer.Id;
                customer.Address = Customer.Address;
                customer.Name = Customer.Name;
            }
            return customer;
        }
        public static Dto.CustomerDto MapCustomerDto(Models.Customer Customer)
        {
            var customer = new Dto.CustomerDto();
            if (Customer != null)
            {
                customer = new Dto.CustomerDto
                {
                    Id = Customer.Id,
                    Address = Customer.Address,
                    Name = Customer.Name,

                };
            }
            return customer;
        }

       

        public static Dto.ProductDto MapProductDto(Models.Product Product)
        {
            var product = new Dto.ProductDto();
            if (Product != null)
            {
                product = new Dto.ProductDto
                {
                    Id = Product.Id,
                    Price = Product.Price,
                    Name = Product.Name,

                };
            }
            return product;
        }
        public static Models.Product MapProduct(ProductDto Product)
        {
            var product = new Models.Product();
            if (Product != null)
            {
                product.Id = Product.Id;
                product.Name = Product.Name;
                product.Price = Product.Price;
            }
            return product;
        }
        public static Dto.StoreDto MapStoreDto(Models.Store Store)
        {
            var store = new Dto.StoreDto();
            if (Store != null)
            {
                store = new Dto.StoreDto
                {
                    Id = Store.Id,
                    Address = Store.Address,
                    Name = Store.Name,

                };
            }
            return store;
        }
        public static Models.Store MapStore(StoreDto Store)
        {
            var store = new Models.Store();
            if (Store != null)
            {
                store.Id = Store.Id;
                store.Address = Store.Address;
                store.Name = Store.Name;
            }
            return store;
        }
    }
}
