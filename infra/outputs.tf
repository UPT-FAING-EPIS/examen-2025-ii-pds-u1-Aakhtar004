output "kubernetes_cluster_name" {
  value       = google_container_cluster.primary.name
  description = "Nombre del clúster de GKE"
}

output "kubernetes_cluster_host" {
  value       = "https://${google_container_cluster.primary.endpoint}"
  description = "Host del clúster de GKE"
  sensitive   = true
}

output "project_id" {
  value       = var.project_id
  description = "ID del proyecto de Google Cloud"
}

output "region" {
  value       = var.region
  description = "Región de Google Cloud donde se desplegaron los recursos"
}

output "db_instance_name" {
  value       = google_sql_database_instance.postgres.name
  description = "Nombre de la instancia de Cloud SQL"
}

output "db_connection_name" {
  value       = google_sql_database_instance.postgres.connection_name
  description = "Nombre de conexión de la instancia de Cloud SQL"
}

output "db_name" {
  value       = google_sql_database.appdb.name
  description = "Nombre de la base de datos"
}

output "cloudsql_proxy_sa_email" {
  value       = google_service_account.cloudsql_proxy.email
  description = "Email de la cuenta de servicio para Cloud SQL Auth Proxy"
}