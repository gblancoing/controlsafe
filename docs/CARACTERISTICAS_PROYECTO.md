# Características del proyecto ControlSafe

## Backend

| Aspecto | Tecnología / Detalle |
|--------|----------------------|
| **Runtime** | Node.js (v20+) |
| **Framework** | Next.js 15 (App Router), modo **standalone** en producción |
| **Base de datos** | MySQL vía **Prisma ORM** (Prisma Client 5.x) |
| **Lenguaje** | TypeScript |
| **Autenticación** | Sesión en cliente + validación en Server Actions; recuperación de contraseña con tokens en BD |
| **Envío de correo** | Nodemailer (SMTP) para recuperar contraseña, notificaciones y mensajes masivos |
| **API / lógica de servidor** | **Server Actions** (Next.js) con `'use server'` — no hay rutas API REST separadas; la lógica corre en acciones por módulo (flota, usuarios, login, mantenimiento, torque, reportes, etc.) |
| **Validación** | Zod en formularios y en Server Actions |
| **IA (opcional)** | Genkit + Google GenAI para asesor de mantenimiento predictivo |
| **Despliegue** | cPanel (Linux), archivo de arranque: `.next/standalone/controlsafe/server.js` |

### Modelos de datos principales (Prisma)

- **User**, **PasswordResetToken** — usuarios y recuperación de contraseña  
- **Company**, **Project**, **Region**, **Site** — empresas, proyectos, regiones, sitios  
- **Vehicle**, **VehicleTypeModel** — flota y tipos de vehículo  
- **MaintenanceProgram**, **MaintenanceTask**, **VehicleMaintenanceProgram**, **MaintenanceRecord**, **Intervention** — programas y registros de mantenimiento  
- **PreventiveControlReview**, **ReviewChecklistItem**, **ReviewPhoto** — control preventivo (torque) y revisiones  
- **TorqueRecord** — registros de torque  
- **UserVehicle**, **VehicleDocument** — asignación chofer–vehículo y documentación  
- **NotificationPolicy**, **BulkMessage** — notificaciones y mensajes masivos  

---

## Frontend

| Aspecto | Tecnología / Detalle |
|--------|----------------------|
| **Framework** | React 19 + Next.js 15 (App Router) |
| **Lenguaje** | TypeScript |
| **Estilos** | Tailwind CSS + **Tailwind CSS Animate** |
| **Componentes UI** | **Radix UI** (primitivos: Dialog, Select, Tabs, Accordion, etc.) + **shadcn/ui** (componentes en `src/components/ui/`) |
| **Iconos** | Lucide React |
| **Formularios** | React Hook Form + Zod (@hookform/resolvers) |
| **Gráficos** | Recharts |
| **Otros** | date-fns (fechas), class-variance-authority, clsx, tailwind-merge |

### Estructura de la UI

- **Layout:** sidebar (`app-sidebar`, `sidebar-nav`) + header (`header`, `user-nav`)  
- **Rutas principales:** `/` (landing), `/login`, `/dashboard`, `/flota`, `/mantenimiento`, `/torque`, `/usuarios`, `/empresas`, `/faenas`, `/historial`, `/reportes`, `/configuracion`, `/acl`  
- **Páginas por módulo:** cada módulo tiene `page.tsx`, `actions.ts` y carpeta `_components/` con tablas, diálogos y formularios  

---

## Estructura del proyecto

```
controlsafe/
├── prisma/
│   └── schema.prisma          # Modelos y enums de MySQL
├── database/                  # Scripts SQL y migraciones de datos
│   ├── *.sql
│   └── migrate-data.ts
├── scripts/                   # Build y despliegue
│   ├── build-and-package.ps1  # ZIP producción (7-Zip, standalone)
│   ├── install-standalone-deps.js
│   └── ...
├── public/                    # Estáticos (imágenes, etc.)
├── src/
│   ├── app/                   # App Router (Next.js)
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing
│   │   ├── globals.css
│   │   ├── actions.ts         # Acciones globales
│   │   ├── login/             # Login, recuperar, reset contraseña
│   │   ├── dashboard/
│   │   ├── flota/             # Flota, [id], ficha, tipos
│   │   ├── mantenimiento/
│   │   ├── torque/             # Control preventivo
│   │   ├── usuarios/
│   │   ├── empresas/
│   │   ├── faenas/
│   │   ├── historial/
│   │   ├── reportes/
│   │   ├── configuracion/
│   │   ├── acl/               # Roles y permisos
│   │   └── regiones/
│   ├── components/
│   │   ├── ui/                # Componentes base (shadcn)
│   │   ├── layout/            # Sidebar, header, navegación
│   │   └── dashboard/         # Métricas, gráficos, alertas
│   ├── lib/                   # Utilidades y configuración
│   │   ├── db.ts              # Cliente Prisma
│   │   ├── db-queries.ts
│   │   ├── types.ts
│   │   ├── email.ts
│   │   ├── date-utils.ts
│   │   └── firebase/
│   ├── hooks/
│   └── ai/                    # Genkit (IA)
├── .cursor/rules/             # Reglas Cursor (despliegue cPanel)
├── next.config.ts
├── tailwind.config.ts
├── SOLUCION_DEFINITIVA_503.md # Guía de despliegue cPanel
└── README.md
```

### Convenciones

- **Rutas:** una carpeta por sección (`/flota`, `/usuarios`, …); rutas dinámicas con `[id]` (p. ej. `/flota/[id]/ficha`).  
- **Server Actions:** un archivo `actions.ts` por módulo (o `actions-reviews.ts` cuando hay subcasos).  
- **Componentes de página:** en `_components/` dentro de la ruta (no se exponen como rutas).  
- **Componentes reutilizables:** en `src/components/` (ui, layout, dashboard).  
- **Configuración y utilidades:** en `src/lib/`; tipos compartidos en `src/lib/types.ts`.  

---

*Documento generado a partir del estado actual del repositorio. Última actualización: Enero 2026.*
