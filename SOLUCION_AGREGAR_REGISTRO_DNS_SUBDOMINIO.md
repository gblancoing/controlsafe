# Solución: Agregar registro DNS para controlsafe.carenvp.cl

## Lo que muestran tus pantallas

1. **Dominios:** `controlsafe.carenvp.cl` existe y tiene directorio raíz `/public_html/controlsafe.carenvp.cl` → correcto.
2. **Monitorizar DNS:** Error **"Host controlsafe.carenvp.cl no encontrado: 3(NXDOMAIN)"** → en la zona DNS **no hay** un registro que apunte ese nombre al servidor.

El dominio está creado en cPanel, pero la **zona DNS** del dominio `carenvp.cl` no tiene un registro (A o CNAME) para el subdominio `controlsafe.carenvp.cl`. Por eso el navegador no puede resolver el nombre.

---

## Qué hacer: agregar el registro en la zona DNS

### Paso 1: Ir al editor de zonas DNS

1. En **cPanel** busca la sección **Dominios** (o **Domains**).
2. Abre **Editor de zonas** / **Zone Editor** / **Advanced DNS Zone Editor** (el nombre puede variar según tu cPanel).
3. Elige el dominio **carenvp.cl** (no el subdominio).

### Paso 2: Añadir un registro A para controlsafe.carenvp.cl

1. En la zona de **carenvp.cl** haz clic en **+ A Record** / **Add A Record** / **Añadir registro A** (o similar).
2. Completa:
   - **Name / Nombre:** `controlsafe` (solo la parte del subdominio; el sistema suele añadir `.carenvp.cl`).
   - **Address / Dirección:** la **IP del servidor** donde está alojada la cuenta (la misma IP del dominio principal `carenvp.cl`).
3. **TTL:** puedes dejar el valor por defecto (por ejemplo 14400 o 3600).
4. Guarda el registro.

Si en tu panel el nombre se escribe completo, usa `controlsafe.carenvp.cl` como nombre del registro.

### Paso 3: Comprobar la IP del servidor

- En cPanel suele haber **Información del servidor** / **Server Information** donde aparece la IP.
- O usa la IP que ya tenga el dominio principal `carenvp.cl` en su registro A (esa misma es la que debe usar `controlsafe.carenvp.cl`).

### Paso 4: Esperar propagación

- Los cambios DNS pueden tardar **unos minutos hasta 24–48 horas**.
- Pasados unos minutos, prueba de nuevo en el navegador: `https://controlsafe.carenvp.cl`.
- Opcional: en **Monitorizar DNS** vuelve a comprobar; cuando el registro exista y esté propagado, el error NXDOMAIN debería desaparecer.

---

## Si no ves "Editor de zonas" en cPanel

- Algunos planes usan **DNS externo** (por ejemplo en el registrador del dominio). En ese caso:
  1. Entra al panel donde gestionas el DNS de **carenvp.cl** (registrador o proveedor DNS).
  2. Añade un registro **A** (o **CNAME** si te lo indican):
     - **Nombre:** `controlsafe` (o `controlsafe.carenvp.cl`, según el panel).
     - **Valor / Apunta a:** la IP del servidor de hosting (la misma de carenvp.cl).
  3. Guarda y espera la propagación.

- Si no sabes dónde se gestiona el DNS, pregunta al **soporte del hosting** (Wirenet Chile, por los nameservers que aparecen): "Necesito un registro A para controlsafe.carenvp.cl apuntando a la IP del servidor. ¿Lo agrego en cPanel Zone Editor o en otro sitio?"

---

## Resumen

| Problema | controlsafe.carenvp.cl no resuelve (NXDOMAIN). |
|----------|--------------------------------------------------|
| Causa   | Falta el registro A (o CNAME) del subdominio en la zona DNS. |
| Solución | En **Editor de zonas** de **carenvp.cl**, agregar registro **A** para `controlsafe` con la IP del servidor. |
| Después | Esperar propagación y probar de nuevo; opcionalmente comprobar en Monitorizar DNS. |

**Última actualización:** Enero 2026
