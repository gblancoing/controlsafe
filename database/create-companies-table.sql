-- ============================================
-- Crear tabla companies (Empresas)
-- Script simple y directo
-- ============================================

USE controlsafe;

-- Crear tabla companies si no existe
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Mandante', 'Subcontratista') NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Chile',
    rut VARCHAR(50) NULL,
    address TEXT NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    contact_person VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de ejemplo
INSERT INTO companies (id, name, type, country) VALUES
('comp-001', 'Acciona', 'Subcontratista', 'Chile'),
('comp-002', 'Aliservice', 'Subcontratista', 'Chile'),
('comp-003', 'Codelco', 'Mandante', 'Chile'),
('comp-004', 'JEJ Ingeniería', 'Subcontratista', 'Chile')
ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), country=VALUES(country);
