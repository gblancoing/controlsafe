# Solución: OPEN muestra "no se puede obtener acceso a esta página"

## Tu configuración está bien

- **Ruta del servidor:** `public_html/controlsafe.carenvp.cl/.next/standalone/controlsafe` con `server.js` y `node_modules` → correcto.
- **Application startup file:** `.next/standalone/controlsafe/server.js` → correcto.
- **Variables de entorno** (DATABASE_URL, NODE_ENV, etc.) → correctas.

El problema al hacer clic en **OPEN** no es la app ni la ruta, sino que el **dominio no se resuelve**.

---

## Error que ves

- Mensaje: **"No se puede obtener acceso a esta página"**.
- Código: **DNS_PROBE_FINISHED_NXDOMAIN**.

Eso significa: el navegador **no puede resolver** el nombre `controlsafe.carenvp.cl` a una IP. Es un problema de **DNS**, no de que la aplicación esté mal configurada o no arranque.

---

## Qué hacer (en orden)

### 1. Comprobar el subdominio en cPanel

1. Entra a **cPanel → Subdomains** (o **Subdominios**).
2. Busca **controlsafe.carenvp.cl**.
3. Comprueba:
   - Que exista.
   - Que esté **activado** (On).
   - Que el **Document Root** sea: `public_html/controlsafe.carenvp.cl`.

Si no existe o está apagado, créalo o actívalo y espera unos minutos.

---

### 2. Probar desde el servidor (sin usar el dominio)

Para saber si la app **sí está funcionando** y el fallo es solo DNS:

- Si tienes **SSH**: después de conectarte, puedes hacer:
  ```bash
  curl -I http://127.0.0.1:PUERTO
  ```
  (El puerto lo asigna cPanel/Passenger; a veces se ve en la configuración de la app Node.js.)
- O pide al **soporte del hosting** que comprueben si la aplicación responde en el servidor (por IP o por localhost). Si responde ahí, el problema es solo DNS.

---

### 3. Esperar propagación DNS

- Si acabas de crear o activar el subdominio, el DNS puede tardar **15–30 minutos** (a veces más).
- Prueba de nuevo más tarde.
- Prueba desde **otro navegador**, **modo incógnito** o **otro dispositivo/red** (por ejemplo, datos del móvil) por si tu red tiene caché DNS antigua.

---

### 4. Hablar con el soporte del hosting

Si después de 24 h sigue igual:

- Diles que **controlsafe.carenvp.cl** no resuelve (DNS_PROBE_FINISHED_NXDOMAIN).
- Pregunta si el subdominio está bien configurado en sus DNS y si hay que crear algún registro (A, CNAME, etc.) para ese subdominio.

---

## Resumen

| Qué | Estado |
|-----|--------|
| Ruta y `server.js` en `.next/standalone/controlsafe` | Correcto |
| Application startup file | Correcto |
| Variables de entorno | Correctas |
| Error al hacer clic en OPEN | **DNS**: el dominio no resuelve |

Siguiente paso: revisar **Subdomains** en cPanel (que exista y esté On), esperar propagación y, si sigue fallando, contactar al hosting para que revisen el DNS del subdominio.

**Última actualización:** Enero 2026
