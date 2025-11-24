using Microsoft.AspNetCore.Mvc;

namespace InvoiceManagementSystem.Web.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home/Index
        // ✅ Mostrará la página de inicio con las tablas de Facturas, Clientes y Productos
        [HttpGet]
        public IActionResult Index()
        {
            return View();
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