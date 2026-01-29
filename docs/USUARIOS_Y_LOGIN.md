# Usuarios y login

El login usa **solo MySQL** (no Firebase): email y contraseña se validan contra la tabla `users`; la contraseña se guarda hasheada (`password_hash`, bcrypt). La sesión se mantiene con una cookie firmada (`SESSION_SECRET` en `.env`).

### Primera vez (activar login con MySQL)

1. **Añadir columna en MySQL:** Ejecutar el script `database/add-password-hash-users.sql` en tu base de datos (añade la columna `password_hash` a la tabla `users`).
2. **Variables de entorno:** En `.env.local` definir `SESSION_SECRET` con al menos 32 caracteres (p. ej. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
3. **Regenerar Prisma:** `npx prisma generate`.
4. **Crear un usuario con contraseña:** Entrar a la app (si ya tenías acceso por otro medio) o insertar un usuario en la BD con `password_hash` generado por bcrypt; o bien, tras desplegar, usar “¿Olvidaste tu contraseña?” con un email existente en `users` para fijar la contraseña. En desarrollo, desde **Usuarios** → “Agregar usuario” se crea el usuario con contraseña y ya puede iniciar sesión.

## Eliminar usuarios (como administrador)

1. Inicia sesión con un usuario con rol **Administrator**.
2. Ve a **Usuarios** desde el menú lateral (ruta `/usuarios`).
3. En la tabla, cada fila tiene un menú de tres puntos (⋮) a la derecha.
4. Haz clic en el menú → **Eliminar**.
5. Confirma en el diálogo. El usuario se borra de la base de datos de forma permanente.

**Nota:** La eliminación solo quita el registro en la base de datos de ControlSafe. Si usas Firebase Auth, el usuario puede seguir existiendo allí; para bloquearlo por completo conviene desactivarlo también en la consola de Firebase (o implementar eliminación en Firebase desde la app).

---

## Login (acceso al sistema)

- El acceso se valida contra **MySQL**: email y contraseña se comprueban en la tabla `users` (campo `password_hash` con bcrypt).
- Solo pueden entrar usuarios que existan en la BD con contraseña configurada y `is_active = true`.
- Alta de usuario: en **Usuarios** → “Agregar usuario” se guarda el usuario en MySQL con la contraseña hasheada; ese usuario ya puede iniciar sesión.
- Si un usuario no tiene contraseña (p. ej. migrado desde antes), debe usar **“¿Olvidaste tu contraseña?”** para establecer una.
- En `.env` debe estar definido **`SESSION_SECRET`** (al menos 32 caracteres) para la cookie de sesión.
- **"¿Olvidaste tu contraseña?"** envía un enlace por correo (Nodemailer/SMTP). En producción (cPanel) configura `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` y **`SMTP_PORT=465`** si el correo usa "Secure SSL/TLS"; el puerto 587 es para STARTTLS. La lógica de envío está en **`src/lib/email.ts`** (en el proyecto, no en el servidor; al generar el ZIP con `npm run build:prod:zip` ese código va incluido en el paquete).