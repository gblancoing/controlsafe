-- ============================================
-- Migración: Cambiar driver_type por can_drive (booleano)
-- Versión Segura - Maneja columnas existentes
-- ============================================

-- Paso 1: Eliminar la columna driver_type (si existe)
-- Si la columna no existe, verás un error #1091 que puedes IGNORAR
ALTER TABLE users 
DROP COLUMN driver_type;

-- Paso 2: Agregar columna can_drive (si no existe)
-- Si la columna ya existe, verás un error #1060 que puedes IGNORAR
ALTER TABLE users 
ADD COLUMN can_drive BOOLEAN DEFAULT FALSE AFTER role;

-- Paso 3: Actualizar valores existentes
-- Si un usuario tiene role = 'Driver', establecer can_drive = TRUE
UPDATE users 
SET can_drive = TRUE 
WHERE role = 'Driver' AND (can_drive IS NULL OR can_drive = FALSE);

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo
-- 2. Si ves errores #1091 o #1060, puedes IGNORARLOS (significa que la columna ya no existe o ya existe)
-- 3. Después de ejecutar, verifica que la columna can_drive existe:
--    SHOW COLUMNS FROM users;
-- 4. Luego ejecuta: npm run db:generate
-- 5. Finalmente: npm run dev
