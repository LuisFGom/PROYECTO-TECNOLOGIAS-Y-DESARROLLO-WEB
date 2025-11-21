using InvoiceManagementSystem.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InvoiceManagementSystem.Web.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepository _productRepository;

        public ProductsController(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string term)
        {
            if (string.IsNullOrWhiteSpace(term))
                return BadRequest("Search term is required");

            var products = await _productRepository.SearchAsync(term);
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound();

            return Ok(product);
        }
    }
}