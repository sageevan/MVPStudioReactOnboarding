using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using MVPStudioReactOnboarding.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MVPStudioReactOnboarding.Code;
using MVPStudioReactOnboarding.Models;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace MVPStudioReactOnboarding.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly MvponboardingReactContext _context;

        public ProductsController(MvponboardingReactContext context)
        {
            _context = context;
        }

        // GET: api/Products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            try
            {
                if (_context.Products == null)
                {
                    return NotFound();

                }
                var products = await _context.Products.Select(p => Mapper.MapProductDto(p)).ToListAsync();
                return new JsonResult(products);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            if (_context.Products == null)
            {
                return NotFound();
            }
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // PUT: api/Products/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Products
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ProductDto>> PostProduct(ProductDto product)
        {
            if (_context.Products == null)
            {
                return Problem("Entity set products is null.");
            }

            var entity = Mapper.MapProduct(product);
            try
            {
                if (product.Id == 0)
                {
                    if ((bool)(!_context.Products.Any(p => p.Name == product.Name && p.Price == product.Price)))
                    {
                        _context.Products.Add(entity);
                        await _context.SaveChangesAsync();
                        return new JsonResult(Mapper.MapProductDto(entity));
                    }
                }
                else
                {
                    if ((bool)(!_context.Products.Any(p => p.Name == product.Name && p.Price == product.Price)))
                    {
                        _context.Products.Update(entity).State = EntityState.Modified;
                        await _context.SaveChangesAsync();
                        return new JsonResult(Mapper.MapProductDto(entity));

                    }
                }
                return Problem("Product Already available.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            if (_context.Products == null)
            {
                return NotFound();
            }
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            try
            {
                if (_context.Sales.Any(s => s.ProductId == product.Id))
                {
                    return Problem("Product connot be deleted when involved in a sale.");
                }
                else if ((bool)(_context.Products.Any(p => p.Id == product.Id)))
                {
                    _context.Products.Remove(product);
                    await _context.SaveChangesAsync();
                    return new JsonResult(Mapper.MapProductDto(product));
                }
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private bool ProductExists(int id)
        {
            return (_context.Products?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
