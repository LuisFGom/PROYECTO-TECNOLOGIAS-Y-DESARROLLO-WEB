using InvoiceManagementSystem.Core.Entities;
using InvoiceManagementSystem.Core.Interfaces;
using InvoiceManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InvoiceManagementSystem.Infrastructure.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly ApplicationDbContext _context;

        public CustomerRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Customer> GetByIdAsync(int id)
        {
            return await _context.Customers.FindAsync(id);
        }

        public async Task<IEnumerable<Customer>> SearchAsync(string searchTerm)
        {
            return await _context.Customers
                .Where(c => c.FirstName.Contains(searchTerm) ||
                           c.LastName.Contains(searchTerm) ||
                           c.Email.Contains(searchTerm))
                .ToListAsync();
        }

        // AÑADE ESTE MÉTODO QUE FALTABA
        public async Task AddAsync(Customer customer)
        {
            await _context.Customers.AddAsync(customer);
            await _context.SaveChangesAsync();
        }
    }
}