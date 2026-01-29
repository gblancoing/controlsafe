-- Añadir columna "Check de verificación" a tipos de desviación
-- Los que tengan is_verification_check = 1 aparecen como ítems en el Check List de Revisión
-- Ejecutar en MySQL. Si la columna ya existe, ignorar el error.

ALTER TABLE deviation_types
  ADD COLUMN is_verification_check TINYINT(1) NOT NULL DEFAULT 0 AFTER is_predefined;
