using System;
using System.Collections.Generic;

namespace ProjectManagementApi.DTOs
{
    public class HealthCheckResponse
    {
        public string Status { get; set; } = "ok";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public Dictionary<string, HealthCheckComponentStatus> Components { get; set; } = new Dictionary<string, HealthCheckComponentStatus>();
    }

    public class HealthCheckComponentStatus
    {
        public string Status { get; set; }
        public string Message { get; set; }
    }
}