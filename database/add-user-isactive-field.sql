-- ============================================
-- Agregar campo isActive a la tabla users
-- ============================================

USE controlsafe;

-- Verificar si la columna ya existe antes de agregarla
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'users' 
               AND COLUMN_NAME = 'is_active');

SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER can_drive', 
    'SELECT "Columna is_active ya existe, omitiendo creación" AS message');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar usuarios existentes para que estén activos por defecto
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- Agregar índice para mejorar las consultas
SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'users' 
               AND INDEX_NAME = 'users_is_active_idx');

SET @sqlstmt := IF(@exist = 0, 
    'CREATE INDEX users_is_active_idx ON users(is_active)', 
    'SELECT "Índice users_is_active_idx ya existe, omitiendo creación" AS message');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo en MySQL
-- 2. Después de ejecutar, verifica que la columna existe:
--    SHOW COLUMNS FROM users;
-- 3. Luego ejecuta: npm run db:generate
-- 4. Finalmente: npm run dev
