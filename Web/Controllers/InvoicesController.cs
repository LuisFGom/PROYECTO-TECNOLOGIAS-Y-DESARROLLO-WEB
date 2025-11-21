using InvoiceManagementSystem.Core.Entities;
using InvoiceManagementSystem.Infrastructure.Data;
using InvoiceManagementSystem.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace InvoiceManagementSystem.Web.Controllers
{
    public class InvoicesController : Controller
    {
        private readonly ApplicationDbContext _ctx;

        public InvoicesController(ApplicationDbContext ctx)
        {
            _ctx = ctx;
        }

        // GET: Invoices/Create
        [HttpGet]
        public IActionResult Create()
        {
            var vm = new InvoiceCreateVm
            {
                InvoiceDate = DateTime.Now
            };
            return View(vm);
        }

        // POST: Invoices/Create - ✅ CORREGIDO CON NUEVA VENTANA
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(InvoiceCreateVm vm, string DetailsJson)
        {
            try
            {
                // Validar cliente
                if (vm.CustomerID == null || vm.CustomerID == 0)
                {
                    ModelState.AddModelError("", "Debe seleccionar un cliente.");
                    return View(vm);
                }

                // Parsear detalles del JSON
                var details = JsonSerializer.Deserialize<List<InvoiceDetailDto>>(DetailsJson);

                if (details == null || !details.Any())
                {
                    ModelState.AddModelError("", "La factura debe tener al menos un producto.");
                    return View(vm);
                }

                // Validar stock de cada producto
                foreach (var det in details)
                {
                    var product = await _ctx.Products.FindAsync(det.ProductID);
                    if (product == null)
                    {
                        ModelState.AddModelError("", $"Producto {det.ProductName} no existe");
                        continue;
                    }

                    if (det.Quantity > product.Stock)
                    {
                        ModelState.AddModelError("", $"Stock insuficiente para {product.ProductName}. Disponible: {product.Stock}");
                    }
                }

                if (!ModelState.IsValid)
                {
                    return View(vm);
                }

                // Calcular totales
                decimal subtotal = details.Sum(d => d.Quantity * d.UnitPrice);
                decimal tax = subtotal * 0.19m;
                decimal total = subtotal + tax;

                // Crear invoice
                var invoice = new Invoice
                {
                    CustomerID = vm.CustomerID.Value,
                    InvoiceDate = DateTime.Now,
                    SubTotal = subtotal,
                    Tax = tax,
                    Total = total
                };

                _ctx.Invoices.Add(invoice);
                await _ctx.SaveChangesAsync();

                // Guardar detalles y actualizar stock
                foreach (var det in details)
                {
                    var invoiceDetail = new InvoiceDetail
                    {
                        InvoiceID = invoice.InvoiceID,
                        ProductID = det.ProductID,
                        Quantity = det.Quantity,
                        UnitPrice = det.UnitPrice,
                        TotalPrice = det.Quantity * det.UnitPrice
                    };

                    _ctx.InvoiceDetails.Add(invoiceDetail);

                    // Actualizar stock
                    var product = await _ctx.Products.FindAsync(det.ProductID);
                    if (product != null)
                    {
                        product.Stock -= det.Quantity;
                    }
                }

                await _ctx.SaveChangesAsync();

                // ✅ REDIRIGIR A PÁGINA QUE ABRE LA FACTURA EN NUEVA VENTANA
                return Content($@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Factura Creada Exitosamente</title>
                        <style>
                            body {{
                                font-family: Arial, sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            }}
                            .message {{
                                background: white;
                                padding: 40px;
                                border-radius: 12px;
                                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                                text-align: center;
                            }}
                            .message h1 {{
                                color: #27ae60;
                                margin-bottom: 20px;
                            }}
                            .message p {{
                                color: #7f8c8d;
                                font-size: 16px;
                            }}
                            .loader {{
                                border: 4px solid #f3f3f3;
                                border-top: 4px solid #27ae60;
                                border-radius: 50%;
                                width: 40px;
                                height: 40px;
                                animation: spin 1s linear infinite;
                                margin: 20px auto;
                            }}
                            @keyframes spin {{
                                0% {{ transform: rotate(0deg); }}
                                100% {{ transform: rotate(360deg); }}
                            }}
                        </style>
                    </head>
                    <body>
                        <div class='message'>
                            <h1>✅ Factura Creada Exitosamente</h1>
                            <div class='loader'></div>
                            <p>Abriendo factura N° {invoice.InvoiceID.ToString("D6")}...</p>
                            <p>Redirigiendo en 2 segundos...</p>
                        </div>
                        <script>
                            // Abrir factura en nueva ventana
                            window.open('/Invoices/Print/{invoice.InvoiceID}', '_blank', 'width=1000,height=900,scrollbars=yes');
                            
                            // Redirigir después de 2 segundos
                            setTimeout(function() {{
                                window.location.href = '/Invoices/Create';
                            }}, 2000);
                        </script>
                    </body>
                    </html>
                ", "text/html");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", $"Error al crear la factura: {ex.Message}");
                return View(vm);
            }
        }

        // GET: Invoices/Print/5
        [HttpGet]
        public async Task<IActionResult> Print(int id)
        {
            var invoice = await _ctx.Invoices
                .Include(i => i.Customer)
                .Include(i => i.InvoiceDetails)
                    .ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(i => i.InvoiceID == id);

            if (invoice == null)
            {
                return NotFound();
            }

            return View(invoice);
        }
    }

    // DTO para recibir los detalles desde JSON
    public class InvoiceDetailDto
    {
        public int ProductID { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public int Stock { get; set; }
    }
}