using InvoiceManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InvoiceManagementSystem
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllersWithViews();

            // DbContext
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            var app = builder.Build();

            // ========== INICIALIZAR DATOS DE PRUEBA ==========
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<ApplicationDbContext>();

                    // Asegurar que la base de datos esté creada
                    context.Database.EnsureCreated();

                    // Inicializar datos de prueba
                    SeedData.Initialize(context);

                    Console.WriteLine(" Base de datos inicializada correctamente");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($" Error al inicializar la base de datos: {ex.Message}");
                }
            }

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }
            else
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();
            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            Console.WriteLine(" Aplicación iniciada en: https://localhost:7037");
            Console.WriteLine(" Ir a crear factura: https://localhost:7037/Invoices/Create");

            app.Run();
        }
    }
}