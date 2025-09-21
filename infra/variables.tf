variable "project_id" {
  description = "ID del proyecto de Google Cloud"
  type        = string
}

variable "region" {
  description = "Región de Google Cloud donde se desplegarán los recursos"
  type        = string
  default     = "us-central1"
}

variable "gke_num_nodes" {
  description = "Número de nodos en el clúster de GKE"
  type        = number
  default     = 3
}

variable "db_password" {
  description = "Contraseña para el usuario de la base de datos"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Entorno de despliegue (dev, staging, prod)"
  type        = string
  default     = "dev"
}
