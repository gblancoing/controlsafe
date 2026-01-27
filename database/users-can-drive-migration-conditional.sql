-- ============================================
-- Migración: Cambiar driver_type por can_drive (booleano)
-- Versión Condicional - Solo ejecuta si es necesario
-- ============================================

-- Verificar y eliminar driver_type si existe
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'users' 
               AND COLUMN_NAME = 'driver_type');

SET @sqlstmt := IF(@exist > 0, 
    'ALTER TABLE users DROP COLUMN driver_type', 
    'SELECT "Columna driver_type no existe, omitiendo eliminación" AS message');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar can_drive si no existe
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'users' 
               AND COLUMN_NAME = 'can_drive');

SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE users ADD COLUMN can_drive BOOLEAN DEFAULT FALSE AFTER role', 
    'SELECT "Columna can_drive ya existe, omitiendo creación" AS message');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar valores existentes: usuarios con role = 'Driver' -> can_drive = TRUE
UPDATE users 
SET can_drive = TRUE 
WHERE role = 'Driver' AND (can_drive IS NULL OR can_drive = FALSE);

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo
-- 2. Este script verifica automáticamente si las columnas existen antes de modificarlas
-- 3. Después de ejecutar, verifica que la columna can_drive existe:
--    SHOW COLUMNS FROM users;
-- 4. Luego ejecuta: npm run db:generate
-- 5. Finalmente: npm run dev
