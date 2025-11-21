using InvoiceManagementSystem.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace InvoiceManagementSystem.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceDetail> InvoiceDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de relaciones
            modelBuilder.Entity<Invoice>()
                .HasMany(i => i.InvoiceDetails)
                .WithOne(id => id.Invoice)
                .HasForeignKey(id => id.InvoiceID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Customer)
                .WithMany()
                .HasForeignKey(i => i.CustomerID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvoiceDetail>()
                .HasOne(id => id.Product)
                .WithMany()
                .HasForeignKey(id => id.ProductID)
                .OnDelete(DeleteBehavior.Restrict);

            // *** CONFIGURACIÓN DE PRECISIÓN DECIMAL - SOLUCIONA LAS ADVERTENCIAS ***

            // Configuración para Invoice
            modelBuilder.Entity<Invoice>()
                .Property(i => i.SubTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.Tax)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.Total)
                .HasPrecision(18, 2);

            // Configuración para InvoiceDetail
            modelBuilder.Entity<InvoiceDetail>()
                .Property(id => id.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<InvoiceDetail>()
                .Property(id => id.TotalPrice)
                .HasPrecision(18, 2);

            // Configuración para Product
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            // Índices para mejorar el rendimiento
            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.Email)
                .IsUnique();

            // *** CORREGIDO: Usa ProductCode en lugar de Code ***
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.ProductCode)
                .IsUnique();

            modelBuilder.Entity<Invoice>()
                .HasIndex(i => i.InvoiceDate);
        }
    }
}