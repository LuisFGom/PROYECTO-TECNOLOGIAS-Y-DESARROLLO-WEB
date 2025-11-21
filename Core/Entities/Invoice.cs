using System.ComponentModel.DataAnnotations;

namespace InvoiceManagementSystem.Core.Entities
{
    public class Invoice
    {
        [Key]
        public int InvoiceID { get; set; }
        public int CustomerID { get; set; }
        public DateTime InvoiceDate { get; set; } = DateTime.Now;
        public decimal SubTotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }

        // Navigation properties
        public Customer Customer { get; set; } = null!;
        public ICollection<InvoiceDetail> InvoiceDetails { get; set; } = new List<InvoiceDetail>();
    }
}