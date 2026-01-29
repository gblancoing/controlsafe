# Carpeta `public/`

Estructura esperada de la carpeta **public** del proyecto ControlSafe.

## Estructura en el repositorio (lo que debe estar en Git)

```
public/
├── flota.jpg              # (opcional) Imagen u otros assets estáticos
└── uploads/
    └── .gitkeep           # Mantiene la carpeta en Git; los archivos subidos están en .gitignore
```

- **`public/`**: Raíz de archivos estáticos de Next.js (favicon, imágenes globales, etc.).
- **`public/uploads/`**: Carpeta base para archivos subidos por la aplicación. Debe existir en el repo (por eso está `uploads/.gitkeep`). El contenido real (archivos de usuarios) **no** se versiona: está en `.gitignore` (`/public/uploads/*` con excepción de `.gitkeep`).

## Estructura en runtime (se crea al usar la app)

Al subir documentos o fotos, la aplicación crea estas subcarpetas bajo `public/uploads/`:

```
public/
├── flota.jpg
└── uploads/
    ├── .gitkeep
    ├── vehicles/                    # Documentos de vehículos (flota)
    │   └── {vehicleId}/             # Una carpeta por vehículo
    │       └── *.pdf, *.jpg, ...   # Archivos subidos
    └── reviews/                     # Fotos de revisiones (Control Preventivo)
        └── {reviewId}/             # Una carpeta por revisión
            └── *.jpg, *.png, ...   # Fotografías de la revisión
```

- **`uploads/vehicles/{vehicleId}/`**: Documentos adjuntos del vehículo (revisión técnica, permiso de circulación, etc.). Se crea al guardar el primer archivo en Flota → documento del vehículo.
- **`uploads/reviews/{reviewId}/`**: Fotos de la revisión de control preventivo. Se crea al adjuntar la primera foto en “Revisar Control Preventivo”.

Las carpetas `vehicles/` y `reviews/` (y sus subcarpetas) se crean automáticamente al subir el primer archivo; no es necesario crearlas a mano.

## Despliegue (producción / ZIP)

1. En el paquete de despliegue debe ir:
   - `public/` con `flota.jpg` (si se usa) y `public/uploads/.gitkeep`.
2. En el servidor, la ruta `public/uploads` debe ser **escribible** por el proceso de Node/Next.js (permisos de escritura).
3. Los archivos ya subidos en otro entorno no se incluyen en el ZIP; en producción se irán generando de nuevo según los usuarios suban documentos y fotos.

## Resumen

| Ruta                         | En Git / ZIP      | Se crea en runtime |
|-----------------------------|-------------------|---------------------|
| `public/flota.jpg`          | Sí (si existe)    | No                  |
| `public/uploads/.gitkeep`   | Sí                | No                  |
| `public/uploads/vehicles/*` | No                | Sí (al subir docs)  |
| `public/uploads/reviews/*`  | No                | Sí (al subir fotos) |

Así debe quedar la carpeta **public**: solo lo estático y `uploads/.gitkeep` versionados; el resto de `uploads/` se genera en ejecución.
