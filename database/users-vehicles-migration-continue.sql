-- ============================================
-- Migración: Continuación - Solo lo que falta
-- ============================================
-- Este script agrega solo lo que falta (asumiendo que company_id ya existe)

-- ============================================
-- Paso 1: Agregar campo driver_type
-- ============================================
-- Si la columna ya existe, verás un error #1060 que puedes ignorar
ALTER TABLE users 
ADD COLUMN driver_type ENUM('Administrativo', 'Normal') NULL AFTER company_id;

-- ============================================
-- Paso 2: Verificar/Agregar índice para company_id
-- ============================================
-- Si el índice ya existe, verás un error #1061 que puedes ignorar
ALTER TABLE users 
ADD INDEX idx_company_id (company_id);

-- ============================================
-- Paso 3: Verificar/Agregar foreign key para company_id
-- ============================================
-- Si la foreign key ya existe, verás un error #1005 o #1022 que puedes ignorar
ALTER TABLE users 
ADD CONSTRAINT fk_user_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- ============================================
-- Paso 4: Crear tabla user_vehicles
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
