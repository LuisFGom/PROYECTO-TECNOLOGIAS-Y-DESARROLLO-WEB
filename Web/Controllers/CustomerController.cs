using InvoiceManagementSystem.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InvoiceManagementSystem.Web.Controllers;

public class CustomerController : Controller
{
    private readonly ICustomerRepository _customerRepository;

    public CustomerController(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    [HttpGet]
    public async Task<JsonResult> Search(string term)
    {
        var customers = await _customerRepository.SearchAsync(term);
        return Json(customers);
    }

    [HttpGet]
    public async Task<JsonResult> GetById(int id)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        return Json(customer);
    }
}
