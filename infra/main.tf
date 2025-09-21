provider "google" {
  project = var.project_id
  region  = var.region
}

# Red VPC para el clúster
resource "google_compute_network" "vpc" {
  name                    = "gke-network"
  auto_create_subnetworks = false
  
  lifecycle {
    # Prevenir la destrucción de este recurso
    prevent_destroy = true
    # Ignorar cambios en estos atributos
    ignore_changes = all
  }
}

# Subred para el clúster GKE
resource "google_compute_subnetwork" "subnet" {
  name          = "gke-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
  
  lifecycle {
    prevent_destroy = true
    ignore_changes = all
  }
}

# Cluster GKE
resource "google_container_cluster" "primary" {
  name     = "project-management-cluster"
  location = var.region
  
  # Eliminamos el node_count inicial y usamos node_pools
  remove_default_node_pool = true
  initial_node_count       = 1
  
  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name
  
  # Configuración de red privada
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }
  
  # Configuración de IP masquerade
  ip_allocation_policy {
    cluster_ipv4_cidr_block  = "10.1.0.0/16"
    services_ipv4_cidr_block = "10.2.0.0/16"
  }
  
  # Habilitamos Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
  
  lifecycle {
    prevent_destroy = true
    ignore_changes = all
  }
}

# Node Pool para el clúster
resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = var.gke_num_nodes

  node_config {
    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      env = var.project_id
    }

    machine_type = "e2-standard-2"
    disk_size_gb = 50 # Reducido a 50 GB para cumplir con la cuota regional
    disk_type    = "pd-standard"
    
    # Habilitamos Workload Identity a nivel de nodo
    workload_metadata_config {
      mode = "GKE_METADATA"
    }
  }
}

# Instancia PostgreSQL en Cloud SQL
resource "google_sql_database_instance" "postgres" {
  name             = "project-management-db"
  database_version = "POSTGRES_14"
  region           = var.region
  deletion_protection = false  # Para entornos de desarrollo, en producción debería ser true

  settings {
    tier = "db-custom-1-3840"
    
    backup_configuration {
      enabled            = true
      binary_log_enabled = false
      start_time         = "02:00"
      location           = "us"
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
    
    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }
  }
  
  lifecycle {
    prevent_destroy = true
    ignore_changes = all
  }
}

# Base de datos dentro de la instancia
resource "google_sql_database" "appdb" {
  name     = "project_management_db"
  instance = google_sql_database_instance.postgres.name
}

# Usuario para la base de datos
resource "google_sql_user" "db_user" {
  name     = "app_user"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Service Account para Cloud SQL Auth Proxy
resource "google_service_account" "cloudsql_proxy" {
  account_id   = "cloudsql-proxy"
  display_name = "Cloud SQL Auth Proxy Service Account"
  
  lifecycle {
    # Prevenir la destrucción de este recurso
    prevent_destroy = true
    # Ignorar cambios en estos atributos
    ignore_changes = all
  }
}

# Asignación de rol para Cloud SQL Auth Proxy
resource "google_project_iam_binding" "cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  
  members = [
    "serviceAccount:${google_service_account.cloudsql_proxy.email}",
  ]
}

# Configuración de Workload Identity para Cloud SQL Auth Proxy
resource "google_service_account_iam_binding" "workload_identity_binding" {
  service_account_id = google_service_account.cloudsql_proxy.name
  role               = "roles/iam.workloadIdentityUser"
  
  members = [
    "serviceAccount:${var.project_id}.svc.id.goog[default/cloudsql-proxy]",
  ]
}