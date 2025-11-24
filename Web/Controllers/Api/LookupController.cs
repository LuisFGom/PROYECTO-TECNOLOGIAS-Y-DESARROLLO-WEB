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
        /// ✅ ARREGLADO: Solo muestra resultados que coincidan
        /// </summary>
        [HttpGet("customers")]
        public async Task<IActionResult> SearchCustomers(string? q, int page = 1, int pageSize = 10)
        {
            q = q?.Trim() ?? "";

            // 🔥 SI NO HAY BÚSQUEDA, NO DEVOLVER NADA
            if (string.IsNullOrWhiteSpace(q))
            {
                return Ok(new { total = 0, items = new List<object>() });
            }

            var query = _ctx.Customers.AsQueryable();

            // ✅ BÚSQUEDA EXACTA - Solo coincidencias reales
            var qUpper = q.ToUpper();
            query = query.Where(c =>
                c.CustomerID.ToString() == q ||
                c.FirstName.ToUpper().StartsWith(qUpper) ||
                c.LastName.ToUpper().StartsWith(qUpper) ||
                c.Email.ToUpper().StartsWith(qUpper)
            );

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
        /// Buscar productos por código, nombre o ID
        /// GET: api/lookup/products?q=LAP&page=1&pageSize=10
        /// ✅ ARREGLADO: Solo muestra productos que coincidan
        /// </summary>
        [HttpGet("products")]
        public async Task<IActionResult> SearchProducts(string? q, int page = 1, int pageSize = 10)
        {
            q = q?.Trim() ?? "";

            var query = _ctx.Products.Where(p => p.IsActive);

            // 🔥 SI NO HAY BÚSQUEDA, NO DEVOLVER NADA
            if (string.IsNullOrWhiteSpace(q))
            {
                return Ok(new { total = 0, items = new List<object>() });
            }

            // ✅ BÚSQUEDA EXACTA - StartsWith en lugar de Contains
            var qUpper = q.ToUpper();
            query = query.Where(p =>
                p.ProductCode.ToUpper().StartsWith(qUpper) ||
                p.ProductName.ToUpper().StartsWith(qUpper) ||
                p.ProductID.ToString() == q
            );

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

        // 🔥 NUEVO: Listar todas las facturas con paginación
        [HttpGet("invoices")]
        public async Task<IActionResult> GetInvoices()
        {
            var invoices = await _ctx.Invoices
                .Include(i => i.Customer)
                .OrderByDescending(i => i.InvoiceDate)
                .Select(i => new
                {
                    i.InvoiceID,
                    i.InvoiceDate,
                    CustomerName = i.Customer.FirstName + " " + i.Customer.LastName,
                    i.Total
                })
                .ToListAsync();

            return Ok(invoices);
        }

        // 🔥 NUEVO: Listar todos los clientes
        [HttpGet("all-customers")]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _ctx.Customers
                .OrderBy(c => c.LastName)
                .Select(c => new
                {
                    c.CustomerID,
                    c.FirstName,
                    c.LastName,
                    c.Email,
                    c.CreatedDate
                })
                .ToListAsync();

            return Ok(customers);
        }

        // 🔥 NUEVO: Listar todos los productos
        [HttpGet("all-products")]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _ctx.Products
                .Where(p => p.IsActive)
                .OrderBy(p => p.ProductCode)
                .Select(p => new
                {
                    p.ProductID,
                    p.ProductCode,
                    p.ProductName,
                    p.Price,
                    p.Stock
                })
                .ToListAsync();

            return Ok(products);
        }
    }
}