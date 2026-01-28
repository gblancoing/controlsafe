    -- ============================================
    -- Agregar campos de seguimiento a vehicle_maintenance_programs
    -- ============================================

    -- Seleccionar la base de datos
    USE controlsafe;

    -- Agregar columna last_reset_date (última vez que se reseteó/completó)
    -- ⚠️ Si la columna ya existe, IGNORA el error #1060
    ALTER TABLE vehicle_maintenance_programs 
    ADD COLUMN last_reset_date DATETIME NULL AFTER program_id;

    -- Agregar columna next_due_date (próxima fecha de revisión calculada)
    -- ⚠️ Si la columna ya existe, IGNORA el error #1060
    ALTER TABLE vehicle_maintenance_programs 
    ADD COLUMN next_due_date DATETIME NULL AFTER last_reset_date;

    -- Agregar columna updated_at (fecha de última actualización)
    -- ⚠️ Si la columna ya existe, IGNORA el error #1060
    ALTER TABLE vehicle_maintenance_programs 
    ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

    -- Agregar índice para mejorar búsquedas por próxima fecha
    -- ⚠️ Si el índice ya existe, IGNORA el error #1061
    ALTER TABLE vehicle_maintenance_programs 
    ADD INDEX idx_next_due_date (next_due_date);

    -- ============================================
    -- INSTRUCCIONES:
    -- ============================================
    -- 1. Ejecuta este script en phpMyAdmin o tu cliente MySQL
    -- 2. Si las columnas ya existen, verás errores #1060 que puedes IGNORAR
    -- 3. Si el índice ya existe, verás un error #1061 que puedes IGNORAR
    -- 4. Después de ejecutar, regenera Prisma Client: npm run db:generate
    -- 5. Reinicia el servidor: npm run dev
