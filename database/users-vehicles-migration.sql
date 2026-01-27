-- ============================================
-- Migración: Usuarios con Empresas y Asignación de Vehículos
-- ============================================
-- NOTA: Si alguna columna/índice ya existe, verás un error que puedes ignorar.
-- Si company_id ya existe, simplemente ignora el error #1060 y continúa.

-- Agregar campo company_id (si ya existe, verás error #1060 - IGNÓRALO y continúa)
-- Si este comando falla con error #1060, significa que ya existe - está bien, continúa
ALTER TABLE users 
ADD COLUMN company_id VARCHAR(50) NULL AFTER role;

-- Agregar campo driver_type (si ya existe, verás error #1060 - puedes ignorarlo)
ALTER TABLE users 
ADD COLUMN driver_type ENUM('Administrativo', 'Normal') NULL AFTER company_id;

-- Agregar índice para company_id (si ya existe, verás error #1061 - puedes ignorarlo)
ALTER TABLE users 
ADD INDEX idx_company_id (company_id);

-- Agregar foreign key para company_id (si ya existe, verás error #1005/#1022 - puedes ignorarlo)
ALTER TABLE users 
ADD CONSTRAINT fk_user_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- ============================================
-- Tabla: user_vehicles (Relación Usuario-Vehículo)
-- ============================================
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
