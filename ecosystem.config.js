// ============================================
// ControlSafe - Configuración PM2 para Producción
// ============================================
// Este archivo es útil si usas PM2 para gestionar el proceso Node.js
// Instalación: npm install -g pm2
// Uso: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'controlsafe',
      script: 'npm',
      args: 'start',
      cwd: '/public_html/controlsafe.carenvp.cl',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
    },
  ],
};
