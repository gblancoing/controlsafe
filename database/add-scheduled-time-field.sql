-- ============================================
-- Agregar campo scheduled_time a vehicle_maintenance_programs
-- ============================================

-- Seleccionar la base de datos
USE controlsafe;

-- Agregar columna scheduled_time (hora programada HH:mm)
ALTER TABLE vehicle_maintenance_programs 
ADD COLUMN scheduled_time VARCHAR(10) NULL AFTER next_due_date;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script en phpMyAdmin o tu cliente MySQL
-- 2. Si la columna ya existe, verás un error #1060 que puedes IGNORAR
-- 3. Después de ejecutar, regenera Prisma Client: npm run db:generate
-- 4. Reinicia el servidor: npm run dev
