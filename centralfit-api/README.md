
# 🏋️ CentralFit API

Backend RESTful para la plataforma de gestión de gimnasios **CentralFit**. Diseñado como un SaaS multi-tenant (multi-gimnasio), permite a cada establecimiento gestionar sus miembros, planes, pagos, asistencias y reportes financieros de forma aislada y segura.

Originalmente diseñado para el mercado venezolano, soporta manejo dual de divisas (USD/Bs), cálculo automático de tasas de cambio (BCV/Euro) y pagos divididos en una misma transacción.

## ✨ Características Principales

- **Arquitectura Multi-Tenant:** Aislamiento estricto de datos por `gymId` mediante JWT. Cada petición se filtra automáticamente por el gimnasio al que pertenece el usuario.
- **Doble Moneda y Pagos Divididos:** Soporte para cobros en USD (Efectivo, Zelle, Binance) y Bs (Pago Móvil), permitiendo mezclar múltiples métodos de pago en una sola transacción para cuadrar exactamente con el precio del plan.
- **Precios Paralelos:** Capacidad de fijar un precio en USD para pagos en divisas (`priceUsd`) y un precio paralelo (`priceUsdBs`) para calcular los pagos en Bolívares, protegiendo al gimnasio de la devaluación.
- **Cálculo de Tasas Automático:** Integración con la API del BCV para obtener la tasa actual (USD y EUR), con un sistema de cacheo en base de datos cada 6 horas.
- **Estados de Membresía Dinámicos:** Los estados (Activo, Por Vencer, En Gracia, Vencido) no se guardan en base de datos, se calculan al vuelo basados en la fecha de vencimiento y los días de gracia configurables por cada gimnasio.
- **Control de Asistencia:** Módulo para registrar entradas por cédula (simulando un lector de huella/QR) con validación anti-doble registro.
- **Seguridad:** Rate limiting en rutas de autenticación, CORS estricto y doble esquema de JWT (Usuarios vs Super Admin).

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| --- | --- |
| **Runtime** | Node.js |
| **Framework** | Express 5 |
| **Lenguaje** | TypeScript |
| **Base de Datos** | PostgreSQL (Supabase) |
| **ORM** | Prisma 7 (con Driver Adapter `@prisma/adapter-pg`) |
| **Autenticación** | JWT (`jsonwebtoken`) + `bcryptjs` |
| **Seguridad** | `cors`, `express-rate-limit` |

## 🚀 Inicio Rápido

### 1. Prerrequisitos
- Node.js (recomendado v18+)
- Una instancia de PostgreSQL (local o en la nube como Supabase)

### 2. Instalación
Clona el repositorio e instala las dependencias:

```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (`centralfit-api/.env`) con las siguientes variables:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@host:puerto/nombre_db?sslmode=require"

# Autenticación (Usa secretos largos y aleatorios en producción)
JWT_SECRET="tu_secreto_largo_random_para_usuarios"
SUPER_ADMIN_JWT_SECRET="tu_otro_secreto_largo_random_para_admin"

# Configuración del servidor
NODE_ENV=development
PORT=3000

# CORS (URL de tu frontend en producción)
FRONTEND_URL=http://localhost:5173

# Credenciales para el script de inicialización del Super Admin
SUPER_ADMIN_EMAIL=admin@centralfit.com
SUPER_ADMIN_PASSWORD=TuContraseñaSegura123
```

### 4. Base de Datos (Prisma)
Genera el cliente de Prisma y aplica las migraciones:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Inicialización de Datos (Seed)
Crea el super administrador principal leyendo las variables de entorno:

```bash
npx tsx prisma/seed-admin.ts
```

### 6. Ejecutar el Servidor

**Modo Desarrollo (con recarga automática):**
```bash
npm run dev
```

**Modo Producción:**
```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```text
centralfit-api/
├── prisma/
│   ├── schema.prisma     # Definición de la base de datos
│   ├── seed.ts           # Creación de Gym y User de prueba
│   └── seed-admin.ts     # Creación del SuperAdmin
├── src/
│   ├── index.ts          # Punto de entrada, config de Express, CORS y Rate Limit
│   ├── prisma.ts         # Instancia singleton de PrismaClient
│   ├── lib/
│   │   └── exchangeRate.ts # Helper para obtener/cachear tasa BCV/EUR
│   ├── middleware/
│   │   ├── auth.ts             # Middleware de usuarios de gimnasio
│   │   └── superAdminAuth.ts   # Middleware de Super Admin
│   └── routes/
│       ├── auth.ts        # Login, registro y perfil
│       ├── admin.ts       # Panel global de Super Admin
│       ├── members.ts     # Miembros, suscripciones y renovaciones
│       ├── plans.ts       # Planes y precios paralelos
│       ├── reports.ts     # Métricas y transacciones
│       ├── attendance.ts  # Control de asistencia (Huella/QR)
│       ├── settings.ts    # Configuración del gimnasio (Días de gracia, Tasa)
│       └── exchangeRate.ts# Endpoint de tasa de cambio
├── .env
├── package.json
└── tsconfig.json
```

## 🗄️ Esquema de Base de Datos (Resumen)

El sistema cuenta con las siguientes entidades principales:

- **Gym:** Establecimiento principal. Aísla todos los datos.
- **User:** Recepcionistas/Owners de un gimnasio.
- **Member:** Clientes del gimnasio. Incluye campos opcionales para seguimiento físico (`initialWeight`, `currentWeight`) y cumpleaños (`birthDate`).
- **Plan:** Membresías. Tienen `priceUsd` y `priceUsdBs` (precio paralelo para cálculos en Bs).
- **Subscription:** Vigencia de un plan para un miembro.
- **Transaction:** Pagos individuales (guarda la tasa usada históricamente para reconstruir reportes).
- **Attendance:** Registro de entradas al gimnasio.
- **GymSettings:** Configuración particular de cada gimnasio (`graceDays`, `rateType`).

## 📡 Documentación de Endpoints

> **Nota de Seguridad:** Todas las rutas (excepto `/auth/login`, `/auth/register` y `/admin/login`) requieren el header `Authorization: Bearer <token>`.

### Autenticación y Perfil (`/auth`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/auth/register` | Registra un nuevo gimnasio y su dueño (status: `trial`). |
| `POST` | `/auth/login` | Inicia sesión. Bloquea si el gimnasio está suspendido. |
| `GET` | `/auth/me` | Obtiene el perfil y datos del gimnasio. |
| `PATCH` | `/auth/me` | Actualiza foto, nombre y teléfono del usuario. |
| `PATCH` | `/auth/password` | Cambia la contraseña. |

### Administración Global (`/admin`)
*Requiere token de Super Admin.*
| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/admin/login` | Inicia sesión del Super Admin. |
| `GET` | `/admin/gyms` | Lista todos los gimnasios con conteo de miembros. |
| `PATCH` | `/admin/gyms/:id/status` | Cambia estado del gimnasio (active, suspended, trial). |
| `GET` | `/admin/stats` | Estadísticas globales de la plataforma. |

### Miembros y Cobros (`/members`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/members` | Lista miembros con su estado calculado al vuelo. |
| `POST` | `/members` | Crea miembro (y opcionalmente su primer pago). |
| `GET` | `/members/search` | Buscador para el modal de renovación. |
| `POST` | `/members/:id/renew` | Renueva plan. Acepta array de `payments` para pagos divididos. |
| `PATCH` | `/members/:id` | Edita datos del miembro (incluye pesos y cumpleaños). |
| `DELETE` | `/members/:id` | Elimina miembro y su historial en cascada. |

**Ejemplo de body para `POST /members/:id/renew` (Pago Dividido):**
```json
{
  "planId": "uuid-del-plan",
  "startDate": "2024-08-15",
  "payments": [
    { "method": "Efectivo", "amount": 10 },
    { "method": "Pago Móvil", "amount": 5000, "reference": "123456" }
  ]
}
```
*Los métodos `Efectivo`, `Zelle` y `Binance` se asumen en USD. `Pago Móvil` se asume en Bs. El backend valida que el equivalente total en USD cuadre con el precio del plan con una tolerancia de $0.001.*

### Asistencia (`/attendance`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/attendance` | Registra entrada por cédula. Previene doble registro en menos de 1 min. |
| `GET` | `/attendance` | Lista asistencias del día. Acepta query `?date=YYYY-MM-DD` para historial. |

### Planes (`/plans`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/plans` | Lista planes con estimación en Bs y conteo de activos. |
| `POST` | `/plans` | Crea plan (acepta `priceUsd` y `priceUsdBs` opcional). |
| `PATCH` | `/plans/:id` | Edita un plan. |
| `DELETE` | `/plans/:id` | Elimina plan (bloqueado si tiene historial, devuelve 409). |

### Reportes (`/reports`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/reports/summary` | Tarjetas de resumen. Acepta filtros `?range=today|week|month|year` o `?startDate=&endDate=`. |
| `GET` | `/reports/transactions` | Listado filtrable para tablas y exportación CSV. |
| `GET` | `/reports/monthly` | Datos para el gráfico de ingresos mensuales (reconstruye Bs a USD con tasa histórica). |

### Configuración y Tasas (`/settings`, `/exchange-rate`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/settings` | Obtiene configuración (crea con defaults si no existe). |
| `PATCH` | `/settings` | Actualiza `graceDays` (0-30) y `rateType` (`BCV` o `Euro`). |
| `GET` | `/exchange-rate` | Devuelve tasas actuales cacheadas. |

## 🔒 Seguridad y Middleware

- **CORS:** Configurado para permitir cualquier origen en desarrollo local, pero en producción (`NODE_ENV=production`) restringe estrictamente a `FRONTEND_URL` y localhost.
- **Rate Limiting:** Las rutas `/auth/login`, `/auth/register` y `/admin/login` están limitadas a 10 peticiones por IP cada 15 minutos para prevenir ataques de fuerza bruta.
- **Validación de Referencias:** El backend obliga a que todos los métodos de pago (excepto Efectivo) incluyan un número de referencia.
- **Validación de Usuario (Auth):** El middleware `requireAuth` no solo valida la firma del JWT, sino que consulta la base de datos para verificar que el usuario siga existiendo y pertenezca al gimnasio antes de permitir cualquier operación.
- **Autorización por Roles:** Se implementó un middleware `requireRole('owner')` para restringir acciones sensibles (como eliminar miembros) exclusivamente a los dueños del gimnasio.
- **Idempotencia Básica:** El endpoint de renovación (`/members/:id/renew`) bloquea la creación de suscripciones duplicadas si un usuario hace doble clic por accidente con la misma fecha de inicio.