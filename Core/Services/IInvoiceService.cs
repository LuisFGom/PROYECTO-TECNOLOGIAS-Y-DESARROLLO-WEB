using InvoiceManagementSystem.Core.DTOs;
using InvoiceManagementSystem.Core.Entities;
using InvoiceManagementSystem.Core.Interfaces;

namespace InvoiceManagementSystem.Core.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IProductRepository _productRepository;

        public InvoiceService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public Task<Invoice> CreateInvoiceAsync(InvoiceCreateDto invoiceDto)
        {
            // Implementaremos esto después
            throw new NotImplementedException();
        }

        public Task<Invoice> GetInvoiceByIdAsync(int id)
        {
            // Implementaremos esto después
            throw new NotImplementedException();
        }

        public async Task<bool> ValidateStockAsync(int productId, int quantity)
        {
            var product = await _productRepository.GetByIdAsync(productId);
            return product != null && product.Stock >= quantity;
        }
    }
}