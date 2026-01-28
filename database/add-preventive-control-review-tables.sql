-- ============================================
-- Crear tablas para Revisiones de Controles Preventivos
-- ============================================

-- Seleccionar la base de datos
USE controlsafe;

-- ============================================
-- Tabla: preventive_control_reviews
-- ============================================
CREATE TABLE IF NOT EXISTS preventive_control_reviews (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_maintenance_program_id VARCHAR(50) NOT NULL,
    vehicle_id VARCHAR(50) NOT NULL,
    driver_id VARCHAR(50) NULL,
    reviewed_by VARCHAR(50) NOT NULL,
    review_date DATETIME NOT NULL,
    status ENUM('Approved', 'Rejected', 'UrgentRejected') NOT NULL,
    observations TEXT NULL,
    urgent_rejection_reason TEXT NULL,
    required_actions TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_maintenance_program_id) REFERENCES vehicle_maintenance_programs(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_vehicle_maintenance_program_id (vehicle_maintenance_program_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_review_date (review_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: review_checklist_items
-- ============================================
CREATE TABLE IF NOT EXISTS review_checklist_items (
    id VARCHAR(50) PRIMARY KEY,
    review_id VARCHAR(50) NOT NULL,
    program_task_id VARCHAR(50) NULL,
    item TEXT NOT NULL,
    checked BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    `order` INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES preventive_control_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (program_task_id) REFERENCES maintenance_program_tasks(id) ON DELETE SET NULL,
    INDEX idx_review_id (review_id),
    INDEX idx_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: review_photos
-- ============================================
CREATE TABLE IF NOT EXISTS review_photos (
    id VARCHAR(50) PRIMARY KEY,
    review_id VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    caption VARCHAR(255) NULL,
    `order` INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES preventive_control_reviews(id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id),
    INDEX idx_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Actualizar ENUM VehicleStatus para incluir "Not Allowed to Operate"
-- ============================================
-- NOTA: MySQL no permite ALTER ENUM directamente, necesitamos modificar la columna
ALTER TABLE vehicles 
MODIFY COLUMN status ENUM('Operational', 'Maintenance', 'Out of Service', 'Not Allowed to Operate') NOT NULL DEFAULT 'Operational';

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo en phpMyAdmin
-- 2. Si las tablas ya existen, verás errores que puedes IGNORAR
-- 3. Si el ENUM ya tiene el valor, verás un error que puedes IGNORAR
-- 4. Después de ejecutar, regenera Prisma Client: npm run db:generate
-- 5. Reinicia el servidor: npm run dev
