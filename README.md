# Pewos — Agenda colaborativa para mascotas

Aplicación web responsive para la gestión colaborativa del cuidado de mascotas senior o con alguna enfermedad. Permite organizar medicaciones, alimentación, ejercicios, cuidados, controles veterinarios y recordatorios dentro de un grupo compartido, manteniendo la información centralizada y sincronizada entre sus integrantes.

Este repositorio contiene el frontend de Pewos, desarrollado con React, TypeScript y Tailwind CSS. Consume una API propia desarrollada con FastAPI y PostgreSQL.

> Proyecto personal en constante desarrollo.

## Arquitectura

Pewos utiliza una arquitectura desacoplada:

```text
Usuario
   ↓
React + TypeScript + Tailwind
   ↓
CloudFront
   ├── /        → S3 (Frontend)
   └── /api/*   → EC2 (FastAPI)
                    ↓
                 Docker
              ┌─────┴─────┐
              ↓           ↓
           FastAPI    PostgreSQL
              ↓
        S3 (imágenes)
```

El frontend y la API se exponen bajo el mismo dominio. CloudFront enruta las solicitudes de `/api/*` hacia el backend, mientras que la aplicación estática se sirve desde S3.

Las imágenes de las mascotas se almacenan en S3 mediante URLs prefirmadas generadas por la API.

## Multi-tenancy

Los datos no pertenecen directamente a una persona, sino a un **grupo** que representa, por ejemplo, una familia o un hogar.

Cada usuario puede pertenecer a varios grupos y trabaja sobre uno activo a la vez.

```text
Grupo
├── Integrantes
├── Mascotas
├── Alimentación
├── Medicaciones
├── Ejercicios
├── Cuidados
└── Controles veterinarios
```

### Roles

| Rol      | Permisos                                                      |
| -------- | ------------------------------------------------------------- |
| `owner`  | Control total, incluyendo integrantes, roles e invitaciones   |
| `member` | Crear, editar y eliminar información; completar recordatorios |
| `viewer` | Acceso de solo lectura                                        |

Los integrantes pueden ser incorporados mediante códigos de invitación configurados con un rol y fecha de expiración.

La zona horaria pertenece al grupo y no al usuario individual. Esto permite que los horarios de cuidado se interpreten según la ubicación física donde se encuentra la mascota.

## Funcionalidades

- Perfiles de mascotas con fotografía.
- Gestión de medicaciones y recordatorios.
- Horarios de alimentación configurables y reordenables.
- Rutinas de ejercicio.
- Cuidados y seguimiento postoperatorio.
- Calendario de citas y eventos recurrentes.
- Directorio de veterinarios.
- Registro de cumplimiento de recordatorios con atribución al integrante que realizó la acción.
- Gestión colaborativa entre integrantes de un mismo grupo.
- Cambio entre múltiples grupos asociados a un usuario.

## Tecnologías

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- TanStack Query v5
- Lucide React

### Gestión de estado

La información proveniente de la API se administra mediante TanStack Query. No se utiliza una librería global de estado adicional para los datos del servidor.

`AuthContext` mantiene únicamente información relacionada con:

- Sesión.
- Usuario autenticado.
- Grupo activo.
- Rol.
- Permisos de escritura.

Todas las claves de consulta incluyen el grupo activo para evitar que los datos de un grupo permanezcan visibles al cambiar a otro.

## Despliegue

El frontend se despliega automáticamente mediante GitHub Actions.

```text
GitHub Actions
      ↓
OIDC
      ↓
S3
      ↓
Invalidación CloudFront
```

Se utiliza autenticación OIDC con AWS, evitando almacenar credenciales de acceso estáticas en GitHub.

## Backend

La API está desarrollada con:

- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Docker
- Amazon S3
- Amazon ECR
- Amazon EC2

El backend se despliega mediante GitHub Actions utilizando OIDC, ECR y AWS Systems Manager. La imagen Docker de la API se construye en el pipeline, se publica en ECR y posteriormente se actualiza en EC2.
