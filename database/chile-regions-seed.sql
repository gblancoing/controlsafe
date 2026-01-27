-- ============================================
-- Regiones de Chile - Datos por Defecto
-- Insertar las 16 regiones oficiales de Chile
-- ============================================

USE controlsafe;

-- Insertar todas las regiones de Chile
INSERT INTO regions (id, name, code, country) VALUES
('reg-01', 'Región de Arica y Parinacota', 'XV', 'Chile'),
('reg-02', 'Región de Tarapacá', 'I', 'Chile'),
('reg-03', 'Región de Antofagasta', 'II', 'Chile'),
('reg-04', 'Región de Atacama', 'III', 'Chile'),
('reg-05', 'Región de Coquimbo', 'IV', 'Chile'),
('reg-06', 'Región de Valparaíso', 'V', 'Chile'),
('reg-07', 'Región Metropolitana de Santiago', 'RM', 'Chile'),
('reg-08', 'Región del Libertador General Bernardo O''Higgins', 'VI', 'Chile'),
('reg-09', 'Región del Maule', 'VII', 'Chile'),
('reg-10', 'Región de Ñuble', 'XVI', 'Chile'),
('reg-11', 'Región del Biobío', 'VIII', 'Chile'),
('reg-12', 'Región de La Araucanía', 'IX', 'Chile'),
('reg-13', 'Región de Los Ríos', 'XIV', 'Chile'),
('reg-14', 'Región de Los Lagos', 'X', 'Chile'),
('reg-15', 'Región de Aysén del General Carlos Ibáñez del Campo', 'XI', 'Chile'),
('reg-16', 'Región de Magallanes y de la Antártica Chilena', 'XII', 'Chile')
ON DUPLICATE KEY UPDATE name=VALUES(name), code=VALUES(code), country=VALUES(country);
