using InvoiceManagementSystem.Core.Entities;

namespace InvoiceManagementSystem.Infrastructure.Data
{
    public static class SeedData
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            // Verificar si ya existen datos
            if (context.Customers.Any() || context.Products.Any())
            {
                return; // La BD ya tiene datos
            }

            // ========== CLIENTES ==========
            var customers = new Customer[]
            {
                new Customer
                {
                    FirstName = "Juan",
                    LastName = "Pérez",
                    Email = "juan.perez@email.com",
                    CreatedDate = DateTime.Now
                },
                new Customer
                {
                    FirstName = "María",
                    LastName = "Gómez",
                    Email = "maria.gomez@email.com",
                    CreatedDate = DateTime.Now
                },
                new Customer
                {
                    FirstName = "Carlos",
                    LastName = "López",
                    Email = "carlos.lopez@email.com",
                    CreatedDate = DateTime.Now
                },
                new Customer
                {
                    FirstName = "Ana",
                    LastName = "Martínez",
                    Email = "ana.martinez@email.com",
                    CreatedDate = DateTime.Now
                },
                new Customer
                {
                    FirstName = "Pedro",
                    LastName = "Rodríguez",
                    Email = "pedro.rodriguez@email.com",
                    CreatedDate = DateTime.Now
                },
                new Customer
                {
                    FirstName = "Laura",
                    LastName = "García",
                    Email = "laura.garcia@email.com",
                    CreatedDate = DateTime.Now
                }
            };

            context.Customers.AddRange(customers);
            context.SaveChanges();

            // ========== PRODUCTOS ==========
            var products = new Product[]
            {
                new Product
                {
                    ProductCode = "LAP-001",
                    ProductName = "Laptop Dell Inspiron 15",
                    Price = 1200.00m,
                    Stock = 10,
                    IsActive = true
                },
                new Product
                {
                    ProductCode = "LAP-002",
                    ProductName = "Laptop HP Pavilion",
                    Price = 950.00m,
                    Stock = 8,
                    IsActive = true
                },
                new Product
                {
                    ProductCode = "MON-001",
                    ProductName = "Monitor Samsung 24\"",
                    Price = 250.00m,
                    Stock = 15,
                    IsActive = true
                },
                new Product
                {
                    ProductCode = "MON-002",
                    ProductName = "Monitor LG 27\" UltraWide",
                    Price = 380.00m,
                    Stock = 12,
                    IsActive = true
                },
                new Product
                {
                    ProductCode = "TEC-001",
                    ProductName = "Teclado Mecánico RGB",
                    Price = 80.00m,
                    Stock = 20,
                    IsActive = true
                },
                new Product
                {
                    ProductCode = "TEC-002",
                    ProductName = "Teclado Logitech K380",
                    Price = 45.00m,
                    Stock = 25,
                    IsActive = true
                },
                new Product
                {
                    ProductCode = "MOU-001",
                    ProductName = "Mouse Inalámbrico Logitech",
                    Price = 35.00m,
                    Stock = 30,
                    IsActive = true
                },
                new Product
                {
                    ProductCode = "MOU-002",
                    ProductName = "Mouse Gamer Razer",
                    Price = 65.00m,
                    Stock = 18,
                    IsActive = true
                },
                new Product
                {
                    ProductCode = "HD-001",
                    ProductName = "Disco Duro Externo 1TB",
                    Price = 65.00m,
                    Stock = 22,
                    IsActive = true
                },
                new Product
                {
                    ProductCode = "SSD-001",
                    ProductName = "SSD Samsung 500GB",
                    Price = 85.00m,
                    Stock = 15,
                    IsActive = true
                },
                new Product
                {
                    ProductCode = "RAM-001",
                    ProductName = "Memoria RAM 8GB DDR4",
                    Price = 45.00m,
                    Stock = 40,
                    IsActive = true
                },
                new Product
                {
                    ProductCode = "AUD-001",
                    ProductName = "Audífonos Bluetooth Sony",
                    Price = 120.00m,
                    Stock = 14,
                    IsActive = true
                }
            };

            context.Products.AddRange(products);
            context.SaveChanges();
        }
    }
}