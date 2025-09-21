# Proyecto: Aplicación de Gestión de Proyectos y Actividades

## Objetivo
Desarrollar una plataforma web para la gestión integral de proyectos y actividades, permitiendo a los equipos planificar, asignar tareas, hacer seguimiento y reportar avances de manera colaborativa.

## Arquitectura del Sistema

### Frontend (React)
- **Descripción**: Aplicación web desarrollada con React, empaquetada en un contenedor Docker y servida con NGINX.
- **Despliegue**:
  - Se implementa en Google Kubernetes Engine (GKE) como un Deployment y Service.
  - Exposición del puerto 80 (HTTP) hacia un Load Balancer, haciendo que el frontend sea accesible directamente desde el navegador.
- **Conexión**:
  - Se comunica con el backend a través del Ingress de Kubernetes (rutas `/api/...`).

### Backend (.NET Core API)
- **Descripción**: API RESTful desarrollada con .NET Core, empaquetada en un contenedor Docker.
- **Despliegue**:
  - Igual que el frontend, se implementa en GKE como Deployment y Service.
  - El Service usa tipo `ClusterIP` para exponerlo únicamente dentro del clúster Kubernetes.
- **Conexión**:
  - Recibe peticiones del frontend a través del Ingress de Kubernetes.
  - Se conecta a la base de datos PostgreSQL en Cloud SQL usando el `Cloud SQL Auth Proxy`, que se ejecuta como un contenedor sidecar dentro del pod del backend.

### Base de Datos (PostgreSQL)
- **Descripción**: Base de datos relacional, utilizada para almacenar los datos transaccionales de la aplicación.
- **Despliegue**:
  - Se utiliza como servicio administrado en Google Cloud SQL.
  - Cloud SQL se encarga de parches, backups, alta disponibilidad y más.
- **Conexión**:
  - El backend se conecta a la base de datos mediante el `Cloud SQL Auth Proxy`.

### Flujo General del Sistema
1. **Usuarios** acceden al frontend desde sus navegadores, a través del Load Balancer de GKE.
2. El **frontend** hace peticiones al backend para interactuar con los datos.
3. El **backend** procesa las peticiones y se conecta a la base de datos en Cloud SQL para realizar operaciones transaccionales.

---

## Funcionalidades Principales
- **Gestión de Proyectos**:
  - Creación y edición de proyectos con descripción, fechas y responsables.
  - Un usuario puede agregar a otros miembros a un proyecto.
  - El creador del proyecto puede gestionar a los miembros, incluyendo eliminarlos del proyecto.
- **Gestión de Tareas/Actividades**:
  - Creación y asignación de tareas/actividades a miembros del equipo.
  - Seguimiento del estado de cada actividad (pendiente, en progreso, completada, bloqueada).
- **Panel de Usuario**:
  - Visualización de tareas asignadas y progreso personal.
  - Acceso a los proyectos en los que el usuario participa.

---

## Implementación Técnica

### Backend (API)
- **Framework**: .NET Core.
- **Endpoints RESTful**:
  - **Autenticación (Auth)**:
    - `POST /api/auth/register` — Registro de usuario.
    - `POST /api/auth/login` — Inicio de sesión.
  - **Proyectos (Projects)**:
    - `POST /api/projects` — Crear proyecto.
    - `GET /api/projects` — Listar proyectos.
    - `GET /api/projects/{id}` — Detalle de proyecto.
    - `PUT /api/projects/{id}` — Editar proyecto.
    - `DELETE /api/projects/{id}` — Eliminar proyecto.
    - `GET /api/projects/{id}/members` — Listar miembros de un proyecto.
    - `POST /api/projects/{id}/members` — Agregar miembros a un proyecto.
    - `DELETE /api/projects/{id}/members/{userId}` — Eliminar miembros de un proyecto.
  - **Tareas (Tasks)**:
    - `POST /api/projects/{projectId}/tasks` — Crear tarea.
    - `GET /api/projects/{projectId}/tasks` — Listar tareas de un proyecto.
    - `GET /api/projects/{projectId}/tasks/{id}` — Detalle de tarea.
    - `PUT /api/projects/{projectId}/tasks/{id}` — Actualizar tarea.
    - `DELETE /api/projects/{projectId}/tasks/{id}` — Eliminar tarea.
    - `PUT /api/projects/{projectId}/tasks/{id}/status` — Actualizar estado de tarea.
    - `PUT /api/projects/{projectId}/tasks/{id}/assign` — Asignar tarea a un miembro.
    - `GET /api/projects/{projectId}/tasks/{id}/comments` — Listar comentarios de una tarea.
    - `POST /api/projects/{projectId}/tasks/{id}/comments` — Agregar comentario a una tarea.
    - `GET /api/tasks/assigned` — Listar tareas asignadas al usuario actual.
- **Base de datos**: PostgreSQL en Google Cloud SQL.
- **Autenticación**: JWT con soporte para roles de usuario.
- **Pruebas**: Unitarias y de integración.

### Frontend
- **Framework**: React con Material UI.
- **Funcionalidades implementadas**:
  - **Autenticación**:
    - Registro de usuarios.
    - Inicio de sesión.
    - Gestión de sesión con JWT.
  - **Gestión de Proyectos**:
    - Listado de proyectos.
    - Creación y edición de proyectos.
    - Eliminación de proyectos.
    - Gestión de miembros (agregar/eliminar).
  - **Gestión de Tareas**:
    - Listado de tareas por proyecto.
    - Creación y edición de tareas.
    - Asignación de tareas a miembros.
    - Actualización de estado de tareas.
    - Sistema de comentarios en tareas.
  - **Panel de Usuario**:
    - Visualización de tareas asignadas.
    - Seguimiento de progreso personal.
    - Estadísticas de tareas completadas/pendientes.
  - **Diseño Responsive**:
    - Interfaz adaptable a dispositivos móviles y de escritorio.
    - Componentes reutilizables para mantener consistencia visual.

## Guía de Despliegue

### Requisitos Previos
- Docker y Docker Compose
- Kubernetes (para despliegue en producción)
- Node.js y npm (para desarrollo local)
- .NET Core SDK (para desarrollo local)

### Despliegue Local

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd <nombre-del-repositorio>
   ```

2. **Configurar variables de entorno**:
   - Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
     ```
     # Backend
     CONNECTION_STRING=<cadena-de-conexión-a-base-de-datos>
     JWT_SECRET=<clave-secreta-para-jwt>
     
     # Frontend
     REACT_APP_API_URL=http://localhost:5000/api
     ```

3. **Iniciar la aplicación con Docker Compose**:
   ```bash
   docker-compose up -d
   ```
   Esto iniciará tanto el backend como el frontend en contenedores Docker.

4. **Acceder a la aplicación**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Desarrollo Local

1. **Backend (.NET Core)**:
   ```bash
   cd backend
   dotnet restore
   dotnet run
   ```
   El backend estará disponible en http://localhost:5000

2. **Frontend (React)**:
   ```bash
   cd frontend
   npm install
   npm start
   ```
   El frontend estará disponible en http://localhost:3000

### Despliegue en Kubernetes (Producción)

1. **Construir y publicar imágenes Docker**:
   ```bash
   # Backend
   docker build -t <registry>/project-management-backend:latest ./backend
   docker push <registry>/project-management-backend:latest
   
   # Frontend
   docker build -t <registry>/project-management-frontend:latest ./frontend
   docker push <registry>/project-management-frontend:latest
   ```

2. **Aplicar configuraciones de Kubernetes**:
   ```bash
   kubectl apply -f k8s/
   ```

3. **Verificar el despliegue**:
   ```bash
   kubectl get pods
   kubectl get services
   kubectl get ingress
   ```

## Guía de Uso

### Autenticación
1. **Registro**: Crear una cuenta con nombre de usuario, correo y contraseña.
2. **Inicio de sesión**: Acceder con credenciales registradas.

### Gestión de Proyectos
1. **Crear proyecto**: Desde el panel principal, hacer clic en "Nuevo Proyecto".
2. **Ver proyectos**: La página principal muestra todos los proyectos del usuario.
3. **Editar proyecto**: Desde la vista de detalle, hacer clic en "Editar".
4. **Gestionar miembros**: En la vista de detalle, ir a la pestaña "Miembros".

### Gestión de Tareas
1. **Ver tareas**: Acceder a un proyecto y seleccionar la pestaña "Tareas".
2. **Crear tarea**: Hacer clic en "Nueva Tarea" dentro de un proyecto.
3. **Asignar tarea**: En la vista de detalle de tarea, usar la opción "Asignar".
4. **Cambiar estado**: En la vista de detalle, seleccionar el nuevo estado.
5. **Comentar**: Añadir comentarios en la sección correspondiente de cada tarea.

---

## Base de Datos: Esquema Completo

El esquema de base de datos para implementar todas las funcionalidades descritas es el siguiente:

### Tabla `users` (Usuarios)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `projects` (Proyectos)
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INT REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `project_members` (Miembros de Proyectos)
```sql
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `tasks` (Tareas/Actividades)
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `comments` (Comentarios de Tareas)
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Infraestructura y Despliegue

### Infraestructura como Código
- **Herramienta**: Terraform.
- **Archivos**:
  - `main.tf`: Define los recursos de infraestructura, como el clúster de GKE, las redes y las configuraciones necesarias.
  - `variables.tf`: Contiene las variables necesarias para parametrizar el despliegue de la infraestructura.
- **Automatización**:
  - Crear la infraestructura con un archivo `infra.yml` en GitHub Actions.

### CI/CD
- **Workflows en GitHub Actions**:
  1. **Infraestructura (`infra.yml`)**: Automatización para desplegar la infraestructura en GKE y Cloud SQL.
  2. **Diagrama de Infraestructura (`infra_diagram.yml`)**: Generación automática del diagrama de infraestructura.
  3. **Diagrama de Clases (`class_diagram.yml`)**: Generación automática del diagrama UML de clases.
  4. **Documentación (`publish_doc.yml`)**: Publicación automática de la documentación del código en GitHub Pages.
  5. **Escaneo de Código (`sonar.yml`)**:
     - Análisis con SonarQube para garantizar 0 bugs, 0 vulnerabilidades, 0 hotspots, 90% de cobertura, y máximo 10 líneas de código duplicado.
  6. **Despliegue de Aplicación (`deploy_app.yml`)**:
     - Automatización para desplegar el frontend y backend en GKE.
  7. **Creación de Release (`release.yml`)**:
     - Generación de un release automático en GitHub.

---

## Estructura Final del Proyecto

```plaintext
proyecto-gestion-actividades/
├── backend/                    # Código fuente del backend (.NET Core API)
│   ├── Dockerfile              # Dockerfile para el backend
│   └── src/                    # Código fuente de la API
├── frontend/                   # Código fuente del frontend (React)
│   ├── Dockerfile              # Dockerfile para el frontend
│   └── src/                    # Código fuente de la aplicación React
├── infra/                      # Configuración de infraestructura con Terraform
│   ├── main.tf                 # Define los recursos de infraestructura
│   ├── variables.tf            # Define variables para parametrización
│   └── outputs.tf              # Define los valores de salida de Terraform
├── .github/workflows/          # Workflows de GitHub Actions
│   ├── infra.yml               # Automatización para infraestructura
│   ├── infra_diagram.yml       # Workflow para diagrama de infraestructura
│   ├── class_diagram.yml       # Workflow para diagrama de clases
│   ├── publish_doc.yml         # Workflow para documentación en GitHub Pages
│   ├── sonar.yml               # Escaneo de código con SonarQube
│   ├── deploy_app.yml          # Despliegue del frontend y backend
│   ├── release.yml             # Creación de releases
├── README.md                   # Documentación del proyecto
└── LICENSE                     # Licencia del proyecto
```

---

¡Gracias por contribuir al desarrollo de este proyecto! Si tienes preguntas o sugerencias, no dudes en abrir un issue.