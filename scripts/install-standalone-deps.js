/**
 * Instala dependencias (solo next) en .next/standalone/<subcarpeta> cuando existe
 * package.json y server.js ahí. Se ejecuta desde postinstall para que, al hacer
 * "Run NPM Install" en cPanel, se cree node_modules/next en la carpeta standalone
 * y desaparezca el error MODULE_NOT_FOUND en el servidor.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const standaloneDir = path.join(process.cwd(), '.next', 'standalone');
if (!fs.existsSync(standaloneDir)) return;

const subdirs = fs.readdirSync(standaloneDir);
for (const name of subdirs) {
  if (name === 'node_modules') continue;
  const subPath = path.join(standaloneDir, name);
  if (!fs.statSync(subPath).isDirectory()) continue;
  const pkgPath = path.join(subPath, 'package.json');
  const serverPath = path.join(subPath, 'server.js');
  if (!fs.existsSync(pkgPath) || !fs.existsSync(serverPath)) continue;
  try {
    execSync('npm install --production', { cwd: subPath, stdio: 'inherit' });
    console.log('Dependencias de standalone instaladas en', subPath);
  } catch (e) {
    console.warn('install-standalone-deps: no se pudo instalar en', subPath, e.message);
  }
  break; // solo la primera subcarpeta (controlsafe o nextn)
}
