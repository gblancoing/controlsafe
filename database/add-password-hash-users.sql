-- Añadir columna password_hash a users para login con MySQL (bcrypt)
-- Ejecutar en MySQL antes de usar el login sin Firebase.

ALTER TABLE users
ADD COLUMN password_hash VARCHAR(255) NULL DEFAULT NULL AFTER email;

-- Índice no necesario para login (ya se busca por email).
