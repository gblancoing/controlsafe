-- ============================================
-- Agregar campos de documentación y estado a vehicles
-- ============================================

USE controlsafe;

-- Agregar campos de estado operativo y revisión técnica
ALTER TABLE vehicles 
ADD COLUMN is_operational BOOLEAN DEFAULT TRUE 
COMMENT 'true = Operativo, false = Inoperativo'
AFTER company_id,
ADD COLUMN technical_review_date DATETIME NULL 
COMMENT 'Fecha de la última revisión técnica'
AFTER is_operational,
ADD COLUMN technical_review_expiry_date DATETIME NULL 
COMMENT 'Fecha de vencimiento de la revisión técnica'
AFTER technical_review_date,
ADD COLUMN circulation_permit_status VARCHAR(50) NULL 
COMMENT 'Estado del permiso de circulación: Vigente, Vencido, Pendiente'
AFTER technical_review_expiry_date;

-- Crear índices para mejorar consultas
CREATE INDEX idx_is_operational ON vehicles(is_operational);
CREATE INDEX idx_technical_review_expiry_date ON vehicles(technical_review_expiry_date);
CREATE INDEX idx_circulation_permit_status ON vehicles(circulation_permit_status);

-- ============================================
-- Tabla: vehicle_documents
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_documents (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'photo, technical_review, circulation_permit, manufacturer_doc, other',
    url VARCHAR(500) NOT NULL,
    caption VARCHAR(255) NULL,
    file_name VARCHAR(255) NULL,
    file_size INT NULL COMMENT 'Tamaño en bytes',
    mime_type VARCHAR(100) NULL,
    `order` INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_type (type),
    INDEX idx_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo en phpMyAdmin
-- 2. Si las columnas ya existen, verás errores que puedes IGNORAR (#1060)
-- 3. Si los índices ya existen, verás errores que puedes IGNORAR (#1061)
-- 4. Si la tabla ya existe, verás un error que puedes IGNORAR
-- 5. Después de ejecutar, regenera Prisma Client: npm run db:generate
-- 6. Reinicia el servidor: npm run dev
