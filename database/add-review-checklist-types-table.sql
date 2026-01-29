-- Tabla: ítems del Check List de Revisión (Torque, Visual, Luces, etc.)
-- Solo los que tengan is_active = 1 se muestran en el formulario Revisar Control Preventivo
-- Ejecutar en MySQL. La app inserta los ítems predefinidos al cargar si la tabla está vacía.

CREATE TABLE IF NOT EXISTS review_checklist_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  `order` SMALLINT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
