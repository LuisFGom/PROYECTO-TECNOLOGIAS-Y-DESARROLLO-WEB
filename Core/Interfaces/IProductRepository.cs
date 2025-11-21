using InvoiceManagementSystem.Core.Entities;

namespace InvoiceManagementSystem.Core.Interfaces;

// Core/Interfaces/IProductRepository.cs
public interface IProductRepository
{
    Task<Product> GetByIdAsync(int id);
    Task<IEnumerable<Product>> SearchAsync(string searchTerm);
    Task UpdateStockAsync(int productId, int quantity);
}