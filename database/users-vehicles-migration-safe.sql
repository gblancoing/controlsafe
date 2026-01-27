-- ============================================
-- Migración: Usuarios con Empresas y Asignación de Vehículos
-- Versión Segura (ignora errores si ya existen)
-- ============================================

-- NOTA: Ejecuta este script completo. Si alguna columna ya existe, 
-- simplemente verás un error que puedes ignorar y continuar.

-- ============================================
-- Paso 1: Agregar campo company_id
-- ============================================
-- Si la columna ya existe, verás un error #1060 que puedes ignorar
ALTER TABLE users 
ADD COLUMN company_id VARCHAR(50) NULL AFTER role;

-- ============================================
-- Paso 2: Agregar campo driver_type
-- ============================================
-- Si la columna ya existe, verás un error #1060 que puedes ignorar
ALTER TABLE users 
ADD COLUMN driver_type ENUM('Administrativo', 'Normal') NULL AFTER company_id;

-- ============================================
-- Paso 3: Agregar índice para company_id
-- ============================================
-- Si el índice ya existe, verás un error #1061 que puedes ignorar
ALTER TABLE users 
ADD INDEX idx_company_id (company_id);

-- ============================================
-- Paso 4: Agregar foreign key para company_id
-- ============================================
-- Si la foreign key ya existe, verás un error #1005 o #1022 que puedes ignorar
ALTER TABLE users 
ADD CONSTRAINT fk_user_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- ============================================
-- Paso 5: Crear tabla user_vehicles
-- ============================================
-- Esta tabla se crea solo si no existe (CREATE TABLE IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS user_vehicles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    vehicle_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_vehicle (user_id, vehicle_id),
    INDEX idx_user_id (user_id),
    INDEX idx_vehicle_id (vehicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
