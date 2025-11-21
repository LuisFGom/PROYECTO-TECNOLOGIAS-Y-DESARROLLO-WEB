namespace InvoiceManagementSystem.ViewModels;

public class InvoiceDetailVm
{
    public int ProductID { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => UnitPrice * Quantity;
    public int Stock { get; set; }
}

public class InvoiceCreateVm
{
    // Maestro (cliente)
    public int? CustomerID { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Datos factura
    public DateTime InvoiceDate { get; set; } = DateTime.Now;

    // Detalle
    public List<InvoiceDetailVm> Details { get; set; } = new();

    // Totales
    public decimal SubTotal => Details.Sum(d => d.TotalPrice);
    public decimal TaxRate { get; set; } = 0.19m;
    public decimal Tax => Math.Round(SubTotal * TaxRate, 2);
    public decimal Total => SubTotal + Tax;
}