## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| <a name="provider_google"></a> [google](#provider\_google) | 7.3.0 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [google_compute_network.vpc](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_network) | resource |
| [google_compute_subnetwork.subnet](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_subnetwork) | resource |
| [google_container_cluster.primary](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/container_cluster) | resource |
| [google_container_node_pool.primary_nodes](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/container_node_pool) | resource |
| [google_project_iam_binding.cloudsql_client](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_iam_binding) | resource |
| [google_service_account.cloudsql_proxy](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/service_account) | resource |
| [google_service_account_iam_binding.workload_identity_binding](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/service_account_iam_binding) | resource |
| [google_sql_database.appdb](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database) | resource |
| [google_sql_database_instance.postgres](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database_instance) | resource |
| [google_sql_user.db_user](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_user) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_db_password"></a> [db\_password](#input\_db\_password) | Contraseña para el usuario de la base de datos | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | Entorno de despliegue (dev, staging, prod) | `string` | `"dev"` | no |
| <a name="input_gke_num_nodes"></a> [gke\_num\_nodes](#input\_gke\_num\_nodes) | Número de nodos en el clúster de GKE | `number` | `3` | no |
| <a name="input_project_id"></a> [project\_id](#input\_project\_id) | ID del proyecto de Google Cloud | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | Región de Google Cloud donde se desplegarán los recursos | `string` | `"us-central1"` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_cloudsql_proxy_sa_email"></a> [cloudsql\_proxy\_sa\_email](#output\_cloudsql\_proxy\_sa\_email) | Email de la cuenta de servicio para Cloud SQL Auth Proxy |
| <a name="output_db_connection_name"></a> [db\_connection\_name](#output\_db\_connection\_name) | Nombre de conexión de la instancia de Cloud SQL |
| <a name="output_db_instance_name"></a> [db\_instance\_name](#output\_db\_instance\_name) | Nombre de la instancia de Cloud SQL |
| <a name="output_db_name"></a> [db\_name](#output\_db\_name) | Nombre de la base de datos |
| <a name="output_kubernetes_cluster_host"></a> [kubernetes\_cluster\_host](#output\_kubernetes\_cluster\_host) | Host del clúster de GKE |
| <a name="output_kubernetes_cluster_name"></a> [kubernetes\_cluster\_name](#output\_kubernetes\_cluster\_name) | Nombre del clúster de GKE |
| <a name="output_project_id"></a> [project\_id](#output\_project\_id) | ID del proyecto de Google Cloud |
| <a name="output_region"></a> [region](#output\_region) | Región de Google Cloud donde se desplegaron los recursos |
