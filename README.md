# ControlSafe

Gestión de flotas, control de torque y mantenimiento predictivo para operaciones mineras.

## Stack

- **Next.js** (App Router)
- **Prisma** (MySQL)
- **Node.js** (producción en cPanel)

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar DATABASE_URL y opcionales
npx prisma generate
npm run dev
```

## Despliegue en cPanel (Linux)

1. En `prisma/schema.prisma` debe estar `binaryTargets = ["native", "debian-openssl-1.1.x"]`.
2. Generar ZIP: `npx prisma generate` y luego `npm run build:prod:zip` (requiere 7-Zip en Windows).
3. Subir el ZIP al servidor, extraer, aplicar permisos 755 en carpetas `.next`, `public`, `prisma`.
4. En cPanel Node.js App: startup file = `.next/standalone/controlsafe/server.js`, variables de entorno (DATABASE_URL, NEXT_PUBLIC_APP_URL, etc.).

Guía detallada: **[SOLUCION_DEFINITIVA_503.md](./SOLUCION_DEFINITIVA_503.md)**.

## Repositorio

```bash
git add .
git status   # revisar que no se suban .env, node_modules ni *.zip
git commit -m "Configuración despliegue cPanel: Prisma binaryTargets, standalone, 7-Zip, permisos, guía única"
git push -u origin main
```

Los archivos `.env*` (salvo `.env.example`) y `*.zip` están en `.gitignore` y no se suben.

## Licencia

Privado.
