﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using MVPStudioReactOnboarding.Dto;
using MVPStudioReactOnboarding.Code;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MVPStudioReactOnboarding.Models;
using Microsoft.VisualStudio.Web.CodeGeneration.EntityFrameworkCore;

namespace MVPStudioReactOnboarding.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoresController : ControllerBase
    {
        private readonly MvponboardingReactContext _context;

        public StoresController(MvponboardingReactContext context)
        {
            _context = context;
        }

        // GET: api/Stores
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StoreDto>>> GetStores()
        {
            try
            {
                if (_context.Stores == null)
                {
                    return NotFound();
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            var stores = await _context.Stores.Select(s => Mapper.MapStoreDto(s)).ToListAsync();
            return new JsonResult(stores);
        }

        // GET: api/Stores/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Store>> GetStore(int id)
        {
          if (_context.Stores == null)
          {
              return NotFound();
          }
            var store = await _context.Stores.FindAsync(id);

            if (store == null)
            {
                return NotFound();
            }

            return store;
        }

        // PUT: api/Stores/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStore(int id, Store store)
        {
            if (id != store.Id)
            {
                return BadRequest();
            }

            _context.Entry(store).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StoreExists(id))
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

        // POST: api/Stores
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<StoreDto>> PostStore(StoreDto store)
        {
          if (_context.Stores == null)
          {
              return Problem("Entity set stores is null.");
          }
            var entity = Mapper.MapStore(store);
            try
            {
                if (store.Id == 0)
                {
                    if ((bool)(!_context.Stores.Any(c => c.Name == store.Name && c.Address == store.Address)))
                    {
                        _context.Stores.Add(entity);
                        await _context.SaveChangesAsync();
                        return new JsonResult(Mapper.MapStoreDto(entity));
                    }
                    }
                else
                {
                    if ((bool)(!_context.Customers.Any(c => c.Name == store.Name && c.Address == store.Address)))
                    {
                        _context.Stores.Update(entity).State=EntityState.Modified;
                    await _context.SaveChangesAsync();
                        return new JsonResult(Mapper.MapStoreDto(entity));

                    }
                }
                return Problem("Customer Already available.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        // DELETE: api/Stores/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStore(int id)
        {
            if (_context.Stores == null)
            {
                return NotFound();
            }
            var store = await _context.Stores.FindAsync(id);
            if (store == null)
            {
                return NotFound();
            }

            try
            {
                if (_context.Sales.Any(s => s.StoreId == store.Id))
                {
                    return Problem("Store connot be deleted when involved in a sale.");
                }
                else if ((bool)(_context.Stores.Any(c => c.Id == store.Id)))
                {
                    _context.Stores.Remove(store);
                    await _context.SaveChangesAsync();
                    return new JsonResult(Mapper.MapStoreDto(store));
                }
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private bool StoreExists(int id)
        {
            return (_context.Stores?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
