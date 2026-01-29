# Solución definitiva: 503 y MODULE_NOT_FOUND (next/dist/server/next.js)

**Guía única de despliegue en cPanel.** Esta es la configuración que funciona; el resto de documentos de “solución” para 503/standalone/permisos se eliminaron para evitar duplicados.

**Un solo flujo.** En este hosting **no uses Run NPM Install** (falla con nodevenv). Usa 7-Zip en tu PC y asigna permisos **justo después de extraer** para que las carpetas queden en **755** y no en 644 (si quedan en 644, luego cuesta mucho borrarlas o reemplazarlas).

---

## Requisitos en tu PC

- **7-Zip** instalado en la ruta por defecto: https://www.7-zip.org/  
  Sin 7-Zip el ZIP puede salir incompleto y el error 503 seguirá.

---

## Pasos (en orden, sin saltar)

### 1. Generar el ZIP en tu PC

**Importante:** El servidor es Linux (Debian). En `prisma/schema.prisma` debe estar `binaryTargets = ["native", "debian-openssl-1.1.x"]` para que Prisma funcione en producción.

Genera el ZIP (incluye `npx prisma generate` + build + empaquetado en un solo comando):

```powershell
cd c:\xampp\htdocs\controlsafe
npm run build:prod:zip
```

En consola debe aparecer: **"Usando 7-Zip (incluye rutas largas de node_modules)"**.  
Si sale "7-Zip no encontrado", instala 7-Zip y vuelve a ejecutar.

---

### 2. En el servidor: borrar solo si vas a reemplazar todo

- **cPanel → File Manager** → entra en `public_html/controlsafe.carenvp.cl`.
- Activa **Show Hidden Files** (Mostrar archivos ocultos).
- Si vas a subir un ZIP nuevo y reemplazar todo: borra **todo** el contenido de esa carpeta (incluida `.next`).  
  Si las carpetas no se pueden borrar porque tienen 644, asígnales **755** primero a la carpeta raíz con **Recurse into subdirectories**, luego intenta borrar de nuevo.

---

### 3. Subir y extraer el ZIP

1. Sube el ZIP generado en el paso 1 a `public_html/controlsafe.carenvp.cl`.
2. Clic en el ZIP → **Extract** (Extraer) y extrae **en esa misma carpeta** (debe quedar `.next`, `public`, `prisma`, `package.json`, etc. dentro de `controlsafe.carenvp.cl`).

---

### 4. Permisos (obligatorio justo después de extraer)

Si al extraer las **carpetas** quedan en 644, Node puede fallar y además luego no podrás borrarlas rápido. Hay que dejar **todas las carpetas en 755**.

1. En File Manager, dentro de `public_html/controlsafe.carenvp.cl`, selecciona la **carpeta** `.next` (no un archivo).
2. **Change Permissions** (o Permissions).
3. Marca **755** (o escribe 755 en el campo).
4. Activa **“Recurse into subdirectories”** (aplicar a subcarpetas).
5. Aplicar / Save.

Repite lo mismo para la carpeta **`public`** y para **`prisma`** si existen (755 + Recurse into subdirectories).  
Con eso todas las subcarpetas (`.next`, `standalone`, `controlsafe`, `node_modules`, etc.) quedarán en **755** y podrás borrarlas o reemplazarlas sin problema la próxima vez.

**Resumen permisos:**  
- **Carpetas:** siempre **755** (y aplicar a subdirectorios).  
- **Archivos:** pueden quedar en 644; no hace falta cambiarlos si el panel no lo permite por archivos.

---

### 5. Arrancar la app

1. **cPanel → Setup Node.js App** (o Node.js App).
2. App **controlsafe.carenvp.cl** → **Start Application** (o Restart).
3. Probar **OPEN** o `https://controlsafe.carenvp.cl`.

---

## Comprobar que todo está bien

En File Manager (con archivos ocultos) debe existir:

- `public_html/controlsafe.carenvp.cl/.next/standalone/controlsafe/server.js`
- `public_html/controlsafe.carenvp.cl/.next/standalone/controlsafe/.next/` con **BUILD_ID**, **routes-manifest.json**, carpetas **server** y **static** (y el resto de manifests)
- `public_html/controlsafe.carenvp.cl/.next/standalone/controlsafe/node_modules/next/dist/server/next.js`

**Importante:** El ZIP debe generarse con el script actual (incluye todo el contenido de `.next` necesario, no solo BUILD_ID/static/server). Si antes tenías error por `routes-manifest.json`, regenera el ZIP con `npm run build:prod:zip` y vuelve a subir.

Application startup file en cPanel debe ser: **`.next/standalone/controlsafe/server.js`**.

---

## Resumen

| Paso | Acción |
|------|--------|
| 1 | En tu PC: instalar 7-Zip y ejecutar `npm run build:prod:zip` (debe decir "Usando 7-Zip"). |
| 2 | En el servidor: borrar contenido anterior si reemplazas todo (si no borra, poner 755 recursivo y reintentar). |
| 3 | Subir el ZIP y extraer en `public_html/controlsafe.carenvp.cl`. |
| 4 | **Inmediatamente:** permisos **755** en carpetas `.next`, `public`, `prisma` con **Recurse into subdirectories**. |
| 5 | Node.js App → Start Application. |

**No uses Run NPM Install** en este hosting; el ZIP ya debe traer `node_modules/next` completo gracias a 7-Zip.

---

## Si las acciones funcionan en local pero no en producción

Las **Server Actions** (flota, usuarios, login, mantenimiento, etc.) usan base de datos, envío de emails y la URL de la app. En producción eso depende de las **variables de entorno**. Si no están bien configuradas, las acciones fallan sin mostrar el mismo error que en local.

### 1. Variables de entorno en cPanel (obligatorias)

En **cPanel → Setup Node.js App** → tu app → **Environment variables** (o “Edit” / “Variables”), define:

| Variable | Valor | Para qué |
|----------|--------|----------|
| `NODE_ENV` | `production` | Modo producción. |
| **`SESSION_SECRET`** | Cadena aleatoria de **al menos 32 caracteres** | **Obligatorio para el login.** Se usa para firmar la cookie de sesión. Sin ella aparece "Error al iniciar sesión". Generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `DATABASE_URL` | `mysql://usuario:contraseña@host:3306/controlsafe` | Conexión a MySQL del **hosting** (no uses `localhost` si la BD está en otro servidor). |
| `NEXT_PUBLIC_APP_URL` | `https://controlsafe.carenvp.cl` | URL pública de la app (redirects, enlaces en emails, etc.). |

Si usas envío de emails (recuperar contraseña, notificaciones):

| Variable | Ejemplo |
|----------|---------|
| `SMTP_HOST` | `mail.carenvp.cl` |
| `SMTP_PORT` | `465` (cPanel "Secure SSL/TLS") o `587` (STARTTLS) |
| `SMTP_USER` | `controlsafe@carenvp.cl` |
| `SMTP_PASSWORD` | (contraseña del correo) |
| `SMTP_FROM` | `ControlSafe <controlsafe@carenvp.cl>` |

Sin **`SESSION_SECRET`**, el login falla con "Error al iniciar sesión" (el log dirá: *SESSION_SECRET debe estar definido en .env con al menos 32 caracteres*). Sin `DATABASE_URL` correcta, las acciones que tocan la base de datos fallan. Sin `NEXT_PUBLIC_APP_URL` correcta, los enlaces y redirects pueden apuntar a localhost.

### 2. URL de la app también en el build (recomendado)

Las variables `NEXT_PUBLIC_*` se **embeben en el build**. Para que la URL sea correcta también en el cliente (p. ej. enlaces en emails o en la interfaz), genera el ZIP **después** de configurar la URL de producción:

1. En la raíz del proyecto crea o edita **`.env.production`** (no subas este archivo al servidor si tiene secretos; el ZIP no lo incluye si está en .gitignore).
2. Pon al menos:  
   `NEXT_PUBLIC_APP_URL=https://controlsafe.carenvp.cl`
3. Luego ejecuta:  
   `npm run build:prod:zip`

Así el build lleva la URL de producción y las acciones/redirects no usan localhost.

### 3. Revisar errores en el servidor

Si una acción no hace nada o la página no cambia:

1. En **cPanel → Node.js App** abre **Application logs** o **stderr.log** (según tu panel).
2. Busca el mensaje de error (p. ej. `Prisma`, `DATABASE_URL`, `ECONNREFUSED`, `SMTP`).
3. Corrige la variable que indique el error (normalmente `DATABASE_URL` o SMTP) y reinicia la app.

---

## Errores frecuentes en producción

| Error | Causa | Solución |
|-------|--------|----------|
| **Prisma Client could not locate Query Engine for "debian-openssl-1.1.x"** | El cliente se generó solo para Windows. | En `prisma/schema.prisma` pon `binaryTargets = ["native", "debian-openssl-1.1.x"]` y vuelve a ejecutar `npm run build:prod:zip` (ya incluye prisma generate) y subir el ZIP. |
| **/flota.jpg received null** | La carpeta `public` no estaba dentro del standalone. | El script ya copia `public/` al standalone; regenera el ZIP con el script actual y vuelve a desplegar. |
| **Panel de Control lleva fuera** | El enlace apuntaba a `/` (landing). | Corregido: el sidebar enlaza a `/dashboard`. |
| **Select.Item value empty string** | Radix no permite `value=""`. | Corregido: se usa `value="__no_types__"` cuando no hay tipos. |

---

## Dónde está la configuración (no borrar)

- **Script que genera el ZIP:** `scripts/build-and-package.ps1` (copia todo `.next` y `public` al standalone, usa 7-Zip, instala next en standalone si falta).
- **Prisma:** `prisma/schema.prisma` con `binaryTargets = ["native", "debian-openssl-1.1.x"]` para Linux.
- **Comando:** `npm run build:prod:zip` (en `package.json`; incluye `npx prisma generate` + build + ZIP).
- **Guía única de despliegue:** este archivo (`SOLUCION_DEFINITIVA_503.md`).

**Última actualización:** Enero 2026
