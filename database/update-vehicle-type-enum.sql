-- ============================================
-- Actualizar ENUM VehicleType para incluir "Camioneta"
-- ============================================
-- Este script actualiza el ENUM en MySQL para incluir "Camioneta"
-- IMPORTANTE: MySQL no permite ALTER ENUM directamente, necesitamos recrear la columna

-- Paso 1: Verificar la estructura actual
-- Ejecuta primero: SHOW COLUMNS FROM vehicles LIKE 'type';

-- Paso 2: Modificar la columna type para incluir "Camioneta"
-- NOTA: Si la tabla tiene datos, haz un backup primero
ALTER TABLE vehicles 
MODIFY COLUMN type ENUM('Excavator', 'Haul Truck', 'Dozer', 'Loader', 'Camioneta') NOT NULL;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script en phpMyAdmin o tu cliente MySQL
-- 2. Si hay vehículos existentes, asegúrate de que sus valores de 'type' sean válidos
-- 3. Después de ejecutar, regenera Prisma Client: npm run db:generate
-- 4. Reinicia el servidor: npm run dev
