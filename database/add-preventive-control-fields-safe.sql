-- ============================================
-- Agregar campos de seguimiento a vehicle_maintenance_programs (Versión Segura)
-- ============================================
-- Este script verifica si las columnas existen antes de crearlas
-- Útil si ya ejecutaste algunos scripts parcialmente

-- Seleccionar la base de datos
USE controlsafe;

-- Verificar y agregar columna last_reset_date
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'controlsafe' 
    AND TABLE_NAME = 'vehicle_maintenance_programs' 
    AND COLUMN_NAME = 'last_reset_date'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE vehicle_maintenance_programs ADD COLUMN last_reset_date DATETIME NULL AFTER program_id',
    'SELECT "Columna last_reset_date ya existe" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna next_due_date
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'controlsafe' 
    AND TABLE_NAME = 'vehicle_maintenance_programs' 
    AND COLUMN_NAME = 'next_due_date'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE vehicle_maintenance_programs ADD COLUMN next_due_date DATETIME NULL AFTER last_reset_date',
    'SELECT "Columna next_due_date ya existe" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna updated_at
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'controlsafe' 
    AND TABLE_NAME = 'vehicle_maintenance_programs' 
    AND COLUMN_NAME = 'updated_at'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE vehicle_maintenance_programs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
    'SELECT "Columna updated_at ya existe" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar índice
SET @idx_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'controlsafe' 
    AND TABLE_NAME = 'vehicle_maintenance_programs' 
    AND INDEX_NAME = 'idx_next_due_date'
);

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE vehicle_maintenance_programs ADD INDEX idx_next_due_date (next_due_date)',
    'SELECT "Índice idx_next_due_date ya existe" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo en phpMyAdmin
-- 2. Este script verifica si las columnas/índices existen antes de crearlos
-- 3. No generará errores si ya existen
-- 4. Después de ejecutar, regenera Prisma Client: npm run db:generate
-- 5. Reinicia el servidor: npm run dev
