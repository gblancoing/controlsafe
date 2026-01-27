-- ============================================
-- Agregar campo applicable_vehicle_type a maintenance_programs
-- ============================================

-- Agregar columna applicable_vehicle_type
ALTER TABLE maintenance_programs 
ADD COLUMN applicable_vehicle_type VARCHAR(50) NULL AFTER description;

-- Agregar índice para mejorar búsquedas
ALTER TABLE maintenance_programs 
ADD INDEX idx_applicable_vehicle_type (applicable_vehicle_type);

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script en phpMyAdmin o tu cliente MySQL
-- 2. Si la columna ya existe, verás un error #1060 que puedes IGNORAR
-- 3. Si el índice ya existe, verás un error #1061 que puedes IGNORAR
-- 4. Después de ejecutar, regenera Prisma Client: npm run db:generate
-- 5. Reinicia el servidor: npm run dev
