/**
 * Script para ejecutar npm install en el servidor (cPanel).
 * Usa SOLO módulos integrados de Node.js (no requiere node_modules).
 * 
 * Uso en cPanel: Aplicaciones web Node.js → "Ejecutar script JS" → pegar este código.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Directorio de la aplicación (donde está package.json)
const appRoot = process.cwd();
const packageJsonPath = path.join(appRoot, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('ERROR: No se encontró package.json en', appRoot);
  process.exit(1);
}

console.log('Directorio de trabajo:', appRoot);
console.log('Ejecutando npm install...');
console.log('---');

try {
  execSync('npm install', {
    cwd: appRoot,
    stdio: 'inherit',
    env: process.env
  });
  console.log('---');
  console.log('OK: npm install completado.');
} catch (err) {
  console.error('ERROR al ejecutar npm install:', err.message);
  process.exit(1);
}
