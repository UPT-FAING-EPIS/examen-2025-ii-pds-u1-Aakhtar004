using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagementApi.Data;
using ProjectManagementApi.DTOs;
using System;
using System.Threading.Tasks;

namespace ProjectManagementApi.Controllers
{
    [ApiController]
[Route("api/health")]
    public class HealthController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<HealthController> _logger;

        public HealthController(ApplicationDbContext dbContext, ILogger<HealthController> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        /// <summary>
        /// Endpoint para verificar el estado de salud de la aplicación
        /// </summary>
        /// <returns>Estado de salud de la aplicación y sus componentes</returns>
        [HttpGet]
        [ProducesResponseType(typeof(HealthCheckResponse), 200)]
        public async Task<IActionResult> Get()
        {
            var response = new HealthCheckResponse
            {
                Status = "ok",
                Timestamp = DateTime.UtcNow,
                Components = new()
            };

            // Verificar conexión a la base de datos
            try
            {
                var canConnect = await _dbContext.Database.CanConnectAsync();
                response.Components.Add("database", new HealthCheckComponentStatus
                {
                    Status = canConnect ? "ok" : "fail",
                    Message = canConnect ? "Conexión exitosa" : "No se pudo conectar a la base de datos"
                });

                if (!canConnect)
                {
                    response.Status = "fail";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar la conexión a la base de datos");
                response.Components.Add("database", new HealthCheckComponentStatus
                {
                    Status = "fail",
                    Message = "Error al verificar la conexión: " + ex.Message
                });
                response.Status = "fail";
            }

            return Ok(response);
        }
    }
}