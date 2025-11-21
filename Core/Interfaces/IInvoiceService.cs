using InvoiceManagementSystem.Core.Entities;
using InvoiceManagementSystem.Core.DTOs;

namespace InvoiceManagementSystem.Core.Interfaces
{
    public interface IInvoiceService
    {
        Task<Invoice> CreateInvoiceAsync(InvoiceCreateDto invoiceDto);
        Task<Invoice> GetInvoiceByIdAsync(int id);
        Task<bool> ValidateStockAsync(int productId, int quantity);
    }
}
