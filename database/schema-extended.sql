-- ============================================
-- ControlSafe - Extensiones del Esquema
-- Tablas adicionales para CRUD completo
-- ============================================

USE controlsafe;

-- ============================================
-- Tabla: companies (Empresas)
-- ============================================
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

-- ============================================
-- Tabla: regions (Regiones)
-- ============================================
CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NULL,
    country VARCHAR(100) DEFAULT 'Chile',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: sites (Faenas)
-- ============================================
CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region_id VARCHAR(50) NULL,
    company_id VARCHAR(50) NULL,
    address TEXT NULL,
    coordinates VARCHAR(255) NULL, -- Latitud, Longitud
    status ENUM('Active', 'Inactive', 'Closed') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_status (status),
    INDEX idx_region_id (region_id),
    INDEX idx_company_id (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Actualizar tabla vehicles para usar site_id
-- ============================================
-- Primero agregamos la columna site_id
ALTER TABLE vehicles 
ADD COLUMN site_id VARCHAR(50) NULL AFTER site,
ADD INDEX idx_site_id (site_id),
ADD FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL;

-- Migrar datos existentes (crear sites desde los valores únicos de site)
INSERT INTO sites (id, name, status)
SELECT 
    CONCAT('site-', LPAD(ROW_NUMBER() OVER (ORDER BY site), 3, '0')) as id,
    site as name,
    'Active' as status
FROM (
    SELECT DISTINCT site FROM vehicles WHERE site IS NOT NULL AND site != ''
) as unique_sites
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Actualizar vehicles con site_id
UPDATE vehicles v
INNER JOIN sites s ON v.site = s.name
SET v.site_id = s.id;

-- ============================================
-- Datos iniciales de ejemplo
-- ============================================
INSERT INTO companies (id, name, rut, address, phone, email, contact_person) VALUES
('comp-001', 'Minera ControlSafe S.A.', '76.123.456-7', 'Av. Principal 123, Santiago', '+56 2 2345 6789', 'contacto@controlsafe.cl', 'Juan Pérez')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO regions (id, name, code, country) VALUES
('reg-001', 'Región de Antofagasta', 'II', 'Chile'),
('reg-002', 'Región de Atacama', 'III', 'Chile'),
('reg-003', 'Región de Coquimbo', 'IV', 'Chile')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Actualizar sites existentes con region_id y company_id
UPDATE sites SET region_id = 'reg-001', company_id = 'comp-001' WHERE name IN ('Cantera Alfa', 'Mina Bravo', 'Foso Charlie');
