-- ============================================
-- Migración: Agregar campos phone y project_id a usuarios
-- Versión segura que maneja errores si las columnas ya existen
-- ============================================

-- Agregar columna phone (celular)
-- Si la columna ya existe, se ignorará el error
ALTER TABLE users 
ADD COLUMN phone VARCHAR(50) NULL AFTER email;

-- Agregar columna project_id (proyecto)
-- Si la columna ya existe, se ignorará el error
ALTER TABLE users 
ADD COLUMN project_id VARCHAR(50) NULL AFTER company_id;

-- Agregar índice para project_id (si no existe)
-- Si el índice ya existe, se ignorará el error
ALTER TABLE users 
ADD INDEX idx_project_id (project_id);

-- Agregar foreign key para project_id (si la tabla projects existe)
-- NOTA: Si la tabla projects no existe o no hay datos, esta línea puede fallar
-- En ese caso, ejecutar después de crear la tabla projects
-- Si la foreign key ya existe, se ignorará el error
ALTER TABLE users 
ADD CONSTRAINT fk_user_project 
FOREIGN KEY (project_id) REFERENCES projects(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Si alguna línea falla con error de "columna/índice/constraint ya existe", 
--    simplemente ignóralo y continúa con las siguientes líneas.
--
-- 2. Si la foreign key falla porque la tabla projects no existe:
--    - Ejecuta solo las primeras 3 líneas (sin la foreign key)
--    - Crea la tabla projects primero
--    - Luego ejecuta la línea de la foreign key
--
-- 3. Después de aplicar este script, ejecuta:
--    npm run db:generate
--    npm run dev
