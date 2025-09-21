# Secrets necesarios para GitHub Actions

Para el correcto funcionamiento de los workflows de CI/CD, se deben configurar los siguientes secrets en GitHub:

## Secrets para Google Cloud Platform

- `GCP_PROJECT_ID`: ID del proyecto en Google Cloud
- `GCP_SA_KEY`: Clave de cuenta de servicio de Google Cloud en formato JSON (codificada en base64)
- `GCP_REGION`: Región de Google Cloud donde se despliega la infraestructura

## Secrets para la Base de Datos

- `DB_PASSWORD`: Contraseña para la base de datos PostgreSQL

## Secrets para la Aplicación

- `JWT_KEY`: Clave secreta para la generación y validación de tokens JWT (mínimo 32 caracteres)

## Secrets para SonarQube

- `SONAR_TOKEN`: Token de autenticación para SonarQube
- `SONAR_HOST_URL`: URL del servidor SonarQube

## Instrucciones para configurar los secrets

1. En el repositorio de GitHub, ir a "Settings" > "Secrets and variables" > "Actions"
2. Hacer clic en "New repository secret"
3. Agregar cada uno de los secrets mencionados anteriormente con sus respectivos valores
4. Asegurarse de que los nombres de los secrets coincidan exactamente con los utilizados en los workflows

## Notas importantes

- La clave de cuenta de servicio de Google Cloud debe tener los permisos necesarios para:
  - Administrar recursos de GKE
  - Administrar recursos de Cloud SQL
  - Administrar recursos de Artifact Registry
  - Desplegar aplicaciones en GKE

- Para obtener la clave de cuenta de servicio en formato base64:
  ```bash
  cat service-account-key.json | base64
  ```