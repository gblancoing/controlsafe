-- ============================================
-- Crear tablas para sistema de notificaciones y mensajes masivos
-- ============================================

USE controlsafe;

-- Crear tabla notification_policies
CREATE TABLE IF NOT EXISTS notification_policies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  metric_type VARCHAR(100) NOT NULL,
  days_before INT DEFAULT 7,
  email_template TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_enabled (enabled),
  INDEX idx_metric_type (metric_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla bulk_messages
CREATE TABLE IF NOT EXISTS bulk_messages (
  id VARCHAR(36) PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient_type VARCHAR(50) NOT NULL,
  recipient_ids TEXT,
  sent_by VARCHAR(50) NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_recipients INT DEFAULT 0,
  success_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sent_by (sent_by),
  INDEX idx_sent_at (sent_at),
  INDEX idx_recipient_type (recipient_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar políticas de notificación por defecto
INSERT INTO notification_policies (id, name, description, enabled, metric_type, days_before, email_template) VALUES
('notif-001', 'Mantenimiento Preventivo por Vencer', 'Notifica a los usuarios cuando sus vehículos asignados tienen mantenimiento preventivo próximo a vencer', TRUE, 'maintenance_due', 7, NULL),
('notif-002', 'Documentos por Vencer', 'Notifica cuando documentos de vehículos están próximos a vencer', TRUE, 'document_expiry', 30, NULL),
('notif-003', 'Inspección de Vehículo', 'Notifica sobre inspecciones programadas de vehículos', TRUE, 'vehicle_inspection', 3, NULL),
('notif-004', 'Renovación de Licencia', 'Notifica sobre renovaciones de licencias de conducir', TRUE, 'license_renewal', 60, NULL)
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo en MySQL
-- 2. Después de ejecutar, verifica que las tablas existen:
--    SHOW TABLES LIKE 'notification%';
--    SHOW TABLES LIKE 'bulk_messages';
-- 3. Luego ejecuta: npm run db:generate
-- 4. Finalmente: npm run dev
