using InvoiceManagementSystem.Core.Entities;

namespace InvoiceManagementSystem.Core.Interfaces;

// Core/Interfaces/ICustomerRepository.cs
public interface ICustomerRepository
{
    Task<Customer> GetByIdAsync(int id);
    Task<IEnumerable<Customer>> SearchAsync(string searchTerm);
    Task AddAsync(Customer customer);
}
