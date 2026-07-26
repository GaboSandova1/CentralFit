# CentralFit — Documento de Contexto del Proyecto

> Este documento resume **todo** lo construido hasta ahora (frontend, backend, base de datos, decisiones de producto y pendientes) para poder continuar el desarrollo en Cursor sin perder contexto. Está escrito para que un asistente de IA (o tú mismo en 2 meses) pueda retomarlo sin tener que releer la conversación completa.

---

## 1. Resumen del proyecto

**CentralFit** es un SaaS de gestión de gimnasios, multi-tenant (varios gimnasios usan la misma plataforma, cada uno con sus propios datos aislados). Está pensado inicialmente para el mercado venezolano (precios en USD con conversión automática a Bolívares vía tasa BCV).

Funcionalidad principal:
- Los recepcionistas de cada gimnasio gestionan miembros, planes de membresía, renovaciones/pagos, y ven reportes financieros.
- Un **super admin** (el dueño de la plataforma, tú) tiene un panel separado para ver todos los gimnasios registrados, activarlos/suspenderlos, y ver estadísticas globales.
- Los gimnasios se registran **solo** (self-service, `/register`), y nacen con estado `trial` hasta que decidas activarlos.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express 5 + TypeScript |
| ORM | Prisma 7 (⚠️ ver sección de gotchas, es una versión muy nueva con cambios grandes) |
| Base de datos | PostgreSQL en Supabase |
| Auth | JWT (dos secretos separados: uno para usuarios de gimnasio, otro para super admin) |
| Tasa de cambio | API pública [dolarapi.com](https://dolarapi.com) (`ve.dolarapi.com`), sin API key |
| Hosting backend (en progreso) | Render (plan Free) |
| Hosting frontend (pendiente) | Netlify |

### Versiones específicas que importan (evitar romper de nuevo)
- `prisma` / `@prisma/client`: `^7.8.0`
- `typescript`: `5.7.2` (se bajó desde una versión `7.x` que rompía `ts-node`/`tsx`)
- `tsx`: se usa en vez de `ts-node-dev` (deprecado, incompatible con TS nuevo)
- `express`: `^5.2.1`
- `pg` + `@prisma/adapter-pg`: requeridos porque Prisma 7 **ya no permite** `new PrismaClient()` sin adapter

---

## 3. Estructura de carpetas (repo único)

Repo de GitHub: `GaboSandova1/CentralFit`, rama de trabajo activa: **`dev`** (la rama `main` solo tiene una parte vieja del frontend, no se usa para el desarrollo activo).

```
CentralFit/                    ← raíz del repo
├── centralfit-api/            ← backend (Root Directory en Render)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts            ← crea un Gym + User de prueba
│   │   ├── seed-admin.ts      ← crea tu cuenta de SuperAdmin
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts           ← arranca Express
│   │   ├── prisma.ts          ← instancia única de PrismaClient (con adapter)
│   │   ├── lib/
│   │   │   └── exchangeRate.ts    ← helper compartido: getCurrentRate()
│   │   ├── middleware/
│   │   │   ├── auth.ts            ← requireAuth (usuarios de gimnasio)
│   │   │   └── superAdminAuth.ts  ← requireSuperAdmin
│   │   └── routes/
│   │       ├── auth.ts
│   │       ├── admin.ts
│   │       ├── members.ts
│   │       ├── plans.ts
│   │       ├── reports.ts
│   │       ├── settings.ts
│   │       └── exchangeRate.ts
│   ├── .env                   ← NUNCA se sube a git
│   ├── .gitignore
│   ├── prisma.config.ts       ← config de Prisma 7 (reemplaza el datasource url del schema)
│   ├── tsconfig.json
│   └── package.json
│
└── Frontend/                  ← React + Vite
    └── src/
        ├── App.tsx
        ├── types.ts            ← ViewState (union de las vistas)
        ├── index.css           ← tokens de diseño (Tailwind v4 @theme)
        ├── lib/
        │   └── api.ts          ← apiFetch(), getToken(), API_URL
        ├── views/
        │   ├── Login.tsx
        │   ├── Register.tsx        (wizard de 3 pasos)
        │   ├── SuperAdminLogin.tsx
        │   ├── SuperAdmin.tsx
        │   ├── Dashboard.tsx
        │   ├── Members.tsx
        │   ├── Plans.tsx
        │   └── Reports.tsx
        └── components/
            ├── Layout.tsx
            ├── Sidebar.tsx
            ├── Topbar.tsx
            ├── EditMemberModal.tsx
            ├── ConfirmMemberDeletionModal.tsx
            ├── RenovationModal.tsx
            ├── NewPlanModal.tsx
            ├── EditPlanModal.tsx
            ├── ConfirmPlanDeletionModal.tsx
            ├── SettingsModal.tsx
            ├── UserProfileModal.tsx
            └── TransactionHistoryModal.tsx
```

---

## 4. Base de datos (Supabase + Prisma)

### 4.1 Conexión — cosas que costó mucho descubrir, no las repitas

- El proyecto de Supabase se llama **`centralfit-db`**.
- La **"Direct connection"** (puerto 5432, host `db.<ref>.supabase.co`) **no funcionó** por un problema de IPv6 en la red del desarrollador. Se usa el **"Session Pooler"** en su lugar.
- El `DATABASE_URL` final que sí funciona tiene esta forma exacta:

```
postgresql://postgres.<project-ref>:<password>@aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require&uselibpqcompat=true
```

  - El usuario **no** es `postgres`, es `postgres.<project-ref>` (con el ID del proyecto pegado).
  - `?sslmode=require&uselibpqcompat=true` es **obligatorio** — sin `uselibpqcompat=true` da un falso error de "self-signed certificate" (el certificado de Supabase es legítimo, es un cambio de comportamiento de la librería `pg` reciente).
  - Si la contraseña de la base de datos tiene caracteres especiales, hay que codificarlos en la URL (`@` → `%40`, `?` → `%3F`, etc.) o, más simple, resetear la contraseña a algo solo alfanumérico.

### 4.2 Gotchas de Prisma 7 (versión muy nueva, rompe patrones viejos)

1. **El `datasource` del `schema.prisma` ya NO acepta `url`.** Solo:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```
   La URL real vive en `prisma.config.ts`:
   ```typescript
   import "dotenv/config";
   import { defineConfig } from "prisma/config";

   export default defineConfig({
     schema: "prisma/schema.prisma",
     migrations: { path: "prisma/migrations" },
     datasource: { url: process.env["DATABASE_URL"] },
   });
   ```

2. **`new PrismaClient()` sin argumentos ya no funciona.** Prisma 7 quitó el motor de conexión interno por defecto — es obligatorio pasarle un **Driver Adapter**:
   ```typescript
   // src/prisma.ts
   import { PrismaClient } from '@prisma/client';
   import { PrismaPg } from '@prisma/adapter-pg';
   import { Pool } from 'pg';

   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   const adapter = new PrismaPg(pool);

   export const prisma = new PrismaClient({ adapter });
   ```

3. Después de **cualquier** `npm install`, cambio de dependencias, o cambio en `schema.prisma`, corre `npx prisma generate`. Ya hay un script `"postinstall": "prisma generate"` en `package.json` para que sea automático.

4. Para migraciones locales: `npx prisma migrate dev --name algo`. En producción (Render) se usa `npx prisma migrate deploy` (no `dev`) como parte del build command.

### 4.3 Schema completo actual (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

model SuperAdmin {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Gym {
  id        String   @id @default(uuid())
  name      String
  address   String?
  phone     String?
  status    String   @default("active") // active | suspended | trial
  createdAt DateTime @default(now())

  users    User[]
  members  Member[]
  plans    Plan[]
  settings GymSettings?
}

model User {
  id           String  @id @default(uuid())
  gymId        String
  gym          Gym     @relation(fields: [gymId], references: [id])
  email        String  @unique
  passwordHash String
  role         String  @default("receptionist") // owner | receptionist
  fullName     String?
  phone        String?
  cedula       String?

  @@index([gymId])
}

model Member {
  id        String   @id @default(uuid())
  gymId     String
  gym       Gym      @relation(fields: [gymId], references: [id])
  fullName  String
  cedula    String
  phone     String?
  photoUrl  String?
  createdAt DateTime @default(now())

  subscriptions Subscription[]

  @@unique([gymId, cedula])   // no se permite cédula duplicada dentro del mismo gimnasio
  @@index([gymId])
  @@index([cedula])
}

model Plan {
  id           String   @id @default(uuid())
  gymId        String
  gym          Gym      @relation(fields: [gymId], references: [id])
  name         String
  durationDays Int
  priceUsd     Decimal   // ÚNICA fuente de verdad del precio — el Bs se calcula, nunca se guarda
  description  String?

  subscriptions Subscription[]

  @@index([gymId])
}

model Subscription {
  id        String   @id @default(uuid())
  memberId  String
  member    Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  planId    String
  plan      Plan     @relation(fields: [planId], references: [id])
  startDate DateTime
  endDate   DateTime

  transactions Transaction[]

  @@index([endDate])
  @@index([memberId])
}

model Transaction {
  id               String       @id @default(uuid())
  subscriptionId   String
  subscription     Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  amountUsd        Decimal?     // se llena SOLO si el método fue Efectivo
  amountBs         Decimal?     // se llena SOLO si el método fue Zelle/Pago Móvil/Binance
  exchangeRateUsed Decimal?     // tasa BCV usada en el momento del pago (para reconstruir históricos)
  method           String
  reference        String?
  createdAt        DateTime     @default(now())

  @@index([subscriptionId])
}

model GymSettings {
  id        String @id @default(uuid())
  gymId     String @unique
  gym       Gym    @relation(fields: [gymId], references: [id])
  graceDays Int    @default(3)
}

model ExchangeRate {
  id        String   @id @default(uuid())
  usdToBs   Decimal
  eurToBs   Decimal?
  fetchedAt DateTime @default(now())
}
```

**Nota sobre `onDelete: Cascade`**: es intencional que `Member → Subscription → Transaction` se borre en cascada (borrar un miembro borra todo su historial — así lo promete la UI), pero **`Plan` NO tiene cascada** — si un plan tiene suscripciones asociadas, el borrado se bloquea con un error 409 amigable (no quieres perder el historial de ingresos de un plan viejo solo porque lo borraste).

---

## 5. Backend — endpoints completos

Todas las rutas (excepto login/register) requieren header `Authorization: Bearer <token>`.

### `src/routes/auth.ts` (público excepto /me y /password)
| Método | Ruta | Body | Devuelve |
|---|---|---|---|
| POST | `/auth/login` | `{email, password}` | `{token, user}` — bloquea si `gym.status === 'suspended'` |
| POST | `/auth/register` | `{fullName, email, phone, cedula, gymName, address, gymPhone, password}` | `{token, user, gym}` — crea `Gym` (status `trial`) + `User` (role `owner`) en una transacción |
| GET | `/auth/me` (protegido) | — | perfil del usuario + su gimnasio |
| PATCH | `/auth/password` (protegido) | `{currentPassword, newPassword}` | `{success}` |

### `src/routes/admin.ts` (JWT separado — `SUPER_ADMIN_JWT_SECRET`)
| Método | Ruta | Notas |
|---|---|---|
| POST | `/admin/login` | público, devuelve token de super admin |
| GET | `/admin/gyms` | lista todos los gimnasios + dueño + conteo de miembros/usuarios |
| PATCH | `/admin/gyms/:id/status` | `{status: 'active'\|'suspended'\|'trial'}` |
| GET | `/admin/stats` | totales globales de la plataforma |

### `src/routes/members.ts`
| Método | Ruta | Notas |
|---|---|---|
| GET | `/members` | incluye `status` calculado al vuelo (no se guarda en DB) |
| POST | `/members` | crea miembro; si viene `planId`, crea también `Subscription` + `Transaction` (moneda según `method`) |
| GET | `/members/search?q=` | búsqueda parcial por nombre/cédula |
| POST | `/members/:id/renew` | `{planId, startDate?, payments: [{method, amount?, reference?}]}` — el monto se calcula solo si se omite |
| PATCH | `/members/:id` | edita datos personales |
| DELETE | `/members/:id` | borra en cascada su historial |

**Cálculo de estado del miembro** (no se guarda, se calcula en cada request):
```typescript
function getStatus(endDate, graceDays) {
  if (!endDate) return 'sin_plan';
  const now = new Date();
  const graceCutoff = new Date(endDate.getTime() + graceDays * 86400000);
  if (now > graceCutoff) return 'vencido';
  if (now > endDate) return 'en_gracia';       // venció pero aún puede entrar
  if (endDate <= now + 7 días) return 'por_vencer';
  return 'activo';
}
```

### `src/routes/plans.ts`
| Método | Ruta | Notas |
|---|---|---|
| GET | `/plans` | cada plan incluye `activeMemberCount` y `priceBsEstimate` (calculado, no guardado) |
| POST | `/plans` | `{name, durationDays, priceUsd, description?}` — **ya no acepta `priceBs`** |
| PATCH | `/plans/:id` | igual, sin `priceBs` |
| DELETE | `/plans/:id` | bloqueado (409) si el plan tiene historial asociado |

### `src/routes/reports.ts`
| Método | Ruta | Notas |
|---|---|---|
| GET | `/reports/summary` | `{totalUsd, totalBs, byMethod, newMemberships, renewals}` — `byMethod` es **conteo de transacciones**, no suma de dólares |
| GET | `/reports/transactions?search&method&planId&range&limit` | lista filtrable, usada por Reports.tsx y el modal de historial |
| GET | `/reports/monthly` | últimos 6 meses, equivalente en USD (reconstruye los pagos en Bs usando `exchangeRateUsed` histórico, no la tasa de hoy) |

### `src/routes/settings.ts`
| Método | Ruta | Notas |
|---|---|---|
| GET | `/settings` | crea la fila con default si no existe (`upsert`) |
| PATCH | `/settings` | `{graceDays: number}` (0-30) |

### `src/routes/exchangeRate.ts`
| Método | Ruta | Notas |
|---|---|---|
| GET | `/exchange-rate` | `{usdToBs, eurToBs}` — cachea 6h, si falla la API externa devuelve el último valor guardado con `stale: true` |

---

## 6. Lógica de negocio clave (decisiones ya tomadas — no re-preguntar)

### 6.1 Multi-tenancy
- **Todo** filtra por `gymId` sacado del JWT, nunca confiar en un `id` de la URL sin cruzarlo con `gymId` primero (patrón usado en cada ruta: `findFirst({ where: { id, gymId } })` antes de actuar).
- `requireAuth` (middleware) también verifica que el `Gym` no esté `suspended` **en cada request**, no solo al hacer login — si el super admin suspende un gimnasio a mitad de sesión, la siguiente petición del recepcionista falla con 403 y el frontend lo desloguea automáticamente.

### 6.2 Autenticación
- Login por **email**, no username (decisión explícita — permite recuperación de contraseña y múltiples recepcionistas por gimnasio sin colisión de nombres).
- Dos JWT completamente separados: `JWT_SECRET` (usuarios de gimnasio) y `SUPER_ADMIN_JWT_SECRET` (super admin). Nunca deben mezclarse ni compartir middleware.
- El frontend guarda el token en `localStorage` (si "Recordarme") o `sessionStorage`. El token de super admin siempre en `localStorage` bajo la key `adminToken`.
- `App.tsx` revisa al montar si hay un token guardado y salta directo al Dashboard/SuperAdmin en vez de mostrar el login siempre.

### 6.3 Moneda (USD vs Bs) — la parte más delicada del proyecto
- **Efectivo = USD.** Zelle, Pago Móvil y Binance = **Bs** (aunque Zelle normalmente sea un servicio en dólares, así lo maneja el negocio real).
- Los **planes se fijan solo en USD** (`Plan.priceUsd`). El Bs **nunca se guarda** en el plan — se calcula al vuelo con la tasa BCV vigente, tanto para mostrarlo en el frontend como para calcular el monto real de un pago en Bs.
- Cada `Transaction` guarda **solo uno** de `amountUsd`/`amountBs` (el otro queda `null`) — nunca ambos, para no inflar los reportes.
- `exchangeRateUsed` se guarda por transacción (solo si fue en Bs) para poder reconstruir el histórico en USD-equivalente sin depender de la tasa actual.
- El reporte "Métodos de Pago" cuenta **transacciones**, no dólares — si no, un solo pago grande domina el porcentaje aunque se haya usado poco ese método.

### 6.4 Días de gracia
- Se mantiene la funcionalidad tal como está (decisión: es más correcta que la alternativa de "cambiar la fecha de inicio a mano", porque no ensucia el registro real de cuándo empezó el plan).
- Configurable por gimnasio vía `GymSettings.graceDays` (default 3).

### 6.5 Registro de gimnasios
- **Self-service** (decisión explícita, no lo crea el super admin a mano). Nace con `status: 'trial'`.

---

## 7. Frontend — estado de cada archivo

Todas las vistas y modales de abajo están **completamente conectados** a la API real (no hay datos hardcodeados salvo lo explícitamente marcado como pendiente):

| Archivo | Conectado a |
|---|---|
| `Login.tsx` | `POST /auth/login` |
| `Register.tsx` | `POST /auth/register` (wizard de 3 pasos, con geolocalización opcional para la dirección vía Nominatim/OpenStreetMap) |
| `SuperAdminLogin.tsx` | `POST /admin/login` |
| `SuperAdmin.tsx` | `GET /admin/gyms`, `GET /admin/stats`, `PATCH /admin/gyms/:id/status` |
| `Dashboard.tsx` | `GET /members`, `GET /plans`, `POST /members` (registro rápido) |
| `Members.tsx` | `GET /members`, filtro y búsqueda client-side, abre los 3 modales de miembro |
| `Plans.tsx` | `GET /plans`, abre los 3 modales de plan |
| `Reports.tsx` | `GET /reports/summary`, `/transactions`, `/monthly`, `GET /exchange-rate` |
| `EditMemberModal.tsx` | `PATCH /members/:id` |
| `ConfirmMemberDeletionModal.tsx` | `DELETE /members/:id` (vía callback `onConfirm` del padre) |
| `RenovationModal.tsx` | `GET /plans`, `GET /exchange-rate`, `GET /members/search`, `POST /members/:id/renew` |
| `NewPlanModal.tsx` / `EditPlanModal.tsx` | `POST`/`PATCH /plans`, muestran el Bs calculado en vivo |
| `ConfirmPlanDeletionModal.tsx` | `DELETE /plans/:id` |
| `SettingsModal.tsx` | `GET`/`PATCH /settings`, `GET /exchange-rate` (solo lectura) |
| `UserProfileModal.tsx` | `GET /auth/me`, `PATCH /auth/password` |
| `Topbar.tsx` | `GET /exchange-rate`, `GET /members` (para el dropdown de notificaciones) |

### `src/lib/api.ts` — helper compartido
```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getToken(): string | null {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    window.location.reload();
  }

  return response;
}
```
Cualquier archivo nuevo que necesite hablar con el backend debe usar `apiFetch`, no `fetch` directo — ya trae el token y maneja sesiones expiradas/gimnasios suspendidos automáticamente.

### Sistema de diseño (Tailwind v4, en `index.css`)
- Paleta: verde primario `#51e084`, fondo oscuro (`--color-surface: #0f141a`), esquema de "surface containers" tipo Material 3.
- Tokens de espaciado propios: `--spacing-sidebar-width` (220px), `--spacing-topbar-height` (56px), `--spacing-gutter` (16px), `--spacing-container-padding` (24px) — generan clases como `w-sidebar-width`, `mt-topbar-height`, etc. automáticamente (patrón de Tailwind v4).
- Tipografía en tokens: `font-headline-*`/`text-headline-*` (Montserrat), `font-body-*`/`text-body-*` y `font-label-*`/`text-label-*` (Inter).
- Responsivo: el `Sidebar` se convierte en un drawer móvil (oculto con `-translate-x-full`, se abre con el botón hamburguesa del `Topbar`) por debajo del breakpoint `md`.

---

## 8. Pendientes conocidos (no resueltos aún)

1. **Subida de fotos** (miembros y perfil de usuario) — necesita Supabase Storage. Hoy los inputs de foto están deshabilitados con una nota visual.
2. **Pagos divididos en la UI** — el backend (`POST /members/:id/renew`) ya soporta un array de `payments` con distintos métodos, pero el `RenovationModal` actual solo manda **un** pago. Falta construir la interfaz para dividir un pago en varios métodos.
3. **Exportación automática de respaldos (CSV diario)** — marcado "Próximamente" en `SettingsModal`, sin ningún backend detrás.
4. **Rate limiting** en `/auth/login` y `/admin/login` — no hay límite de intentos, importante antes de tener usuarios reales.
5. **CORS** — el backend probablemente todavía acepta cualquier origen; hay que restringirlo al dominio real de Netlify antes de producción.
6. **Sistema de notificaciones real** — hoy el dropdown de la campanita en `Topbar` reutiliza la misma lista de "Requiere Atención" del Dashboard (no hay un sistema de notificaciones persistente/histórico).
7. Texto explicativo de "Días de gracia" en `SettingsModal` podría mejorarse para que quede más claro qué hace exactamente (funcionalidad ya correcta, solo falta pulir la copia).

---

## 9. Variables de entorno

### Backend (`centralfit-api/.env`)
```dotenv
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require&uselibpqcompat=true"
JWT_SECRET="<secreto-largo-random>"
SUPER_ADMIN_JWT_SECRET="<otro-secreto-completamente-distinto>"
PORT=3000
```
⚠️ En Render, **no** configures `PORT` manualmente — Render lo asigna solo.

### Frontend (`Frontend/.env`)
```dotenv
VITE_API_URL=http://localhost:3000
```
En producción, cambiar a la URL real de Render.

---

## 10. Estado del despliegue (al momento de escribir esto)

- **Backend (Render)**: en proceso. Se creó el Web Service (`Language: Node`, `Root Directory: centralfit-api`, `Build Command: npm install && npx prisma migrate deploy && npm run build`, `Start Command: npm run start`, plan **Free**). Render empezó a exigir una tarjeta de verificación (cobro temporal de $1, no es un cargo real) incluso para el plan gratuito — quedó pendiente de completar ese paso y darle "Deploy".
- **Frontend (Netlify)**: **no iniciado todavía.**
- **Base de datos (Supabase)**: ✅ funcionando, con todas las migraciones aplicadas correctamente en local. Falta confirmar que las migraciones de producción (`migrate deploy`) corran bien la primera vez que Render construya el proyecto.

### Próximos pasos de deploy, en orden:
1. Terminar la verificación de tarjeta en Render y darle Deploy al backend.
2. Confirmar que el build de Render corre `prisma migrate deploy` sin errores contra Supabase.
3. Desplegar el frontend a Netlify, configurando `VITE_API_URL` con la URL real de Render.
4. Restringir CORS del backend al dominio de Netlify.
5. Probar el flujo completo de punta a punta en producción (registro de gimnasio → login → crear plan → registrar miembro → renovar → ver en reportes).

---

## 11. Scripts útiles (backend)

```bash
npm run dev              # tsx watch, desarrollo local
npm run build             # compila TypeScript a dist/
npm run start             # corre el build compilado (usado en producción)
npx prisma studio          # interfaz visual de la base de datos
npx prisma migrate dev --name <nombre>   # nueva migración en desarrollo
npx prisma migrate deploy                # aplica migraciones en producción (Render)
npx tsx prisma/seed.ts        # crea un Gym + User de prueba
npx tsx prisma/seed-admin.ts  # crea tu cuenta de SuperAdmin (edita el archivo primero con tu email/password real)
```

## 12. Archivos de referencia completos (para copiar/pegar tal cual)

### `Frontend/src/types.ts`
```typescript
export type ViewState =
  | 'login'
  | 'register'
  | 'superadminlogin'
  | 'dashboard'
  | 'members'
  | 'plans'
  | 'reports'
  | 'superadmin';
```

### `Frontend/src/App.tsx`
```tsx
import { useState } from 'react';
import { ViewState } from './types';
import Login from './views/Login';
import Register from './views/Register';
import Dashboard from './views/Dashboard';
import Members from './views/Members';
import Plans from './views/Plans';
import Reports from './views/Reports';
import Layout from './components/Layout';
import SuperAdmin from './views/SuperAdmin';
import SuperAdminLogin from './views/SuperAdminLogin';

function getInitialView(): ViewState {
  if (localStorage.getItem('adminToken')) return 'superadmin';
  if (localStorage.getItem('token') || sessionStorage.getItem('token')) return 'dashboard';
  return 'login';
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(getInitialView);

  if (currentView === 'login') {
    return (
      <Login
        onLogin={() => setCurrentView('dashboard')}
        onNavigateToRegister={() => setCurrentView('register')}
        onLoginSuperAdmin={() => setCurrentView('superadminlogin')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register
        onRegisterComplete={() => setCurrentView('dashboard')}
        onClose={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'superadminlogin') {
    return (
      <SuperAdminLogin
        onLoginSuccess={() => setCurrentView('superadmin')}
        onBack={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'superadmin') {
    return <SuperAdmin onLogout={() => setCurrentView('login')} />;
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'members' && <Members />}
      {currentView === 'plans' && <Plans />}
      {currentView === 'reports' && <Reports />}
    </Layout>
  );
}
```

### `Frontend/src/index.css` (tokens de diseño completos, Tailwind v4)
```css
@import "tailwindcss";

@theme {
  --color-surface: #0f141a;
  --color-surface-dim: #0f141a;
  --color-surface-bright: #353a40;
  --color-surface-container-lowest: #0a0f14;
  --color-surface-container-low: #171c22;
  --color-surface-container: #1b2026;
  --color-surface-container-high: #252a31;
  --color-surface-container-highest: #30353c;
  --color-on-surface: #dee3eb;
  --color-on-surface-variant: #bccabb;
  --color-inverse-surface: #dee3eb;
  --color-inverse-on-surface: #2c3137;
  --color-outline: #869486;
  --color-outline-variant: #3d4a3e;
  --color-surface-tint: #51e084;
  --color-primary: #51e084;
  --color-on-primary: #003919;
  --color-primary-container: #2cc36b;
  --color-on-primary-container: #004a23;
  --color-inverse-primary: #006d36;
  --color-secondary: #c0c7d4;
  --color-on-secondary: #2a313b;
  --color-secondary-container: #454c57;
  --color-on-secondary-container: #b5bcc9;
  --color-tertiary: #ffb86e;
  --color-on-tertiary: #492900;
  --color-tertiary-container: #ee9832;
  --color-on-tertiary-container: #5e3600;
  --color-error: #ffb4ab;
  --color-on-error: #690005;
  --color-error-container: #93000a;
  --color-on-error-container: #ffdad6;
  --color-primary-fixed: #71fd9e;
  --color-primary-fixed-dim: #51e084;
  --color-on-primary-fixed: #00210c;
  --color-on-primary-fixed-variant: #005227;
  --color-secondary-fixed: #dce3f1;
  --color-secondary-fixed-dim: #c0c7d4;
  --color-on-secondary-fixed: #151c26;
  --color-on-secondary-fixed-variant: #404752;
  --color-tertiary-fixed: #ffdcbd;
  --color-tertiary-fixed-dim: #ffb86e;
  --color-on-tertiary-fixed: #2c1600;
  --color-on-tertiary-fixed-variant: #693c00;
  --color-background: #0f141a;
  --color-on-background: #dee3eb;
  --color-surface-variant: #30353c;

  --font-headline-xl: "Montserrat", sans-serif;
  --font-headline-lg: "Montserrat", sans-serif;
  --font-headline-md: "Montserrat", sans-serif;
  --font-body-lg: "Inter", sans-serif;
  --font-body-md: "Inter", sans-serif;
  --font-body-sm: "Inter", sans-serif;
  --font-label-md: "Inter", sans-serif;
  --font-label-sm: "Inter", sans-serif;

  --text-headline-xl: 40px;
  --text-headline-xl--line-height: 48px;
  --text-headline-lg: 32px;
  --text-headline-lg--line-height: 40px;
  --text-headline-md: 24px;
  --text-headline-md--line-height: 32px;
  --text-body-lg: 18px;
  --text-body-lg--line-height: 28px;
  --text-body-md: 16px;
  --text-body-md--line-height: 24px;
  --text-body-sm: 14px;
  --text-body-sm--line-height: 20px;
  --text-label-md: 14px;
  --text-label-md--line-height: 16px;
  --text-label-sm: 12px;
  --text-label-sm--line-height: 14px;

  /* Estos 4 se apretaron respecto a los valores originales de Google AI Studio */
  --spacing-unit: 4px;
  --spacing-container-padding: 24px;   /* era 32px */
  --spacing-gutter: 16px;              /* era 24px */
  --spacing-sidebar-width: 220px;      /* era 260px */
  --spacing-topbar-height: 56px;       /* token nuevo, no existía */
  --spacing-card-gap: 16px;

  --radius-sm: 0.125rem;
  --radius-DEFAULT: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
}

@layer utilities {
  .bg-kinetic-grid {
    background-image: linear-gradient(to right, rgba(61, 74, 62, 0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(61, 74, 62, 0.1) 1px, transparent 1px);
    background-size: 32px 32px;
  }
}

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #0f141a; }
::-webkit-scrollbar-thumb { background: #3d4a3e; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #51e084; }
```

⚠️ Todos los íconos de la app usan **Material Symbols Outlined** de Google (`<span className="material-symbols-outlined">nombre_icono</span>`). Eso requiere un `<link>` a Google Fonts en el `index.html` — algo como:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
```
**No vi el `index.html` real en ningún momento de la conversación** — si los íconos ya se ven bien en tu app, probablemente ya está — pero verifícalo (sección 13).

---

## 13. Puntos ciegos de este documento — verifica esto tú mismo

Para ser honesto: hay archivos que **nunca vi** en esta conversación, así que no puedo garantizar que este documento los describa bien. Antes de asumir que está todo cubierto, revisa:

- **`Frontend/index.html`** — nunca lo vi. Confirma que tiene los `<link>` de Google Fonts de arriba.
- **`Frontend/vite.config.ts`** — nunca lo vi. Si usas `@vitejs/plugin-react` y el plugin de Tailwind v4, debería estar ahí.
- **`Frontend/package.json`** — nunca vi su contenido exacto (sé que usa React + Vite + Tailwind v4, pero no las versiones exactas).
- **`Frontend/.gitignore`** — asumo que existe y excluye `node_modules`/`dist`, pero no lo confirmé como sí hice con el del backend.
- **Si ya borraste el miembro de prueba con cédula duplicada** en Prisma Studio antes de correr la migración `unique_cedula_per_gym` — si no lo hiciste, esa migración específica va a fallar.
- **El link "¿Olvidaste tu contraseña?"** en `Login.tsx` sigue siendo un `href="#"` muerto — no lo mencioné como pendiente antes, lo agrego ahora: no hay ningún flujo de recuperación de contraseña construido.
- **`prisma/seed-admin.ts`** tiene tu email/contraseña reales hardcodeados en el archivo — confirma que ese archivo no se haya subido a git con tus credenciales reales dentro (revisa tu `.gitignore` o bórralo después de correrlo una vez).

---