# Pewos — Agenda para Mascotas

Aplicación web responsive para gestionar la agenda de tus mascotas: medicaciones,
ejercicios, cuidados post-operatorios, horarios de comida, citas veterinarias y calendario.

Es el frontend de [`pewos-api`](../pewos-api) (FastAPI + PostgreSQL), que se encarga de la
autenticación y los datos.

> Proyecto personal en desarrollo. Necesita `pewos-api` corriendo para funcionar.

## Grupos, integrantes y roles

Los datos no pertenecen a una persona sino a un **grupo** (una casa, una familia). Cada usuario
puede pertenecer a varios grupos y trabaja sobre uno activo a la vez; el selector aparece en
Ajustes cuando hay más de uno.

| Rol | Puede |
|---|---|
| `owner` | Todo, más administrar integrantes, roles e invitaciones |
| `member` | Crear, editar y borrar; marcar recordatorios como hechos |
| `viewer` | Solo lectura |

Para sumar a alguien, el `owner` genera un **código de invitación** desde "Mi grupo" (con rol y
expiración) y la otra persona lo canjea desde esa misma pantalla. No hace falta correo.

La **zona horaria es del grupo**, no de cada integrante: la mascota está físicamente en una casa
y esa casa tiene un solo huso. Un medicamento de las 08:00 se da a las 08:00 de esa casa, viva
donde viva quien mira la app.

## Funcionalidades

- Mascotas con perfil y foto (subida directa a S3 con URL prefirmada)
- Calendario de citas con recurrencias (diaria, semanal, quincenal, mensual)
- Medicamentos por frecuencia horaria o asociados a horarios de comida
- Rutinas de ejercicio y cuidados post-operatorios (con días de la semana)
- Horarios de comida configurables y reordenables, por grupo
- Directorio de veterinarios
- Marcado de recordatorios con atribución ("lo marcó Ana")

## Tecnologías

- React 19 + TypeScript
- TanStack Query v5 (estado de servidor) + un `AuthContext` delgado
- Vite 7 + Tailwind CSS 4
- Lucide React (iconos)

No hay librería de estado global: todo lo que viene del servidor vive en la caché de TanStack
Query, y **toda clave de consulta incluye el grupo activo**, de modo que cambiar de grupo no
deja datos del anterior en pantalla.

## Configuración local

1. Levantar la API:

```bash
cd ../pewos-api
docker compose up -d
```

2. Copiar `.env.example` a `.env` y ajustar si hace falta:

```bash
cp .env.example .env
```

`VITE_API_URL=/api` es lo normal: en desarrollo el dev server de Vite hace proxy de `/api` a
`http://localhost:8000`, y en producción CloudFront enruta `/api/*` al origen EC2. En ambos
casos el frontend y la API comparten dominio, así que las cookies de sesión son same-origin y no
hay CORS.

3. Instalar dependencias y arrancar:

```bash
npm install
npm run dev
```

## Verificación

```bash
npm run build   # tsc -b + vite build
npm run lint
```

## Estructura del Proyecto

```
pewos-react-pwa/
├── public/assets/
├── src/
│   ├── api/
│   │   ├── client.ts        # fetch con cookies + refresh single-flight ante 401
│   │   └── index.ts         # un módulo tipado por recurso
│   ├── components/
│   │   ├── AppLayout.tsx    # tabs, subpantallas y gating del botón "+"
│   │   ├── Header.tsx
│   │   ├── TabBar.tsx
│   │   ├── calendar/
│   │   └── home/
│   ├── constants/
│   │   └── labels.ts        # etiquetas y colores de presentación
│   ├── context/
│   │   └── AuthContext.tsx  # sesión, grupo activo, rol, canWrite
│   ├── hooks/
│   │   └── queries.ts       # useQuery/useMutation por recurso
│   ├── pages/
│   ├── types/index.ts       # espejo de los schemas de pewos-api
│   ├── utils/
│   │   ├── date.ts          # fechas ISO sin el corrimiento de UTC
│   │   └── schedule.ts      # reparto de horarios en el día
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts
└── package.json
```

### Convenciones de fecha y hora

La API habla ISO: las fechas son `"YYYY-MM-DD"` y las horas `"HH:MM:SS"`. Dos reglas para no
repetir bugs viejos:

- Nunca `new Date("2026-08-21")` — eso es medianoche **UTC** y en GMT-X muestra el día anterior.
  Usar `parseLocalDate` de `utils/date.ts`, o comparar las cadenas directamente, que ordenan
  bien por ser ISO.
- Para mostrar horas, `shortTime()` recorta los segundos.
