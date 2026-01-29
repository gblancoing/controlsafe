-- Agregar rol "Super Admin" al enum de usuarios
-- Ejecutar en MySQL antes de usar el nuevo rol en la aplicación

-- MySQL: agregar nuevo valor al ENUM role en tabla users
ALTER TABLE users
  MODIFY COLUMN role ENUM('SuperAdmin', 'Administrator', 'Supervisor', 'Technician', 'Driver')
  NOT NULL;
