using System.ComponentModel.DataAnnotations;

namespace InvoiceManagementSystem.Core.Entities
{
    public class InvoiceDetail
    {
        [Key]
        public int InvoiceDetailID { get; set; }
        public int InvoiceID { get; set; }
        public int ProductID { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }

        // Navigation properties
        public Invoice Invoice { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}