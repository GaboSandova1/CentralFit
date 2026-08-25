# 💻 CentralFit Frontend

Interfaz de usuario para la plataforma de gestión de gimnasios **CentralFit**. Construida como una Single Page Application (SPA), ofrece una experiencia fluida, moderna y responsiva para que los recepcionistas y dueños de gimnasios gestionen miembros, cobros, asistencias y reportes en tiempo real.

Diseñada con un enfoque "Mobile First" y un sistema de temas oscuros inspirado en Material Design 3, optimizado para reducir la fatiga visual en entornos de trabajo intensivo.

## ✨ Características Principales

- **Routing Dinámico:** Implementación de URLs reales con React Router (ej. `/members?status=por_vencer`). Los filtros y la navegación sobreviven a recargas de página (F5).
- **Pagos Divididos Avanzados:** Interfaz interactiva en el modal de renovación que permite mezclar múltiples métodos de pago (USD y Bs) en una sola transacción, calculando el cuadre exacto en tiempo real.
- **Subida de Imágenes Directa:** Integración con Supabase Storage para subir fotos de perfil y miembros directamente desde el navegador sin saturar el backend.
- **Reportes Interactivos:** Gráficos vectoriales (SVG) construidos desde cero, incluyendo gráficos de línea con degradado y tooltips, y gráficos de dona (torta) interactivos.
- **Exportación de Datos:** Generación y descarga de archivos CSV compatibles con Excel (separados por punto y coma y codificación UTF-8) para transacciones y listados de miembros.
- **Automatización de WhatsApp:** Botones de recordatorio de pago y felicitación de cumpleaños que abren WhatsApp Web/App con mensajes pre-redactados dinámicamente.
- **Control de Asistencia:** Vista dedicada con input simulando lector de huella/QR, registro instantáneo y tabla de asistentes del día con buscador y filtro por fecha.
- **Validación de Subida de Imágenes:** Restricción en el frontend para aceptar solo archivos de imagen (MIME type) con un tamaño máximo de 5MB antes de enviarlos a Supabase.
- **Rutas Protegidas Reales:** Implementación de un componente `ProtectedRoute` que redirige automáticamente a `/login` si no hay un token válido, evitando parpadeos de interfaces sin datos en sesiones expiradas.

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| --- | --- |
| **Librería UI** | React 18 |
| **Lenguaje** | TypeScript |
| **Bundler / Dev Server** | Vite |
| **Estilos** | Tailwind CSS v4 |
| **Enrutamiento** | React Router DOM v6 |
| **Iconografía** | Google Material Symbols |
| **Backend de Imágenes** | Supabase JS Client |

## 🚀 Inicio Rápido

### 1. Instalación
Navega a la carpeta `Frontend` e instala las dependencias:

```bash
cd Frontend
npm install
```

### 2. Variables de Entorno
Crea un archivo `.env` en la raíz de la carpeta `Frontend` con las siguientes variables:

```env
# URL del backend (CentralFit API)
VITE_API_URL=http://localhost:3000

# Credenciales públicas de Supabase (Solo para subida de imágenes)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_anon
```

### 3. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

### 4. Compilar para Producción

```bash
npm run build
```
Esto generará la carpeta `dist/` con los archivos estáticos listos para desplegar en Netlify, Vercel o cualquier hosting estático.

## 📁 Estructura del Proyecto

```text
Frontend/
├── public/
│   └── _redirects          # Regla para SPA en Netlify (evita error 404 en F5)
├── src/
│   ├── App.tsx             # Definición de rutas principales y wrappers
│   ├── index.css           # Tokens de diseño (Tailwind v4 @theme) y estilos globales
│   ├── types.ts            # Tipos compartidos de TypeScript
│   ├── lib/
│   │   └── api.ts          # Helper apiFetch (manejo de tokens) y cliente Supabase
│   ├── components/         # Componentes reutilizables y modales
│   │   ├── Layout.tsx      # Estructura principal (Sidebar + Topbar + Outlet)
│   │   ├── Topbar.tsx      # Barra superior (Tasa, Notif. Cumpleaños/Pagos, Perfil)
│   │   ├── Sidebar.tsx     # Menú lateral de navegación
│   │   ├── RenovationModal.tsx # Lógica compleja de pagos divididos
│   │   ├── EditMemberModal.tsx  # Formulario de edición (pesos, cumpleaños, foto)
│   │   ├── SettingsModal.tsx    # Configuración de gimnasio y exportación CSV
│   │   ├── PaymentInfoModal.tsx # Datos de pago de la suscripción CentralFit
│   │   └── TransactionHistoryModal.tsx
│   └── views/              # Páginas principales de la aplicación
│       ├── Dashboard.tsx   # Resumen, registro rápido y tabla de atención
│       ├── Members.tsx     # Directorio completo de miembros
│       ├── Attendance.tsx  # Módulo de control de acceso (Huella/QR)
│       ├── Plans.tsx       # Gestión de planes y precios paralelos
│       ├── Reports.tsx     # Gráficos, tarjetas de ingresos y filtros de fecha
│       ├── Login.tsx       # Inicio de sesión
│       ├── Register.tsx    # Wizard de registro de nuevo gimnasio
│       ├── SuperAdmin.tsx # Panel global de la plataforma
│       └── NotFound.tsx    # Vista 404 personalizada (Animación de disco 20kg)
├── .env
├── package.json
└── vite.config.ts
```

## 🎨 Sistema de Diseño

El proyecto utiliza **Tailwind CSS v4**, el cual permite definir variables CSS directamente en el archivo `src/index.css` mediante la directiva `@theme`.

- **Paleta de Colores:** Tema oscuro profundo (`--color-surface: #0f141a`) con acentos en verde esmeralda (`--color-primary: #51e084`) y tonos de advertencia naranja (`--color-tertiary: #ffb86e`).
- **Tipografía:** Inter para textos de cuerpo y Montserrat para encabezados, importadas directamente de Google Fonts.
- **Iconografía:** Se utiliza la fuente *Material Symbols Outlined* de Google mediante clases como `<span className="material-symbols-outlined">nombre_icono</span>`.

## 🔀 Rutas y Navegación (SPA)

La aplicación utiliza `react-router-dom` para manejar la navegación. Las rutas protegidas están envueltas en un componente `<Layout />` que renderiza el Sidebar y el Topbar.

| Ruta | Vista | Descripción |
| --- | --- | --- |
| `/login` | Login | Acceso para usuarios de gimnasio. |
| `/register` | Register | Wizard de 3 pasos para registrar un nuevo gimnasio. |
| `/superadminlogin` | SuperAdminLogin | Acceso exclusivo del Super Admin. |
| `/superadmin` | SuperAdmin | Panel de control global de la plataforma. |
| `/dashboard` | Dashboard | Panel principal con tarjetas de estadísticas y registro rápido. |
| `/members` | Members | Listado de miembros con filtros y búsqueda. Acepta `?status=activo`. |
| `/attendance` | Attendance | Módulo de entrada y salida de miembros. |
| `/plans` | Plans | Administración de planes y precios. |
| `/reports` | Reports | Gráficos financieros y listado de transacciones. |
| `*` | NotFound | Página 404 animada y temática. |

## 🔒 Manejo de Sesión

- Al iniciar sesión, si el usuario marca "Recordarme", el JWT se guarda en `localStorage` (persiste al cerrar el navegador). Si no se marca, se guarda en `sessionStorage` (se borra al cerrar la pestaña).
- El helper `apiFetch` (en `src/lib/api.ts`) se encarga de adjuntar automáticamente el token en los headers (`Authorization: Bearer <token>`) a todas las peticiones.
- Si la API responde con un código `401` (No autorizado) o `403` (Suspendido), el frontend dispara un evento global que limpia la sesión y redirige al usuario al Login limpiamente, sin recargar la página bruscamente.