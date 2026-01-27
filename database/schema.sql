-- ============================================
-- ControlSafe - Esquema de Base de Datos MySQL
-- ============================================
-- Base de datos para sistema de control de seguridad minera
-- Migración desde datos mock a MySQL

CREATE DATABASE IF NOT EXISTS controlsafe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE controlsafe;

-- ============================================
-- Tabla: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('Administrator', 'Supervisor', 'Technician', 'Driver') NOT NULL,
    avatar_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: vehicles
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Excavator', 'Haul Truck', 'Dozer', 'Loader') NOT NULL,
    status ENUM('Operational', 'Maintenance', 'Out of Service') NOT NULL DEFAULT 'Operational',
    mileage INT UNSIGNED NOT NULL DEFAULT 0,
    operating_hours INT UNSIGNED NOT NULL DEFAULT 0,
    site VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_site (site)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: maintenance_tasks
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    task TEXT NOT NULL,
    due_date DATETIME NOT NULL,
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Overdue') NOT NULL DEFAULT 'Scheduled',
    priority ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
    assignee VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: torque_records
-- ============================================
CREATE TABLE IF NOT EXISTS torque_records (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    component VARCHAR(255) NOT NULL,
    required_torque DECIMAL(10, 2) NOT NULL,
    applied_torque DECIMAL(10, 2) NOT NULL,
    technician VARCHAR(255) NOT NULL,
    tool VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    status ENUM('OK', 'NOK') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: maintenance_records
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_records (
    record_id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    date DATETIME NOT NULL,
    description TEXT NOT NULL,
    technician VARCHAR(255) NOT NULL,
    operating_hours INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: maintenance_record_parts
-- ============================================
-- Tabla separada para las partes reemplazadas (normalización)
CREATE TABLE IF NOT EXISTS maintenance_record_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id VARCHAR(50) NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES maintenance_records(record_id) ON DELETE CASCADE,
    INDEX idx_record_id (record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Datos iniciales (seed data)
-- ============================================
INSERT INTO users (id, name, email, role, avatar_url) VALUES
('user-1', 'Usuario Admin', 'admin@scontrolsafe.com', 'Administrator', 'https://picsum.photos/seed/admin/100/100'),
('user-2', 'Juan Supervisor', 'juan.s@scontrolsafe.com', 'Supervisor', 'https://picsum.photos/seed/supervisor/100/100'),
('user-3', 'María Técnica', 'maria.t@scontrolsafe.com', 'Technician', 'https://picsum.photos/seed/technician/100/100')
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email);

INSERT INTO vehicles (id, name, type, status, mileage, operating_hours, site) VALUES
('vec-001', 'Excavadora EX-250', 'Excavator', 'Operational', 12530, 4500, 'Cantera Alfa'),
('vec-002', 'Camión Minero HT-80', 'Haul Truck', 'Maintenance', 45890, 9800, 'Cantera Alfa'),
('vec-003', 'Topadora DZ-110', 'Dozer', 'Operational', 8345, 3200, 'Mina Bravo'),
('vec-004', 'Cargador LD-500', 'Loader', 'Out of Service', 21760, 7100, 'Foso Charlie'),
('vec-005', 'Camión Minero HT-85', 'Haul Truck', 'Operational', 33200, 8500, 'Mina Bravo')
ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), status=VALUES(status);

INSERT INTO maintenance_tasks (id, vehicle_id, task, due_date, status, priority, assignee) VALUES
('task-1', 'vec-002', 'Cambio de aceite de motor', DATE_ADD(NOW(), INTERVAL 2 DAY), 'Scheduled', 'Medium', 'María Técnica'),
('task-2', 'vec-004', 'Revisión sistema hidráulico', DATE_SUB(NOW(), INTERVAL 5 DAY), 'Overdue', 'High', NULL),
('task-3', 'vec-001', 'Ajuste de tensión de orugas', DATE_ADD(NOW(), INTERVAL 7 DAY), 'Scheduled', 'Medium', 'María Técnica'),
('task-4', 'vec-005', 'Inspección sistema de frenos', DATE_ADD(NOW(), INTERVAL 10 DAY), 'Scheduled', 'High', 'Juan Supervisor'),
('task-5', 'vec-003', 'Cambio fluido de transmisión', DATE_SUB(NOW(), INTERVAL 1 DAY), 'Overdue', 'High', 'María Técnica')
ON DUPLICATE KEY UPDATE task=VALUES(task), due_date=VALUES(due_date), status=VALUES(status);

INSERT INTO torque_records (id, vehicle_id, component, required_torque, applied_torque, technician, tool, date, status) VALUES
('trq-1', 'vec-001', 'Tuercas rueda delantera izq.', 650.00, 655.00, 'María Técnica', 'Llave de torque TW-5000', DATE_SUB(NOW(), INTERVAL 1 DAY), 'OK'),
('trq-2', 'vec-002', 'Perno suspensión B-42', 800.00, 750.00, 'Carlos Ray', 'Llave de torque TW-5000', DATE_SUB(NOW(), INTERVAL 2 DAY), 'NOK'),
('trq-3', 'vec-001', 'Tuercas rueda trasera der.', 650.00, 648.00, 'María Técnica', 'Llave de torque TW-5000', DATE_SUB(NOW(), INTERVAL 8 DAY), 'OK'),
('trq-4', 'vec-003', 'Perno montaje de hoja', 1200.00, 1210.00, 'Frank Stone', 'Llave hidráulica HW-10', DATE_SUB(NOW(), INTERVAL 15 DAY), 'OK')
ON DUPLICATE KEY UPDATE component=VALUES(component), applied_torque=VALUES(applied_torque), status=VALUES(status);

-- Historial de mantenimiento para vec-001
INSERT INTO maintenance_records (record_id, vehicle_id, date, description, technician, operating_hours) VALUES
('hist-001', 'vec-001', '2023-11-15 00:00:00', 'Servicio programado de 1000 horas. Reemplazo de aceite de motor y filtros. Inspección general.', 'María Técnica', 3500),
('hist-002', 'vec-001', '2023-12-20 00:00:00', 'Reemplazo de diente de cucharón gastado. Operador reportó eficiencia de excavación reducida.', 'Juan Supervisor', 3750),
('hist-003', 'vec-001', '2024-01-18 00:00:00', 'Reemplazo de otro diente de cucharón gastado. Este es el segundo reemplazo en un mes.', 'María Técnica', 3950),
('hist-004', 'vec-001', '2024-02-05 00:00:00', 'Revisión de torque en todas las tuercas de las ruedas después de que el operador reportara vibración inusual. Todos los valores dentro de especificación.', 'María Técnica', 4100),
('hist-005', 'vec-001', '2024-02-25 00:00:00', 'Servicio programado de 1500 horas. Reemplazo de fluido hidráulico y filtro. Tensión de orugas ajustada.', 'María Técnica', 4250),
('hist-006', 'vec-001', '2024-03-10 00:00:00', 'Reparación de emergencia: reemplazo de manguera hidráulica con fuga en el brazo principal.', 'Juan Supervisor', 4380),
('hist-007', 'vec-001', '2024-03-12 00:00:00', 'Revisión de torque de seguimiento en los acoples de la manguera hidráulica de la reparación anterior. Todo seguro.', 'Juan Supervisor', 4390)
ON DUPLICATE KEY UPDATE description=VALUES(description), technician=VALUES(technician);

-- Partes reemplazadas
INSERT INTO maintenance_record_parts (record_id, part_name, quantity) VALUES
('hist-001', 'Filtro de aceite de motor', 1),
('hist-001', 'Filtro de combustible', 1),
('hist-002', 'Diente de cucharón, central', 1),
('hist-003', 'Diente de cucharón, esquina izq.', 1),
('hist-005', 'Filtro hidráulico', 1),
('hist-006', 'Ensamblaje manguera hidráulica H-123', 1)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
