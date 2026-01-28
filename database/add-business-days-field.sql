-- ============================================
-- Agregar campo use_business_days a maintenance_programs
-- ============================================

USE controlsafe;

-- Agregar columna use_business_days (solo días hábiles L-V o días corridos)
ALTER TABLE maintenance_programs 
ADD COLUMN use_business_days BOOLEAN DEFAULT FALSE 
COMMENT 'true = Solo días hábiles (Lunes a Viernes), false = Días corridos'
AFTER frequency_unit;

-- Crear índice para mejorar consultas
CREATE INDEX idx_use_business_days ON maintenance_programs(use_business_days);

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo en phpMyAdmin
-- 2. Si la columna ya existe, verás un error que puedes IGNORAR (#1060)
-- 3. Si el índice ya existe, verás un error que puedes IGNORAR (#1061)
-- 4. Después de ejecutar, regenera Prisma Client: npm run db:generate
-- 5. Reinicia el servidor: npm run dev
