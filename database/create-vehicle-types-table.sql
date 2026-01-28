-- ============================================
-- Migración: Convertir VehicleType enum a tabla
-- ============================================

USE controlsafe;

-- Crear tabla vehicle_types
CREATE TABLE IF NOT EXISTS vehicle_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL, -- Nombre para mostrar en la UI
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar tipos existentes del enum
INSERT INTO vehicle_types (id, name, display_name, description, is_active) VALUES
  ('vt-excavator', 'Excavator', 'Excavadora', 'Maquinaria pesada para excavación', TRUE),
  ('vt-haul-truck', 'HaulTruck', 'Camión Minero', 'Vehículo de gran tonelaje para transporte de minerales', TRUE),
  ('vt-dozer', 'Dozer', 'Topadora', 'Maquinaria pesada para movimiento de tierra', TRUE),
  ('vt-loader', 'Loader', 'Cargador', 'Maquinaria pesada para carga de materiales', TRUE),
  ('vt-camioneta', 'Camioneta', 'Camioneta', 'Vehículo liviano tipo camioneta', TRUE)
ON DUPLICATE KEY UPDATE 
  display_name = VALUES(display_name),
  description = VALUES(description);

-- Agregar columna temporal para migración
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_type_id VARCHAR(50) NULL AFTER type;

-- Migrar datos existentes
UPDATE vehicles SET vehicle_type_id = 'vt-excavator' WHERE type = 'Excavator';
UPDATE vehicles SET vehicle_type_id = 'vt-haul-truck' WHERE type = 'HaulTruck';
UPDATE vehicles SET vehicle_type_id = 'vt-dozer' WHERE type = 'Dozer';
UPDATE vehicles SET vehicle_type_id = 'vt-loader' WHERE type = 'Loader';
UPDATE vehicles SET vehicle_type_id = 'vt-camioneta' WHERE type = 'Camioneta';

-- Agregar foreign key (temporalmente permitir NULL para vehículos sin tipo)
ALTER TABLE vehicles 
  ADD CONSTRAINT fk_vehicle_type 
  FOREIGN KEY (vehicle_type_id) 
  REFERENCES vehicle_types(id) 
  ON DELETE SET NULL;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_vehicle_type_id ON vehicles(vehicle_type_id);

-- NOTA: No eliminamos la columna 'type' todavía para mantener compatibilidad
-- Se eliminará en una migración posterior después de verificar que todo funciona
