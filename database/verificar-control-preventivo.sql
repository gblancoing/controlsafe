-- ============================================
-- Script de Verificación: Control Preventivo
-- ============================================
-- Este script ayuda a diagnosticar por qué no aparecen
-- registros en Control Preventivo

USE controlsafe;

-- 1. Verificar que existe la tabla
SELECT 
    'Tabla vehicle_maintenance_programs existe' as verificacion,
    COUNT(*) as total_registros
FROM information_schema.tables 
WHERE table_schema = 'controlsafe' 
AND table_name = 'vehicle_maintenance_programs';

-- 2. Contar asignaciones totales
SELECT 
    'Total asignaciones' as verificacion,
    COUNT(*) as total
FROM vehicle_maintenance_programs;

-- 3. Ver todas las asignaciones con detalles
SELECT 
    vmp.id as asignacion_id,
    v.id as vehiculo_id,
    v.name as vehiculo_nombre,
    v.patent as patente,
    mp.id as programa_id,
    mp.name as programa_nombre,
    mp.frequency_value as frecuencia_valor,
    mp.frequency_unit as frecuencia_unidad,
    mp.use_business_days as solo_dias_habiles,
    vmp.next_due_date as proxima_revision,
    vmp.last_reset_date as ultimo_reset,
    vmp.scheduled_time as hora_programada,
    vmp.created_at as fecha_asignacion,
    CASE 
        WHEN vmp.next_due_date IS NULL THEN 'SIN FECHA CALCULADA'
        WHEN vmp.next_due_date < NOW() THEN 'VENCIDO'
        WHEN vmp.next_due_date <= DATE_ADD(NOW(), INTERVAL 7 DAY) THEN 'POR VENCER'
        ELSE 'PENDIENTE'
    END as estado_calculado
FROM vehicle_maintenance_programs vmp
LEFT JOIN vehicles v ON vmp.vehicle_id = v.id
LEFT JOIN maintenance_programs mp ON vmp.program_id = mp.id
ORDER BY vmp.created_at DESC;

-- 4. Verificar campos de la tabla
DESCRIBE vehicle_maintenance_programs;

-- 5. Verificar que los vehículos y programas existen
SELECT 
    'Vehículos totales' as tipo,
    COUNT(*) as total
FROM vehicles
UNION ALL
SELECT 
    'Programas totales' as tipo,
    COUNT(*) as total
FROM maintenance_programs;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo en phpMyAdmin
-- 2. Revisa los resultados:
--    - Si "total_registros" es 0, no hay asignaciones
--    - Si hay asignaciones pero "proxima_revision" es NULL, 
--      el problema está en el cálculo de fechas
--    - Si hay asignaciones pero no aparecen en la UI,
--      puede ser un problema de Prisma Client desincronizado
-- 3. Si ves "SIN FECHA CALCULADA", ejecuta:
--    database/add-preventive-control-fields-safe.sql
-- 4. Si todo está bien pero no aparece en la UI, regenera Prisma Client:
--    npm run db:generate
