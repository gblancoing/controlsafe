-- ============================================
-- Crear tabla para tokens de recuperación de contraseña
-- ============================================

USE controlsafe;

-- Crear tabla password_reset_tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id VARCHAR(36) PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo en MySQL
-- 2. Después de ejecutar, verifica que la tabla existe:
--    SHOW TABLES LIKE 'password_reset_tokens';
-- 3. Luego ejecuta: npm run db:generate
-- 4. Finalmente: npm run dev
