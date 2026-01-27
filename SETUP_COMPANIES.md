# 🚀 Configuración Rápida - Tabla Companies

## ⚠️ Problema Actual
La tabla `companies` no existe en la base de datos, por eso aparece el error "No se pudieron cargar los datos de las empresas".

## ✅ Solución Rápida

### Paso 1: Ejecutar Script SQL

1. Abre **phpMyAdmin** (http://localhost/phpmyadmin)
2. Selecciona la base de datos `controlsafe`
3. Ve a la pestaña **SQL**
4. Copia y pega el contenido completo de `database/create-companies-table.sql`
5. Haz clic en **Continuar**

### Paso 2: Regenerar Prisma Client

```bash
npm run db:generate
```

**Nota**: Si tienes el servidor de desarrollo corriendo, ciérralo primero, luego ejecuta el comando y vuelve a iniciarlo.

### Paso 3: Verificar

1. Recarga la página `/empresas`
2. Deberías ver las empresas (Acciona, Aliservice, Codelco, JEJ Ingeniería)
3. El botón "Añadir Empresa" debería funcionar

## 🔍 Verificación Manual

Puedes verificar que la tabla existe ejecutando en phpMyAdmin:

```sql
SELECT * FROM companies;
```

Deberías ver 4 empresas.

## 📝 Script SQL Completo

El archivo `database/create-companies-table.sql` contiene:
- Creación de la tabla `companies`
- Inserción de 4 empresas de ejemplo

---

**Si el error persiste después de estos pasos**, verifica:
1. Que MySQL esté corriendo en XAMPP
2. Que la base de datos `controlsafe` exista
3. Que `.env.local` tenga la conexión correcta: `DATABASE_URL="mysql://root@localhost:3306/controlsafe"`
