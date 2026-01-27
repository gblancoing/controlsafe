-- Datos iniciales de ejemplo para empresas
-- Basado en las imágenes proporcionadas

USE controlsafe;

INSERT INTO companies (id, name, type, country) VALUES
('comp-001', 'Acciona', 'Subcontratista', 'Chile'),
('comp-002', 'Aliservice', 'Subcontratista', 'Chile'),
('comp-003', 'Codelco', 'Mandante', 'Chile'),
('comp-004', 'JEJ Ingeniería', 'Subcontratista', 'Chile')
ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), country=VALUES(country);
