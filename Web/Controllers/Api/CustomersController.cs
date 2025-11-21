using InvoiceManagementSystem.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InvoiceManagementSystem.Web.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomersController(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string term)
        {
            if (string.IsNullOrWhiteSpace(term))
                return BadRequest("Search term is required");

            var customers = await _customerRepository.SearchAsync(term);
            return Ok(customers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var customer = await _customerRepository.GetByIdAsync(id);
            if (customer == null)
                return NotFound();

            return Ok(customer);
        }
    }
}