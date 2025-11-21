using InvoiceManagementSystem.Core.Entities;
using InvoiceManagementSystem.Core.Interfaces;
using InvoiceManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InvoiceManagementSystem.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Product> GetByIdAsync(int id)
        {
            return await _context.Products.FindAsync(id);
        }

        public async Task<IEnumerable<Product>> SearchAsync(string searchTerm)
        {
            return await _context.Products
                .Where(p => p.ProductName.Contains(searchTerm) ||
                           p.ProductCode.Contains(searchTerm))
                .ToListAsync();
        }

        public async Task UpdateStockAsync(int productId, int quantity)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product != null)
            {
                product.Stock -= quantity;
                await _context.SaveChangesAsync();
            }
        }
    }
}