using MVPStudioReactOnboarding.Models;
using MVPStudioReactOnboarding.Dto;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.CodeAnalysis.CSharp.Syntax;

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
                //    SaleAmount = Sale?.Product.Price,
                    Id = Sale.Id,
                    CustomerName = Sale.Customer?.Name,
                    CustomerId = (int)Sale.CustomerId,
                    ProductName = Sale.Product?.Name,
                    ProductId = (int)Sale.ProductId,
                    StoreName = Sale.Store?.Name,
                    StoreId = (int)Sale.StoreId,
                    DateSold = Sale.DateSold,
                };
            }
            return sale;
        }
        public static Models.Sale MapSale(SaleDto saleDto)
        {
            if (saleDto == null)
            {
                return null; // or throw an exception if appropriate
            }
            var sale = new Sale
            {
                Id = saleDto.Id,
                //CustomerId = new Customer
                CustomerId =saleDto.CustomerId,
                ProductId=saleDto.ProductId,
                StoreId=saleDto.StoreId,
                
                ////     Product = new Product { Name = saleDto.ProductName, Price = saleDto.SaleAmount },
                //Product = new Product { Name = saleDto.ProductName },
                //Store = new Store { Name = saleDto.StoreName },
                DateSold = saleDto.DateSold
            };
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
