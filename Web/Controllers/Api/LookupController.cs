using InvoiceManagementSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvoiceManagementSystem.Web.Controllers.Api
{
    [Route("api/lookup")]
    [ApiController]
    public class LookupController : ControllerBase
    {
        private readonly ApplicationDbContext _ctx;

        public LookupController(ApplicationDbContext ctx)
        {
            _ctx = ctx;
        }

        /// <summary>
        /// Buscar clientes por cualquier campo (ID, nombre, apellido, email)
        /// GET: api/lookup/customers?q=juan&page=1&pageSize=10
        /// </summary>
        [HttpGet("customers")]
        public async Task<IActionResult> SearchCustomers(string? q, int page = 1, int pageSize = 10)
        {
            q = q?.Trim() ?? "";

            var query = _ctx.Customers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                // ✅ BÚSQUEDA CORREGIDA con EF.Functions.Like
                query = query.Where(c =>
                    EF.Functions.Like(c.CustomerID.ToString(), $"%{q}%") ||
                    EF.Functions.Like(c.FirstName, $"%{q}%") ||
                    EF.Functions.Like(c.LastName, $"%{q}%") ||
                    EF.Functions.Like(c.Email, $"%{q}%")
                );
            }

            var total = await query.CountAsync();

            var items = await query
                .OrderBy(c => c.LastName)
                .ThenBy(c => c.FirstName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new
                {
                    c.CustomerID,
                    c.FirstName,
                    c.LastName,
                    c.Email
                })
                .ToListAsync();

            return Ok(new { total, items });
        }

        /// <summary>
        /// Buscar productos por código, nombre o ID - BÚSQUEDA EXACTA
        /// GET: api/lookup/products?q=LAP&page=1&pageSize=10
        /// </summary>
        [HttpGet("products")]
        public async Task<IActionResult> SearchProducts(string? q, int page = 1, int pageSize = 10)
        {
            q = q?.Trim() ?? "";

            var query = _ctx.Products.Where(p => p.IsActive);

            if (!string.IsNullOrWhiteSpace(q))
            {
                // ✅ BÚSQUEDA CORREGIDA - Ahora solo muestra productos que CONTIENEN el texto buscado
                query = query.Where(p =>
                    EF.Functions.Like(p.ProductCode, $"%{q}%") ||
                    EF.Functions.Like(p.ProductName, $"%{q}%") ||
                    EF.Functions.Like(p.ProductID.ToString(), $"%{q}%")
                );
            }

            var total = await query.CountAsync();

            var items = await query
                .OrderBy(p => p.ProductCode)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.ProductID,
                    p.ProductCode,
                    p.ProductName,
                    p.Price,
                    p.Stock
                })
                .ToListAsync();

            return Ok(new { total, items });
        }

        /// <summary>
        /// Obtener un producto específico por ID
        /// GET: api/lookup/product/5
        /// </summary>
        [HttpGet("product/{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _ctx.Products
                .Where(p => p.ProductID == id && p.IsActive)
                .Select(p => new
                {
                    p.ProductID,
                    p.ProductCode,
                    p.ProductName,
                    p.Price,
                    p.Stock
                })
                .FirstOrDefaultAsync();

            if (product == null)
                return NotFound(new { message = "Producto no encontrado" });

            return Ok(product);
        }

        /// <summary>
        /// Obtener un cliente específico por ID
        /// GET: api/lookup/customer/5
        /// </summary>
        [HttpGet("customer/{id}")]
        public async Task<IActionResult> GetCustomer(int id)
        {
            var customer = await _ctx.Customers
                .Where(c => c.CustomerID == id)
                .Select(c => new
                {
                    c.CustomerID,
                    c.FirstName,
                    c.LastName,
                    c.Email
                })
                .FirstOrDefaultAsync();

            if (customer == null)
                return NotFound(new { message = "Cliente no encontrado" });

            return Ok(customer);
        }
    }
}