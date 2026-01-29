-- ============================================
-- Tablas: Tipos de desviación y desviaciones por revisión
-- Para el checklist "Desviaciones detectadas" en Revisar Control Preventivo
-- ============================================
-- Ejecutar en MySQL (local y producción):
--   mysql -u usuario -p controlsafe < database/add-deviation-types-tables.sql
-- O desde MySQL Workbench / phpMyAdmin: pegar y ejecutar este script.
-- ============================================

USE controlsafe;

-- ============================================
-- Tabla: deviation_types (causas de desviación)
-- ============================================
CREATE TABLE IF NOT EXISTS deviation_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    `order` SMALLINT NOT NULL DEFAULT 0,
    is_predefined TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: review_deviations (desviaciones marcadas en cada revisión)
-- ============================================
CREATE TABLE IF NOT EXISTS review_deviations (
    id VARCHAR(50) PRIMARY KEY,
    review_id VARCHAR(50) NOT NULL,
    deviation_type_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_review_deviation (review_id, deviation_type_id),
    INDEX idx_review_id (review_id),
    INDEX idx_deviation_type_id (deviation_type_id),
    FOREIGN KEY (review_id) REFERENCES preventive_control_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (deviation_type_id) REFERENCES deviation_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insertar tipos de desviación predefinidos (solo si la tabla está vacía)
-- ============================================
INSERT INTO deviation_types (id, name, `order`, is_predefined)
SELECT id, name, `order`, is_predefined FROM (
    SELECT 'dt-def-1' AS id, 'Check Point desviados' AS name, 0 AS `order`, 1 AS is_predefined UNION ALL
    SELECT 'dt-def-2', 'Check point desviados / Tuerca o pernos sueltos', 1, 1 UNION ALL
    SELECT 'dt-def-3', 'Fuera de servicio', 2, 1 UNION ALL
    SELECT 'dt-def-4', 'Incumplimiento de fecha', 3, 1 UNION ALL
    SELECT 'dt-def-5', 'Neumaticos con cortes', 4, 1 UNION ALL
    SELECT 'dt-def-6', 'Incumplimiento de fecha revisión programada', 5, 1 UNION ALL
    SELECT 'dt-def-7', 'Sin Bitacora', 6, 1 UNION ALL
    SELECT 'dt-def-8', 'Sin brechas', 7, 1 UNION ALL
    SELECT 'dt-def-9', 'Sin Check Point o dañados', 8, 1 UNION ALL
    SELECT 'dt-def-10', 'Otros', 9, 1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM deviation_types LIMIT 1);

-- Si prefieres insertar siempre (y que falle si ya existen los IDs), usa esto en su lugar y comenta el bloque anterior:
/*
INSERT IGNORE INTO deviation_types (id, name, `order`, is_predefined) VALUES
('dt-def-1', 'Check Point desviados', 0, 1),
('dt-def-2', 'Check point desviados / Tuerca o pernos sueltos', 1, 1),
('dt-def-3', 'Fuera de servicio', 2, 1),
('dt-def-4', 'Incumplimiento de fecha', 3, 1),
('dt-def-5', 'Neumaticos con cortes', 4, 1),
('dt-def-6', 'Incumplimiento de fecha revisión programada', 5, 1),
('dt-def-7', 'Sin Bitacora', 6, 1),
('dt-def-8', 'Sin brechas', 7, 1),
('dt-def-9', 'Sin Check Point o dañados', 8, 1),
('dt-def-10', 'Otros', 9, 1);
*/
