using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Azure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MVPStudioReactOnboarding.Code;
using MVPStudioReactOnboarding.Dto;
using MVPStudioReactOnboarding.Models;

namespace MVPStudioReactOnboarding.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly MvponboardingReactContext _context;

        public CustomersController(MvponboardingReactContext context)
        {
            _context = context;
        }

        // GET: api/Customers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
        {
            try
            {
                if (_context.Customers == null)
                {
                    return NotFound();
                }
                var customers = await _context.Customers.Select(s => Mapper.MapCustomerDto(s)).ToListAsync();
                return new JsonResult(customers);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
                
        }

        // GET: api/Customers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
          if (_context.Customers == null)
          {
              return NotFound();
          }
            var customer = await _context.Customers.FindAsync(id);

            if (customer == null)
            {
                return NotFound();
            }

            return customer;
        }

        // PUT: api/Customers/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCustomer(int id, Customer customer)
        {
            if (id != customer.Id)
            {
                return BadRequest();
            }

            _context.Entry(customer).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CustomerExists(id))
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

        // POST: api/Customers
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<CustomerDto>> PostCustomer(CustomerDto customer)
        {
            if (_context.Customers == null)
            {
                return Problem("Entity set Customers is null.");
            }

            var entity = Mapper.MapCustomer(customer);
            try
            {
                if (customer.Id == 0)
                {
                    if ((bool)(!_context.Customers.Any(c => c.Name == customer.Name && c.Address == customer.Address)))
                    {
                        _context.Customers.Add(entity);
                        await _context.SaveChangesAsync();
                        return new JsonResult(Mapper.MapCustomerDto(entity));
                    }
                 }
                else
                {
                    if ((bool)(!_context.Customers.Any(c => c.Name == customer.Name && c.Address == customer.Address)))
                    {
                        _context.Customers.Update(entity).State = EntityState.Modified;
                        await _context.SaveChangesAsync();
                        return new JsonResult(Mapper.MapCustomerDto(entity));

                    }
                }
                return Problem("Customer Already available.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

 
        }

        // DELETE: api/Customers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            if (_context.Customers == null)
            {
                return NotFound();
            }
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound();
            }

            try
            {
                if(_context.Sales.Any(s => s.CustomerId == customer.Id)) {
                    return Problem("Customer connot be deleted when involved in a sale.");
                }
                else if ((bool)(_context.Customers.Any(c => c.Id == customer.Id)))
                {
                    _context.Customers.Remove(customer);
                    await _context.SaveChangesAsync();
                    return new JsonResult(Mapper.MapCustomerDto(customer));
                }
                return NotFound();
            }catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private bool CustomerExists(int id)
        {
            return (_context.Customers?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
