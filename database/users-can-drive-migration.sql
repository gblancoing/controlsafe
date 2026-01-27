-- ============================================
-- Migración: Cambiar driver_type por can_drive (booleano)
-- ============================================
-- NOTA: Si la columna driver_type no existe, IGNORA el error #1091
-- Si la columna can_drive ya existe, IGNORA el error #1060

-- Paso 1: Eliminar la columna driver_type (si existe)
-- ⚠️ Si ves error #1091, puedes IGNORARLO (la columna no existe)
ALTER TABLE users 
DROP COLUMN driver_type;

-- Paso 2: Agregar columna can_drive (si no existe)
-- ⚠️ Si ves error #1060, puedes IGNORARLO (la columna ya existe)
ALTER TABLE users 
ADD COLUMN can_drive BOOLEAN DEFAULT FALSE AFTER role;

-- Paso 3: Actualizar valores existentes
-- Usuarios con role = 'Driver' se marcan como can_drive = TRUE
UPDATE users 
SET can_drive = TRUE 
WHERE role = 'Driver' AND (can_drive IS NULL OR can_drive = FALSE);

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo
-- 2. Si ves errores #1091 o #1060, puedes IGNORARLOS
-- 3. Después de ejecutar, verifica: SHOW COLUMNS FROM users;
-- 4. Luego ejecuta: npm run db:generate
-- 5. Finalmente: npm run dev
