namespace InvoiceManagementSystem.Core.Entities;

public class Product
{
    public int ProductID { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public bool IsActive { get; set; } = true;
}