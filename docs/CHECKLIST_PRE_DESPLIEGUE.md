# Checklist antes de generar el paquete para producción

Revisa estos puntos **antes** de ejecutar `npm run build:prod:zip` para subir a producción.

---

## 1. Variables de entorno para el build

`NEXT_PUBLIC_APP_URL` se **embebe en el build**. Si no la configuras, enlaces (p. ej. recuperar contraseña, QR de ficha) pueden apuntar a localhost.

**En tu PC, antes de generar el ZIP:**

- Crea o edita **`.env.production`** en la raíz del proyecto (no subas este archivo al repo si tiene datos reales).
- Define la URL de producción, por ejemplo:

  ```
  NEXT_PUBLIC_APP_URL="https://controlsafe.carenvp.cl"
  ```

- **IMPORTANTE:** Si tienes **`.env.local`** con `NEXT_PUBLIC_APP_URL="http://localhost:9002"`, **coméntalo o elimínalo** antes del build, porque `.env.local` tiene prioridad sobre `.env.production` y sobrescribiría la URL de producción.
- Luego ejecuta el build; Next.js usará `.env.production` en modo producción:

  ```powershell
  npm run build:prod:zip
  ```

**En el servidor (cPanel):** configura en la Node.js App las variables que no van en el build:
- **`SESSION_SECRET`** (obligatorio): cadena aleatoria de al menos 32 caracteres; se usa para firmar la cookie de sesión. Sin ella el login falla con "Error al iniciar sesión". Generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `DATABASE_URL`, `NODE_ENV=production`, `SMTP_*`, etc. No hace falta poner `NEXT_PUBLIC_APP_URL` en cPanel si ya la embebiste en el build.  
**Correo (Olvidé mi contraseña):** si usas el correo de cPanel con "Secure SSL/TLS", en la Node.js App pon **`SMTP_PORT=465`** (no 587). Revisa en cPanel → Email → configuración del cliente de correo el puerto SMTP recomendado.

---

## 2. Prisma (Linux en cPanel)

- En **`prisma/schema.prisma`** el generador debe tener:
  ```prisma
  binaryTargets = ["native", "debian-openssl-1.1.x"]
  ```
- Antes del primer build de producción o si cambiaste el schema, ejecuta:
  ```powershell
  npx prisma generate
  ```

---

## 3. Build y empaquetado

- **7-Zip** instalado (recomendado) para que el script no omita archivos por rutas largas.
- Comando (incluye `prisma generate` + build + ZIP en un solo paso):
  ```powershell
  npm run build:prod:zip
  ```
  Secuencia que ejecuta: `npx prisma generate` → `npm run build:prod` → empaquetado ZIP.
- En consola debe aparecer algo como: *"Usando 7-Zip (incluye rutas largas de node_modules)"*.
- El ZIP se genera en la raíz del proyecto con nombre tipo: `controlsafe-production-YYYYMMDD-HHmmss.zip`.

---

## 4. Contenido del paquete

El script ya incluye:

- `.next/standalone/` (servidor)
- `.next/static/`
- `public/`
- `prisma/`
- `package.json`, `package-lock.json`, `.htaccess` (si existen)

**PWA (app móvil):** El manifest y los iconos (`/manifest.webmanifest`, `/icon-192`, `/icon-512`) se sirven desde el mismo servidor Next.js; no hace falta añadir nada más al ZIP.

---

## 5. Resumen de pasos

| Paso | Acción |
|------|--------|
| 1 | Tener `.env.production` con `NEXT_PUBLIC_APP_URL` apuntando a la URL de producción (opcional si ya está en cPanel y no quieres recompilar). |
| 2 | `npm run build:prod:zip` (ejecuta `prisma generate` + build + ZIP en un solo comando). |
| 3 | Subir el ZIP al servidor, extraer, asignar permisos **755** a carpetas (`.next`, `public`, `prisma`) con "Recurse into subdirectories". |
| 4 | En cPanel Node.js App: configurar variables de entorno y **Start Application**. |

Guía detallada de despliegue: **`SOLUCION_DEFINITIVA_503.md`** en la raíz del proyecto.

---

## Opcional antes del build

- **TypeScript:** `npm run typecheck` (el build ignora errores de tipo, pero conviene corregirlos).
- **Lint:** `npm run lint`.
- **Credenciales:** Mantén los valores reales solo en `.env.local` (o en cPanel); no subas `.env` o `.env.local` al repositorio. Usa `.env.example` como plantilla con placeholders.
