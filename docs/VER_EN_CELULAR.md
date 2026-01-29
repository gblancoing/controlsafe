# Ver la app en el celular (o tablet) mientras desarrollas

Puedes abrir la aplicación en el navegador del celular/tablet y ver los cambios en tiempo real, **sin instalar extensiones ni apps** en el dispositivo.

La app es **PWA (Progressive Web App)**:
- En el celular puedes **instalarla** desde el navegador (“Añadir a la pantalla de inicio” / “Instalar app”) y se abrirá a pantalla completa, como una app nativa.
- Barra de estado con color de la marca, icono “CS” en la pantalla de inicio.

## Requisitos

- **Misma red WiFi:** El PC y el celular/tablet deben estar en la misma red (mismo router).
- **Servidor de desarrollo en marcha:** `npm run dev` en el PC.

## Pasos

### 1. Arrancar el servidor de desarrollo

En la carpeta del proyecto:

```bash
npm run dev
```

El servidor ya está configurado para escuchar en toda la red local (`-H 0.0.0.0`), no solo en tu PC.

### 2. Obtener la IP de tu PC (Windows)

En PowerShell o CMD:

```powershell
ipconfig
```

Busca la sección **Adaptador de LAN inalámbrica Wi-Fi** (o **Ethernet** si usas cable). Anota la **Dirección IPv4**, por ejemplo: `192.168.1.105`.

### 3. Abrir en el celular o tablet

En el navegador del celular/tablet escribe:

```
http://<TU_IP>:9002
```

Ejemplo: si tu IP es `192.168.1.105`:

```
http://192.168.1.105:9002
```

Abre esa URL en el navegador (Chrome, Safari, etc.). No hace falta instalar nada en el dispositivo.

### 4. Ver los cambios en vivo

Con el servidor de desarrollo activo, cada vez que guardes cambios en el código, la página se actualizará en el celular/tablet (hot reload). Si no se actualiza sola, recarga manualmente en el dispositivo.

---

## Resumen

| En el PC | En el celular/tablet |
|----------|----------------------|
| `npm run dev` | Misma WiFi |
| Anotar IP con `ipconfig` | Abrir `http://<IP>:9002` en el navegador |
| — | **No hace falta extensión ni app** |

---

## Instalar como app en el celular (PWA)

1. Abre la URL de la app en el navegador del celular (Chrome, Safari, Edge, etc.).
2. **Android (Chrome):** Menú (⋮) → “Instalar aplicación” o “Añadir a la pantalla de inicio”.
3. **iPhone (Safari):** Botón “Compartir” → “Añadir a la pantalla de inicio”.
4. Tras instalarla, ábrela desde el icono “ControlSafe” en la pantalla de inicio: se abrirá a **pantalla completa**, sin barra del navegador, como una app móvil.

---

## Si no carga en el celular

- **Firewall de Windows:** Puede bloquear el puerto 9002. Si no carga, en “Firewall de Windows Defender” agrega una regla de entrada para el puerto **9002** (TCP) o permite temporalmente Node/npm.
- **Antivirus:** A veces bloquea conexiones entrantes; prueba desactivar temporalmente o permitir Node.
- **IP correcta:** Asegúrate de usar la IPv4 del adaptador WiFi (o Ethernet) por el que estás conectado a la red.
