-- ============================================
-- Migración: Agregar campos phone y project_id a usuarios
-- ============================================

-- Agregar columna phone (celular)
ALTER TABLE users 
ADD COLUMN phone VARCHAR(50) NULL AFTER email;

-- Agregar columna project_id (proyecto)
ALTER TABLE users 
ADD COLUMN project_id VARCHAR(50) NULL AFTER company_id;

-- Agregar índice para project_id
ALTER TABLE users 
ADD INDEX idx_project_id (project_id);

-- Agregar foreign key para project_id (si la tabla projects existe)
-- NOTA: Si la tabla projects no existe o no hay datos, esta línea puede fallar
-- En ese caso, ejecutar después de crear la tabla projects
ALTER TABLE users 
ADD CONSTRAINT fk_user_project 
FOREIGN KEY (project_id) REFERENCES projects(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;
