namespace InvoiceManagementSystem.Core.DTOs
{
    public class InvoiceCreateDto
    {
        public int CustomerID { get; set; }
        public List<InvoiceItemDto> Items { get; set; }
    }

    public class InvoiceItemDto
    {
        public int ProductID { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}