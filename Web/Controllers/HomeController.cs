using InvoiceManagementSystem.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace InvoiceManagementSystem.Web.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            // Inicializa el modelo con valores por defecto
            var model = new InvoiceViewModel
            {
                InvoiceDate = DateTime.Now,
                SubTotal = 0,
                Tax = 0,
                Total = 0,
                InvoiceDetails = new List<InvoiceDetailViewModel>()
            };

            return View(model);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View();
        }
    }
}