-- ============================================
-- ControlSafe - Migración de Estructura Firebase
-- Adaptación de la estructura de Firebase a MySQL
-- ============================================

USE controlsafe;

-- ============================================
-- Tabla: projects (Proyectos)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255) NULL,
    client_company_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_name (name),
    INDEX idx_client_company_id (client_company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: project_subcontractors (Subcontratistas por Proyecto)
-- ============================================
CREATE TABLE IF NOT EXISTS project_subcontractors (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    company_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_company (project_id, company_id),
    INDEX idx_project_id (project_id),
    INDEX idx_company_id (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: maintenance_programs (Programas de Mantenimiento)
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_programs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    frequency_value INT NOT NULL DEFAULT 0,
    frequency_unit VARCHAR(50) NOT NULL DEFAULT 'Horas de Operación',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: maintenance_program_tasks (Tareas de Programas)
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_program_tasks (
    id VARCHAR(50) PRIMARY KEY,
    program_id VARCHAR(50) NOT NULL,
    task TEXT NOT NULL,
    `order` INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES maintenance_programs(id) ON DELETE CASCADE,
    INDEX idx_program_id (program_id),
    INDEX idx_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: vehicle_maintenance_programs (Vehículos - Programas)
-- Relación Many-to-Many
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_maintenance_programs (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    program_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES maintenance_programs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vehicle_program (vehicle_id, program_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_program_id (program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: interventions (Intervenciones)
-- Equivalente a la subcolección interventions de vehicles en Firebase
-- ============================================
CREATE TABLE IF NOT EXISTS interventions (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    task TEXT NOT NULL,
    date DATETIME NOT NULL,
    technician VARCHAR(255) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Actualizar tabla vehicles para incluir campos de Firebase
-- ============================================
-- NOTA: Si las columnas ya existen, estos comandos fallarán con error.
-- Si eso ocurre, simplemente ignora esos errores y continúa.

-- Agregar nuevas columnas a vehicles
ALTER TABLE vehicles 
ADD COLUMN patent VARCHAR(50) NULL AFTER id,
ADD COLUMN brand VARCHAR(255) NULL AFTER name,
ADD COLUMN model VARCHAR(255) NULL AFTER brand,
ADD COLUMN year SMALLINT NULL AFTER model,
ADD COLUMN company_id VARCHAR(50) NULL AFTER site_id;

-- Agregar índices
ALTER TABLE vehicles 
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_patent (patent);

-- Agregar foreign key para company_id
ALTER TABLE vehicles 
ADD CONSTRAINT fk_vehicle_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- ============================================
-- Datos de ejemplo
-- ============================================

-- Ejemplo de programa de mantenimiento
INSERT INTO maintenance_programs (id, name, description, frequency_value, frequency_unit) VALUES
('prog-001', 'Servicio de 1000 horas', 'Mantenimiento preventivo cada 1000 horas de operación', 1000, 'Horas de Operación'),
('prog-002', 'Servicio de 500 horas', 'Mantenimiento intermedio cada 500 horas', 500, 'Horas de Operación'),
('prog-003', 'Inspección Mensual', 'Inspección general mensual', 30, 'Días')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Ejemplo de tareas para el programa de 1000 horas
INSERT INTO maintenance_program_tasks (id, program_id, task, `order`) VALUES
('task-001', 'prog-001', 'Cambio de aceite del motor', 1),
('task-002', 'prog-001', 'Revisión de filtros', 2),
('task-003', 'prog-001', 'Inspección de neumáticos', 3),
('task-004', 'prog-001', 'Revisión de sistema hidráulico', 4)
ON DUPLICATE KEY UPDATE task=VALUES(task);

-- ============================================
-- Regiones de Chile - Datos por Defecto
-- ============================================
INSERT INTO regions (id, name, code, country) VALUES
('reg-01', 'Región de Arica y Parinacota', 'XV', 'Chile'),
('reg-02', 'Región de Tarapacá', 'I', 'Chile'),
('reg-03', 'Región de Antofagasta', 'II', 'Chile'),
('reg-04', 'Región de Atacama', 'III', 'Chile'),
('reg-05', 'Región de Coquimbo', 'IV', 'Chile'),
('reg-06', 'Región de Valparaíso', 'V', 'Chile'),
('reg-07', 'Región Metropolitana de Santiago', 'RM', 'Chile'),
('reg-08', 'Región del Libertador General Bernardo O''Higgins', 'VI', 'Chile'),
('reg-09', 'Región del Maule', 'VII', 'Chile'),
('reg-10', 'Región de Ñuble', 'XVI', 'Chile'),
('reg-11', 'Región del Biobío', 'VIII', 'Chile'),
('reg-12', 'Región de La Araucanía', 'IX', 'Chile'),
('reg-13', 'Región de Los Ríos', 'XIV', 'Chile'),
('reg-14', 'Región de Los Lagos', 'X', 'Chile'),
('reg-15', 'Región de Aysén del General Carlos Ibáñez del Campo', 'XI', 'Chile'),
('reg-16', 'Región de Magallanes y de la Antártica Chilena', 'XII', 'Chile')
ON DUPLICATE KEY UPDATE name=VALUES(name), code=VALUES(code), country=VALUES(country);
