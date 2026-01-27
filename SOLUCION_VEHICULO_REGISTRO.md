# Solución: Error al Registrar Vehículo - "Value '' not found in enum 'VehicleType'"

## Problema

El error indica que el valor del campo `type` está llegando como cadena vacía (`''`) al servidor, cuando debería ser uno de los valores válidos del enum `VehicleType`.

## Causas Posibles

1. **Prisma Client desactualizado**: Después de agregar "Camioneta" al enum, Prisma Client necesita regenerarse.
2. **El valor del Select no se está capturando**: Aunque se usa estado controlado, puede haber un problema de sincronización.

## Solución Paso a Paso

### Paso 1: Actualizar el ENUM en MySQL (IMPORTANTE)

**PRIMERO:** Debes actualizar el ENUM en la base de datos MySQL para incluir "Camioneta".

Ejecuta en phpMyAdmin o tu cliente MySQL el script:
**`database/update-vehicle-type-enum.sql`**

Este script actualiza la columna `type` en la tabla `vehicles` para incluir "Camioneta" en el ENUM.

### Paso 2: Regenerar Prisma Client

**DESPUÉS** de actualizar MySQL, regenera Prisma Client:

```powershell
# Detén el servidor si está corriendo (Ctrl+C)

# Regenera Prisma Client
npm run db:generate
```

### Paso 2: Reiniciar el Servidor

Reinicia completamente el servidor de desarrollo:

```powershell
# Si hay procesos de Node.js corriendo, deténlos primero
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Limpia la caché de Next.js (opcional pero recomendado)
Remove-Item -Recurse -Force .next

# Regenera Prisma Client nuevamente (por si acaso)
npm run db:generate

# Inicia el servidor
npm run dev
```

### Paso 3: Verificar en la Consola

Después de reiniciar, intenta registrar un vehículo nuevamente. Si el error persiste:

1. Abre la consola del navegador (F12)
2. Busca los mensajes de `console.log` que muestran:
   - "Enviando vehículo con tipo: [valor]"
   - "createVehicle recibió: [objeto]"
3. Verifica que el tipo no esté vacío

### Paso 4: Verificar el Schema de Prisma

Asegúrate de que el enum `VehicleType` en `prisma/schema.prisma` incluya "Camioneta":

```prisma
enum VehicleType {
  Excavator
  HaulTruck @map("Haul Truck")
  Dozer
  Loader
  Camioneta
}
```

## Si el Error Persiste

Si después de estos pasos el error continúa:

1. **Verifica que seleccionaste un tipo**: Asegúrate de que el campo "Tipo" tenga un valor seleccionado antes de enviar el formulario.

2. **Revisa los logs del servidor**: En la terminal donde corre `npm run dev`, busca mensajes de error que indiquen qué valor está recibiendo.

3. **Verifica la base de datos**: Asegúrate de que la columna `type` en la tabla `vehicles` acepte el valor "Camioneta". Puedes verificar con:
   ```sql
   SHOW COLUMNS FROM vehicles;
   ```

4. **Sincroniza el schema con la base de datos**:
   ```powershell
   npx prisma db push
   npm run db:generate
   ```

## Nota

Los `console.log` de depuración se pueden eliminar una vez que el problema se resuelva, pero son útiles para identificar exactamente qué valor se está enviando al servidor.
