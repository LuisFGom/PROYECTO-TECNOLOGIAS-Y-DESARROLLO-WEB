using System.ComponentModel.DataAnnotations;

namespace InvoiceManagementSystem.ViewModels
{
    public class InvoiceViewModel
    {
        public int InvoiceID { get; set; }

        [Required(ErrorMessage = "El cliente es requerido")]
        public int CustomerID { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime InvoiceDate { get; set; } = DateTime.Now;

        public decimal SubTotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }

        // Información del cliente seleccionado
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;

        // Lista de productos en la factura
        public List<InvoiceDetailViewModel> InvoiceDetails { get; set; } = new();
    }

    public class InvoiceDetailViewModel
    {
        public int InvoiceDetailID { get; set; }
        public int ProductID { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}